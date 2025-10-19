import { supabase } from './supabase';

export class ImageStorageService {
  private bucketName = 'waste-snaps';

  async uploadImage(
    userId: string,
    imageDataUrl: string,
    snapId: string
  ): Promise<string | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const base64Data = imageDataUrl.split(',')[1];
      const blob = this.base64ToBlob(base64Data, 'image/jpeg');

      const fileName = `${userId}/${snapId}.jpg`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Image upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const path = this.extractPathFromUrl(imageUrl);

      if (!path) {
        throw new Error('Invalid image URL');
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        console.error('Image deletion error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Image deletion failed:', error);
      return false;
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export const imageStorageService = new ImageStorageService();
