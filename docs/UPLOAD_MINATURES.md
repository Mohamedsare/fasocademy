# Configuration de l’upload des miniatures

## Option 1 : API Vercel (recommandé)

1. **Créer le bucket Supabase**
   - Supabase Dashboard → **Storage** → **New bucket**
   - Nom : `course-thumbnails`
   - Public : **Yes**

2. **Variables d’environnement**
   - **Vercel** : `SUPABASE_SERVICE_ROLE_KEY` (clé dans Supabase → Settings → API → service_role)
   - **Vercel / .env.local** : `VITE_API_URL` = URL du site (ex. `https://fasocademy.com` ou `http://localhost:3000` en local)

3. **Local avec API**
   - `vercel dev` ou serveur exposant `/api/upload`
   - `.env.local` : `VITE_API_URL=http://localhost:3000` (ou le port utilisé)

## Option 2 : Supabase client (sans API)

1. **Exécuter le SQL** dans Supabase → SQL Editor :
   - Fichier `supabase/migrations/create_course_thumbnails_bucket.sql`

2. **Variables**
   - `.env.local` : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (déjà configurés)

## Fallback : collage d’URL

En cas d’erreur, coller directement une URL d’image (ex. hébergée ailleurs).
