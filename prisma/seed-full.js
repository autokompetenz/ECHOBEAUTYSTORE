const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = require('./catalog.js');

// Map d'images par sous-catégorie (placeholders — à remplacer par vos photos)
const subImages = {
  // Remise en forme
  'Haltères & poids':        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'Tapis & cardio':          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  'Accessoires fitness':     'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  'Massage & récupération':  'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
  'Compléments alimentaires':'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
  'Équipement de sport':     'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  'Suivi & balance':         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  // Instruments de massage
  'Massage électrique':      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
  'Appareils de massage':    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'Accessoires de massage':  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  'Massage thérapeutique':   'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80',
  'Massage du visage':       'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  'Bien-être & relaxation':  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  'Massage du dos':          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  // Produits amaigrissants
  'Brûleurs de graisse':     'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  'Ceintures amincissantes': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'Crèmes minceur':          'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80',
  'Compléments détox':       'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
  'Tisanes & thés minceur':  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
  'Anti-cellulite':          'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
  'Gainage & affinement':    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  // Jouets adultes (18+) — images discrètes et neutres
  'Vibromasseurs':           'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
  'Accessoires érotiques':   'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
  'Lubrifiants & gels':      'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800&q=80',
  'Bien-être intime':        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  'Plaisir masculin':        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  'Kits & coffrets':         'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  'Spécial couples':         'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
};

async function main() {
  console.log('🌿 Importation du catalogue Echo Beauty Store...');

  // Désactiver les anciens produits
  const oldCount = await prisma.product.count();
  if (oldCount > 0) {
    console.log(`📦 ${oldCount} anciens produits trouvés. Désactivation...`);
    await prisma.product.updateMany({ data: { isActive: false } });
    console.log('✅ Anciens produits désactivés.');
  }

  const result = await prisma.product.createMany({
    data: products.map(p => ({
      ...p,
      imageUrl: subImages[p.subcategory] || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      isActive: true,
    })),
    skipDuplicates: false,
  });

  console.log(`✅ ${result.count} produits importés avec succès !`);
  console.log(`📊 Total produits en base : ${await prisma.product.count()}`);
}

main()
  .catch(e => { console.error('❌ Erreur :', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
