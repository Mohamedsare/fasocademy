-- Table course_packs (packs de cours)
CREATE TABLE IF NOT EXISTS course_packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  thumbnail_url TEXT,
  instructor_email TEXT NOT NULL,
  instructor_name TEXT,
  course_ids JSONB DEFAULT '[]',
  course_titles JSONB DEFAULT '[]',
  total_price_cfa NUMERIC,
  pack_price_cfa NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC,
  total_hours NUMERIC,
  total_lessons INTEGER,
  highlights JSONB DEFAULT '[]',
  badge_label TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  total_purchases INTEGER DEFAULT 0,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS : lecture publique pour packs publiés
ALTER TABLE course_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_packs_public_read" ON course_packs;
CREATE POLICY "course_packs_public_read" ON course_packs
  FOR SELECT USING (status = 'published');

-- RLS : formateurs peuvent créer/modifier leurs packs
DROP POLICY IF EXISTS "course_packs_instructor_write" ON course_packs;
CREATE POLICY "course_packs_instructor_write" ON course_packs
  FOR ALL USING (
    instructor_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
