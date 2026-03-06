# FasoCademy

Plateforme de formation en ligne au Burkina Faso. Cours en développement web, data, cybersécurité, bureautique. Paiement Orange Money, Moov Money, Wave. Certificats reconnus. 100 % en français.

---

## Lancer le projet

1. Cloner le dépôt et se placer dans le répertoire du projet.
2. Installer les dépendances : `npm install`
3. Créer un fichier `.env.local` avec les variables suivantes :

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# CinetPay + URL publique pour les webhooks de paiement
VITE_CINETPAY_API_KEY=your_cinetpay_api_key
VITE_CINETPAY_SITE_ID=your_cinetpay_site_id
VITE_API_URL=https://your-backend-or-edge-functions-url
```

4. Lancer l’app : `npm run dev`

---

## Connexion / Inscription (Supabase)

Configurer Supabase comme indiqué dans **`docs/SUPABASE-AUTH.md`** (URLs, trigger `profiles`, etc.).

---

## Chat ARIA (DeepSeek)

Le chat utilise la route API Vercel `api/chat.js` (clé DeepSeek côté serveur).

- **En prod (Vercel)** : dans le dashboard Vercel → Settings → Environment Variables, ajouter `DEEPSEEK_API_KEY` et `VITE_API_URL` = l’URL de l’app (ex. `https://fasocademy.bf`).
- **En local** : lancer `vercel dev`, puis dans `.env.local` mettre `VITE_API_URL=http://localhost:3000` pour que le front appelle l’API locale.

---

## Build & déploiement

- Build : `npm run build`
- Sortie : dossier `dist` (déploiement Vercel ou autre hébergeur statique).
