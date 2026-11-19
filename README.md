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
├── supabase-schema.sql ← Schéma SQL historique (les tables sont gérées par prisma/schema.prisma)
└── .env.example        ← Liste des variables d'environnement
```

## Déploiement sur Vercel

### 1. Base de données (Neon)
1. [neon.tech](https://neon.tech) → New project (region proche des utilisateurs)
2. Dashboard → **Connection Details** → copier les deux chaînes :
   - `DATABASE_URL` : endpoint avec `-pooler` (runtime / API Vercel)
   - `DIRECT_URL` : endpoint sans `-pooler` (Prisma)
3. Créer les tables : `npx prisma db push` (ou `prisma migrate deploy` une fois les migrations versionnées)

### Stockage des images (Supabase, temporaire)
Les photos produits utilisent encore Supabase Storage (`bucket products`, public).
Garder `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` tant que le passage à Vercel Blob n'est pas effectué.
Le bucket et ses policies sont définis à la fin de `supabase-schema.sql` (section `storage.*`).

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
| `SUPABASE_URL` | `https://<PROJECT_REF>.supabase.co` (upload des images produits, temporaire) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé `service_role` Supabase (stockage images) — **jamais côté client** |
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
