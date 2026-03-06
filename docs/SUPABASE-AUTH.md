# Supabase : faire marcher Connexion & Inscription

## 1. Base de données (déjà dans `sup.md`)

Exécuter **tout le SQL** de `sup.md` dans l’éditeur SQL Supabase (SQL Editor → New query) :

- Tables : `profiles`, `courses`, `enrollments`, etc.
- **Important pour l’auth** :
  - Table **`profiles`** (liée à `auth.users`)
  - **Trigger** `on_auth_user_created` qui crée une ligne dans `profiles` à chaque inscription

Sans ce trigger, après inscription l’utilisateur existe dans `auth.users` mais pas dans `profiles`, et l’app peut planter.

---

## 1b. Si tu as l’erreur « Database error saving new user » à l’inscription

C’est en général le **trigger** qui est bloqué par la RLS. Exécute le correctif suivant dans **SQL Editor** :

**Fichier à exécuter :** `supabase/migrations/fix_profiles_trigger_rls.sql`

- La fonction `handle_new_user` est recréée avec `SET search_path = public` et `ON CONFLICT` pour éviter les doublons.
- Une politique RLS `profiles_insert_trigger` permet au rôle `postgres` (qui exécute le trigger) d’insérer dans `profiles`.

Si après ça l’erreur continue : ouvre **Logs → Postgres** dans le dashboard Supabase pour voir l’erreur exacte. Dans certains projets le rôle n’est pas `postgres` mais `supabase_admin` : tu peux alors remplacer `TO postgres` par `TO supabase_admin` dans le script.

---

## 2. Dashboard Supabase → Authentication

### 2.1 Providers (fournisseurs)

1. **Authentication** → **Providers**
2. **Email** : activé par défaut. Garder **Enable Email provider** coché.
3. Optionnel : désactiver **Confirm email** en développement pour se connecter tout de suite sans clic dans l’email.

### 2.2 URL Configuration (obligatoire)

1. **Authentication** → **URL Configuration**
2. **Site URL** : l’URL de ton app  
   - En local : `http://localhost:5173`  
   - En prod : `https://ton-app.vercel.app`
3. **Redirect URLs** : ajouter les URLs autorisées après login (une par ligne), par ex. :
   - `http://localhost:5173/**`
   - `http://localhost:5173/Profile`
   - `https://ton-app.vercel.app/**`
   - `https://ton-app.vercel.app/Profile`

Sans ces URLs, Supabase peut bloquer la redirection après connexion.

### 2.3 Email templates (optionnel)

Sous **Authentication** → **Email Templates** tu peux personnaliser :

- **Confirm signup** : texte du mail de confirmation d’inscription
- **Magic Link** : si tu utilises le lien magique plus tard

Tu peux laisser les templates par défaut.

---

## 3. Récap checklist

- [ ] SQL de `sup.md` exécuté (tables + trigger `handle_new_user`)
- [ ] **Authentication** → **Providers** : Email activé
- [ ] **Authentication** → **URL Configuration** : **Site URL** et **Redirect URLs** renseignés (local + prod)
- [ ] En dev : option **Confirm email** désactivée si tu veux te connecter sans confirmer l’email

Après ça, connexion et inscription doivent fonctionner depuis l’app (page Profil : formulaire Connexion / Inscription).
