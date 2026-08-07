-- Echo Beauty Store — Supabase Schema
-- Run this in Supabase SQL Editor if Prisma migrate fails

CREATE TYPE "Role"         AS ENUM ('CLIENT', 'ADMIN');
CREATE TYPE "Category"     AS ENUM ('REMISE_EN_FORME', 'INSTRUMENTS_MASSAGE', 'PRODUITS_AMAIGRISSANTS', 'JOUETS_ADULTES');
CREATE TYPE "OrderStatus"  AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE "User" (
  "id"            SERIAL PRIMARY KEY,
  "username"      TEXT UNIQUE NOT NULL,
  "email"         TEXT UNIQUE NOT NULL,
  "password"      TEXT NOT NULL,
  "firstName"     TEXT NOT NULL,
  "lastName"      TEXT NOT NULL,
  "phone"         TEXT,
  "address"       TEXT,
  "monthlySalary" FLOAT,
  "role"          "Role" DEFAULT 'CLIENT',
  "emailVerified" BOOLEAN DEFAULT false,
  "createdAt"     TIMESTAMP DEFAULT NOW(),
  "updatedAt"     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Product" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "price"       FLOAT NOT NULL,
  "stock"       INT DEFAULT 1,
  "description" TEXT,
  "category"    "Category" NOT NULL,
  "subcategory" TEXT,
  "imageUrl"    TEXT,
  "imageUrl2"   TEXT,
  "imageUrl3"   TEXT,
  "imageUrl4"   TEXT,
  "imageUrl5"   TEXT,
  "featured"    BOOLEAN DEFAULT false,
  "isActive"    BOOLEAN DEFAULT true,
  "createdAt"   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Order" (
  "id"              SERIAL PRIMARY KEY,
  "orderNumber"     TEXT UNIQUE NOT NULL,
  "userId"          INT REFERENCES "User"("id"),               -- nullable → commandes invités
  "customerName"    TEXT,                                      -- invité : nom complet
  "customerEmail"   TEXT,                                      -- invité : email
  "customerPhone"   TEXT,                                      -- invité : téléphone
  "totalPrice"      FLOAT NOT NULL,
  "status"          "OrderStatus" DEFAULT 'pending',
  "notes"           TEXT,
  "shippingAddress" TEXT,
  "createdAt"       TIMESTAMP DEFAULT NOW(),
  "updatedAt"       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
  "id"        SERIAL PRIMARY KEY,
  "orderId"   INT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "productId" INT NOT NULL REFERENCES "Product"("id"),
  "quantity"  INT DEFAULT 1,
  "unitPrice" FLOAT NOT NULL
);

CREATE TABLE "OrderTracking" (
  "id"        SERIAL PRIMARY KEY,
  "orderId"   INT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "status"    "OrderStatus" NOT NULL,
  "comment"   TEXT,
  "updatedBy" INT REFERENCES "User"("id"),
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Cart" (
  "id"          SERIAL PRIMARY KEY,
  "userId"      INT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId"   INT NOT NULL REFERENCES "Product"("id"),
  "quantity"    INT DEFAULT 1,
  "createdAt"   TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "productId")
);

-- Prisma migrations table (required)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                  VARCHAR(36) PRIMARY KEY,
  "checksum"            VARCHAR(64) NOT NULL,
  "finished_at"         TIMESTAMP,
  "migration_name"      VARCHAR(255) NOT NULL,
  "logs"                TEXT,
  "rolled_back_at"      TIMESTAMP,
  "started_at"          TIMESTAMP DEFAULT NOW(),
  "applied_steps_count" INT DEFAULT 0
);

-- ─── Storage : bucket "products" (images produits) ────────────────────────────
-- Nécessaire pour l'upload des images depuis le panneau admin.
-- Le bucket DOIT être public pour que les URLs des images soient accessibles.
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique des images (frontend + emails)
DROP POLICY IF EXISTS "Public read products" ON storage.objects;
CREATE POLICY "Public read products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Upload / modification : réservé aux utilisateurs connectés (admin)
DROP POLICY IF EXISTS "Authenticated upload products" ON storage.objects;
CREATE POLICY "Authenticated upload products"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated update products" ON storage.objects;
CREATE POLICY "Authenticated update products"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated delete products" ON storage.objects;
CREATE POLICY "Authenticated delete products"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products');
