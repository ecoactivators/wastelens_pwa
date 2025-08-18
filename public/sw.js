// Service Worker for Waste Lens™ PWA
const CACHE_NAME = 'waste-lens-v5';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // Cache static files first
        await cache.addAll(STATIC_CACHE_URLS);
        
        // Dynamically cache all assets in /assets/ folder
        const assetUrls = await getAssetUrls();
        if (assetUrls.length > 0) {
          await cache.addAll(assetUrls);
        }
      } catch (error) {
        console.log('Cache addAll failed:', error);
      }
    })()
  );
  self.skipWaiting();
});

// Function to dynamically discover asset URLs
async function getAssetUrls() {
  try {
    // Fetch the index.html to parse asset references
    const response = await fetch('/index.html');
    const html = await response.text();
    
    const assetUrls = [];
    
    // Extract JS files from script tags
    const scriptMatches = html.match(/<script[^>]+src="([^"]+)"/g);
    if (scriptMatches) {
      scriptMatches.forEach(match => {
        const src = match.match(/src="([^"]+)"/)[1];
        if (src.startsWith('/assets/')) {
          assetUrls.push(src);
        }
      });
    }
    
    // Extract CSS files from link tags
    const linkMatches = html.match(/<link[^>]+href="([^"]+\.css)"/g);
    if (linkMatches) {
      linkMatches.forEach(match => {
        const href = match.match(/href="([^"]+)"/)[1];
        if (href.startsWith('/assets/')) {
          assetUrls.push(href);
        }
      });
    }
    
    return assetUrls;
  } catch (error) {
    console.log('Failed to get asset URLs:', error);
    return [];
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // Try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses for assets and static files
        if (networkResponse.ok && shouldCache(event.request.url)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // If both cache and network fail, return index.html for SPA routing
        if (event.request.destination === 'document') {
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) {
            return cachedIndex;
          }
        }
        throw error;
      }
    })()
  );
});

// Determine if a URL should be cached
function shouldCache(url) {
  return url.includes('/assets/') || 
         url.endsWith('/') || 
         url.endsWith('/index.html') || 
         url.endsWith('/manifest.json');
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete all old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      
      // Claim all clients immediately
      await self.clients.claim();
    })()
  );
});