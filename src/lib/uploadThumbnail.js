/**
 * Upload thumbnail to Supabase Storage.
 * Requires a public bucket named 'course-thumbnails' in Supabase Dashboard.
 */
import { supabase } from './supabase';

const BUCKET = 'course-thumbnails';

export async function uploadThumbnailToSupabase(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(error.message || 'Échec de l\'upload. Vérifiez que le bucket "course-thumbnails" existe dans Supabase.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return { file_url: publicUrl };
}
