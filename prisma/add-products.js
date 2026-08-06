const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Charge le .env du projet
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

const products = require('./catalog.js');

async function main() {
  console.log('Ajout des produits...');
  const result = await prisma.product.createMany({
    data: products.map(p => ({ ...p, isActive: true })),
    skipDuplicates: true,
  });
  console.log(`✅ ${result.count} produits ajoutés (ignorés si déjà existants)`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
