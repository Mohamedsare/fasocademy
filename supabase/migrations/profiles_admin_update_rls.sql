-- Permettre aux admins de mettre à jour n'importe quel profil (ex: accepter une demande formateur)
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (true);
