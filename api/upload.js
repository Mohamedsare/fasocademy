// Route API Vercel : upload miniature via Supabase Storage (service role)
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'course-thumbnails';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const base64 = body.image || body.base64;
    const ext = (body.ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';

    if (!base64) return res.status(400).json({ error: 'image (base64) requis' });

    const match = base64.match(/^data:image\/\w+;base64,(.+)$/);
    const dataBase64 = match ? match[1] : base64;
    const buffer = Buffer.from(dataBase64, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image trop volumineuse (max 5 Mo)' });
    }

    const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${safeExt}`;
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: `image/${safeExt}`,
      upsert: false,
    });

    if (error) {
      if (String(error.message || '').includes('Bucket not found') || String(error.message || '').includes('not found')) {
        return res.status(400).json({
          error: 'Créez le bucket "course-thumbnails" dans Supabase : Storage > New bucket > course-thumbnails (public)',
        });
      }
      throw error;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return res.status(200).json({ file_url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err?.message || 'Upload failed' });
  }
}
