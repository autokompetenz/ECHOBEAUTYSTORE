require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma.js');
const products = require('./catalog.js');

async function main() {
  console.log('Seeding Echo Beauty Store...');

  const adminPwd = await bcrypt.hash('password', 12);
  await prisma.user.upsert({
    where: { email: 'admin@echobeautystore.bj' },
    update: {},
    create: {
      username: 'admin', email: 'admin@echobeautystore.bj',
      password: adminPwd, firstName: 'Admin', lastName: 'Beauty',
      role: 'ADMIN', emailVerified: true,
    },
  });

  const clientPwd = await bcrypt.hash('password', 12);
  await prisma.user.upsert({
    where: { email: 'client@echobeautystore.bj' },
    update: {},
    create: {
      username: 'marie_ade', email: 'client@echobeautystore.bj',
      password: clientPwd, firstName: 'Marie', lastName: 'Adè',
      phone: '+229 97 00 00 00', role: 'CLIENT', emailVerified: true,
    },
  });

  await prisma.product.createMany({
    data: products.map(p => ({ ...p, isActive: true })),
    skipDuplicates: true,
  });

  console.log('✅ Admin:  admin@echobeautystore.bj / password');
  console.log('✅ Client: client@echobeautystore.bj / password');
  console.log(`✅ ${products.length} produits créés (4 catégories)`);
  console.log('🎉 Seeding terminé !');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
