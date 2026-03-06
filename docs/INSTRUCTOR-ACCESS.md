# Accès formateur — FasoCademy

## Comment devenir formateur ?

1. **Créer un compte** : inscription classique sur la plateforme (page Connexion / Inscription).
2. **Demander l'accès** : aller sur la page **Devenir formateur** (lien dans le footer) et cliquer sur **« Demander l'accès formateur »** (en étant connecté).
3. **Validation** : un administrateur reçoit la demande dans **Super Admin → Demandes formateur** et peut **Accepter**.
4. **Accès** : une fois accepté, le lien **Formateur** apparaît dans la navigation ; l'utilisateur peut créer des formations, quiz, packs et voir ses analytiques.

## Côté technique

- Le profil utilisateur (table `profiles`) contient :
  - `role` : `user` | `instructor` | `admin`
  - `instructor_requested_at` : date de la demande (null si pas demandé ou déjà accepté)
- **Migration Supabase** : exécuter `supabase/migrations/add_instructor_requested_at.sql` puis `profiles_admin_update_rls.sql` pour que les admins puissent accepter les demandes.
- Les utilisateurs ne peuvent pas s'auto-attribuer le rôle `instructor` : seuls les champs autorisés sont modifiables via « Mon profil » ; la demande enregistre uniquement `instructor_requested_at`.
