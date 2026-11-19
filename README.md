# Echo Beauty Store — E-commerce de Cosmétiques

## Structure (monorepo unifié pour Vercel)
```
site_cosmetique/
├── api/              ← Serverless functions (backend)
│   ├── auth/         ← login, register, me
│   ├── products/     ← index, [id], categories
│   ├── cart/         ← index, count, [productId]
│   ├── orders/       ← index, my, [id], track/[orderNumber]
│   ├── admin/        ← stats, clients
│   └── user/         ← profile, password
├── lib/              ← Shared: prisma.js, middleware.js, helpers.js
├── prisma/           ← schema.prisma, seed.js
├── src/              ← React frontend
│   ├── components/   ← Navbar, ProductCard, Toast, Chatbot, UI, AdminSidebar
│   ├── pages/        ← Home, Catalog, ProductDetails, Cart, Track...
│   │   └── admin/    ← AdminDashboard, AdminOrders...
│   ├── store/        ← Zustand (auth, cart, toast, lang)
│   ├── services/     ← api.js (axios)
│   └── utils/        ← helpers.js, i18n.js
├── vercel.json       ← Routes + CORS headers
├── package.json      ← Unified dependencies
├── legacy-schema.sql   ← Schéma SQL historique (source de vérité : prisma/schema.prisma)
└── .env.example        ← Liste des variables d'environnement
```

## Déploiement sur Vercel

### 1. Base de données (Neon)
1. [neon.tech](https://neon.tech) → New project (region proche des utilisateurs)
2. Dashboard → **Connection Details** → copier les deux chaînes :
   - `DATABASE_URL` : endpoint avec `-pooler` (runtime / API Vercel)
   - `DIRECT_URL` : endpoint sans `-pooler` (Prisma)
3. Créer les tables : `npx prisma db push` (ou `prisma migrate deploy` une fois les migrations versionnées)

### Stockage des images (Cloudinary)
Les photos produits sont uploadées dans le folder `echobeautystore/products` via l'API Cloudinary.
Configurer `CLOUDINARY_URL` (ou `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET`).
Migration ponctuelle depuis d'anciennes URLs publiques : `npm run migrate:images`
(le mapping ancienne URL → nouvelle URL est écrit dans `/tmp/opencode/cloudinary-image-map.json`).

### 2. GitHub
```bash
git init && git add . && git commit -m "🚀 Echo Beauty Store"
git remote add origin https://github.com/VOTRE_USER/site_cosmetique.git
git push -u origin main
```

### 3. Vercel
1. [vercel.com](https://vercel.com) → Import GitHub repo
2. **Root Directory : laisser vide** (à la racine)
3. Framework: **Vite**
4. Environment Variables → ajouter (voir `.env.example`) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL **poolée** Neon : `postgresql://USER:PWD@ENDPOINT-pooler.REGION.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | URL directe Neon (sans `-pooler`) — utilisée par Prisma |
| `CLOUDINARY_URL` | **Option recommandée** : `cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>` — une seule variable, **jamais côté client** |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Alternative uniquement si `CLOUDINARY_URL` n'est pas utilisée |
| `JWT_SECRET` | Chaîne aléatoire de 64+ caractères |
| `ADMIN_PIN` | Code PIN à 4 chiffres pour l'accès admin |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Paramètres SMTP pour les emails transactionnels |
| `FROM_NAME`, `FROM_EMAIL`, `APP_URL` | Expéditeur et URL publique du site |

5. Deploy → ✅ https://echobeautystore.vercel.app

### 4. Seeder (une seule fois)
Le schéma étant déjà créé via `prisma db push`, il suffit de lancer le seed (une seule fois) :
```bash
# Depuis votre machine avec .env configuré
npm run seed
```

## Comptes demo
- Admin : Code PIN (défini dans la variable d'environnement ADMIN_PIN)
- Client : Inscription via le formulaire

## Catégories de produits
- **REMISE_EN_FORME** 💪 : Haltères & poids, tapis & cardio, accessoires fitness, massage & récupération, compléments alimentaires, équipement de sport, suivi & balance
- **INSTRUMENTS_MASSAGE** 💆 : Massage électrique, appareils de massage, accessoires de massage, massage thérapeutique, massage du visage, bien-être & relaxation, massage du dos
- **PRODUITS_AMAIGRISSANTS** ⚖️ : Brûleurs de graisse, ceintures amincissantes, crèmes minceur, compléments détox, tisanes & thés minceur, anti-cellulite, gainage & affinement
- **JOUETS_ADULTES** 🔞 : Vibromasseurs, accessoires érotiques, lubrifiants & gels, bien-être intime, plaisir masculin, kits & coffrets, spécial couples — réservé aux adultes (18+), livraison discrète

## Contact
- **Email** : contact@echobeautystore.bj
- **WhatsApp** : +229 66 34 42 27
- **Adresse** : Cotonou, Bénin
