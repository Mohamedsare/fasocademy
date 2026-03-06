-- ============================================
-- FASOLEARN - Schéma Supabase complet
-- À exécuter dans Supabase → SQL Editor → New query
-- Script idempotent : peut être exécuté plusieurs fois sans erreur
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (users étendus)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'instructor', 'admin')),
  bio TEXT,
  phone TEXT,
  payment_method TEXT,
  payment_phone TEXT,
  streak_days INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  avatar_url TEXT,
  instructor_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: courses
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  long_description TEXT,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  category TEXT,
  level TEXT DEFAULT 'debutant' CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  language TEXT DEFAULT 'Français',
  is_free BOOLEAN DEFAULT FALSE,
  price_cfa NUMERIC DEFAULT 0,
  original_price_cfa NUMERIC,
  instructor_email TEXT NOT NULL,
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_photo_url TEXT,
  duration_hours NUMERIC,
  total_lessons INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  learning_objectives JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  includes JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  sections JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  has_certificate BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  course_title TEXT,
  progress_percent NUMERIC DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]',
  current_lesson_id TEXT,
  notes JSONB DEFAULT '[]',
  quiz_scores JSONB DEFAULT '[]',
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_time_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  course_id UUID REFERENCES courses(id),
  course_title TEXT,
  amount_cfa NUMERIC NOT NULL,
  method TEXT DEFAULT 'orange_money' CHECK (method IN ('orange_money', 'moov_money', 'wave', 'card', 'manual')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_ref TEXT,
  instructor_email TEXT,
  commission_percent NUMERIC DEFAULT 20,
  instructor_amount NUMERIC,
  platform_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: reviews
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  rating NUMERIC NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: certificates
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  course_id UUID REFERENCES courses(id),
  course_title TEXT,
  instructor_name TEXT,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  verification_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link_page TEXT,
  link_params TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: comments
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  upvotes INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT FALSE,
  is_instructor_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: testimonials
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT,
  city TEXT,
  content TEXT NOT NULL,
  rating NUMERIC CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: quizzes
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT,
  title TEXT NOT NULL,
  instructor_email TEXT,
  passing_score NUMERIC DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 0,
  questions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: assignments
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT,
  title TEXT NOT NULL,
  instructions TEXT,
  instructor_email TEXT,
  max_score NUMERIC DEFAULT 100,
  due_days INTEGER DEFAULT 7,
  rubric JSONB DEFAULT '[]',
  submissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: course_packs
-- ============================================
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
  pack_price_cfa NUMERIC NOT NULL,
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

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own" ON profiles;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "courses_public_read" ON courses;
CREATE POLICY "courses_public_read" ON courses FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "courses_instructor_write" ON courses;
CREATE POLICY "courses_instructor_write" ON courses FOR ALL USING (
  instructor_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "enrollments_own" ON enrollments;
CREATE POLICY "enrollments_own" ON enrollments FOR ALL USING (
  user_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "payments_own" ON payments;
CREATE POLICY "payments_own" ON payments FOR SELECT USING (
  user_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (
  user_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "comments_read" ON comments;
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_write" ON comments;
CREATE POLICY "comments_write" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "reviews_read" ON reviews;
CREATE POLICY "reviews_read" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_write" ON reviews;
CREATE POLICY "reviews_write" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "testimonials_approved" ON testimonials;
CREATE POLICY "testimonials_approved" ON testimonials FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "certificates_own" ON certificates;
CREATE POLICY "certificates_own" ON certificates FOR SELECT USING (
  user_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- ============================================
-- TRIGGER: création du profil à l'inscription
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "profiles_insert_trigger" ON public.profiles;
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  TO postgres
  WITH CHECK (true);

-- ============================================
-- INDEX (performances)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_email);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_email, is_read);
