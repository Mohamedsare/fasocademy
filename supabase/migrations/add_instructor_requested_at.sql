-- Demande d'accès formateur : date de la demande (null = pas demandé ou déjà traité)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instructor_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.instructor_requested_at IS 'Date de demande d''accès formateur; null après approbation ou si jamais demandé.';
