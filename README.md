# El Nadhour — frontend

React (Vite) + Tailwind.

## Développement local

```bash
npm install
npm run dev
```

Le proxy Vite envoie `/api` et `/uploads` vers `http://localhost:5000` (voir `vite.config.js`).

## Variables d’environnement (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | URL publique du **backend** (sans `/api`), ex. `https://ton-api.onrender.com`. Les images `/uploads/...` utilisent la même origine. |

Créer le fichier depuis l’exemple : `cp .env.example .env` puis renseigner pour les builds de preview si besoin.

## Build

```bash
npm run build
```

Dossier de sortie : `dist`. Sur Vercel : framework **Vite**, build `npm run build`, output `dist`.

## CORS

Le backend doit autoriser l’URL exacte du site Vercel dans `ALLOWED_ORIGINS` (voir README du backend).
