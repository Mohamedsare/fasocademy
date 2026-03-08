-- ============================================================
-- UPLOAD MINIATURES : 2 options
-- ============================================================
-- Option A (recommandé) : API Vercel (service role, bypass RLS)
-- 1. Créer le bucket dans Supabase : Storage > New bucket > "course-thumbnails" (public)
-- 2. Ajouter SUPABASE_SERVICE_ROLE_KEY dans Vercel
-- 3. VITE_API_URL = https://ton-domaine.com
--
-- Option B : Upload client direct (nécessite politiques ci-dessous)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "instructors_upload_thumbnails" ON storage.objects;
CREATE POLICY "instructors_upload_thumbnails" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "public_read_thumbnails" ON storage.objects;
CREATE POLICY "public_read_thumbnails" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'course-thumbnails');
