-- ============================================
-- FIX: "Database error saving new user" à l'inscription
-- Exécuter ce script dans Supabase → SQL Editor (New query).
-- ============================================

-- 1) Fonction du trigger avec search_path et COALESCE pour éviter NULL
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

-- 2) Politique RLS pour que le trigger puisse insérer (rôle qui exécute = postgres en général)
DROP POLICY IF EXISTS "profiles_insert_trigger" ON public.profiles;
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  TO postgres
  WITH CHECK (true);

-- 3) Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
