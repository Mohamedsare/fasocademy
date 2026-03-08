/**
 * Upload thumbnail - Supabase Storage ou ImgBB (fallback)
 */
import { supabase } from './supabase';

const BUCKET = 'course-thumbnails';

async function uploadToSupabase(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${safeExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || `image/${safeExt}`,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { file_url: urlData.publicUrl };
}

async function uploadToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) throw new Error('VITE_IMGBB_API_KEY requis pour le fallback ImgBB.');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      const form = new FormData();
      form.append('key', apiKey);
      form.append('image', base64);

      fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form })
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.url) resolve({ file_url: json.data.url });
          else reject(new Error(json.error?.message || 'ImgBB upload failed'));
        })
        .catch(reject);
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.readAsDataURL(file);
  });
}

export async function uploadThumbnailToSupabase(file) {
  if (!file || !file.size) throw new Error('Fichier invalide.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image trop volumineuse (max 5 Mo).');

  try {
    return await uploadToSupabase(file);
  } catch (supabaseError) {
    const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (imgbbKey) {
      try {
        return await uploadToImgBB(file);
      } catch (imgbbError) {
        throw new Error(`Upload échoué. Supabase: ${supabaseError.message}. ImgBB: ${imgbbError.message}`);
      }
    }
    const msg = supabaseError?.message || 'Erreur Supabase';
    if (msg.includes('Bucket not found') || msg.includes('not found')) {
      throw new Error('Créez le bucket "course-thumbnails" dans Supabase (Storage > New bucket).');
    }
    if (msg.includes('policy') || msg.includes('row-level')) {
      throw new Error('Politiques Storage manquantes. Exécutez le SQL dans supabase/migrations/create_course_thumbnails_bucket.sql');
    }
    throw new Error(msg);
  }
}
