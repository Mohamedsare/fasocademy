-- Table site_settings : clé-valeur pour config (bannière page d'accueil, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- RLS : tout le monde peut lire (affichage page d'accueil)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT
  TO public
  USING (true);

-- Seuls les admins peuvent modifier (INSERT, UPDATE)
DROP POLICY IF EXISTS "site_settings_admin_insert" ON site_settings;
CREATE POLICY "site_settings_admin_insert"
  ON site_settings FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "site_settings_admin_update" ON site_settings;
CREATE POLICY "site_settings_admin_update"
  ON site_settings FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Valeur par défaut pour la bannière (optionnel)
INSERT INTO site_settings (key, value)
VALUES ('hero_banner_url', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80')
ON CONFLICT (key) DO NOTHING;
