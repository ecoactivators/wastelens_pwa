import React from 'react';

const LINK_STYLE: React.CSSProperties = {
  color: '#57ebdd',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  cursor: 'pointer',
  fontWeight: 500,
};

type Segment =
  | { type: 'text'; value: string }
  | { type: 'mdLink'; text: string; url: string }
  | { type: 'phone'; display: string; digits: string }
  | { type: 'bareUrl'; url: string };

const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
const PHONE = /(?:Call:\s*)(\(\d{3}\)\s*\d{3}-\d{4})/g;
const BARE_URL = /(?<!\()https?:\/\/[^\s)>]+/g;

function parseSegments(text: string): Segment[] {
  // Build a combined pattern that tags each match type
  const combined = new RegExp(
    `(${MD_LINK.source})|(${PHONE.source})|(${BARE_URL.source})`,
    'g'
  );

  const segments: Segment[] = [];
  let last = 0;

  for (const match of text.matchAll(combined)) {
    const start = match.index ?? 0;

    if (start > last) {
      segments.push({ type: 'text', value: text.slice(last, start) });
    }

    const full = match[0];

    if (full.startsWith('[')) {
      // Markdown link: [text](url)
      const inner = full.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (inner) {
        segments.push({ type: 'mdLink', text: inner[1], url: inner[2] });
      } else {
        segments.push({ type: 'text', value: full });
      }
    } else if (/^Call:\s*/i.test(full)) {
      const phoneMatch = full.match(/(\(\d{3}\)\s*\d{3}-\d{4})/);
      if (phoneMatch) {
        const digits = phoneMatch[1].replace(/\D/g, '');
        segments.push({ type: 'phone', display: full, digits });
      } else {
        segments.push({ type: 'text', value: full });
      }
    } else {
      segments.push({ type: 'bareUrl', url: full });
    }

    last = start + full.length;
  }

  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }

  return segments;
}

export function renderAgentMessage(content: string): React.ReactNode[] {
  const lines = content.split('\n');

  return lines.flatMap((line, lineIdx) => {
    const segments = parseSegments(line);
    const nodes: React.ReactNode[] = segments.map((seg, i) => {
      const key = `${lineIdx}-${i}`;
      switch (seg.type) {
        case 'text':
          return <React.Fragment key={key}>{seg.value}</React.Fragment>;
        case 'mdLink':
          return (
            <a key={key} href={seg.url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
              {seg.text}
            </a>
          );
        case 'phone':
          return (
            <a key={key} href={`tel:+1${seg.digits}`} style={LINK_STYLE}>
              {seg.display}
            </a>
          );
        case 'bareUrl':
          return (
            <a key={key} href={seg.url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
              {seg.url}
            </a>
          );
      }
    });

    if (lineIdx < lines.length - 1) {
      nodes.push(<br key={`br-${lineIdx}`} />);
    }

    return nodes;
  });
}
