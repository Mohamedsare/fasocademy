-- Bucket pour les miniatures des cours
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Politique: les utilisateurs authentifiés peuvent uploader
DROP POLICY IF EXISTS "instructors_upload_thumbnails" ON storage.objects;
CREATE POLICY "instructors_upload_thumbnails" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-thumbnails');

-- Politique: lecture publique
DROP POLICY IF EXISTS "public_read_thumbnails" ON storage.objects;
CREATE POLICY "public_read_thumbnails" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'course-thumbnails');
