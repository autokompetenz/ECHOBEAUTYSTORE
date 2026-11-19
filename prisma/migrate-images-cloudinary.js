require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { prisma } = require('../lib/prisma.js');

const IMAGE_FIELDS = ['imageUrl', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'imageUrl5'];
const FOLDER = process.env.CLOUDINARY_FOLDER || 'echobeautystore/products';
const MAPPING_FILE = process.env.MAPPING_FILE || '/tmp/opencode/cloudinary-image-map.json';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function safePublicId(productId, index, url) {
  let base = 'image';
  try {
    base = path.basename(new URL(url).pathname) || base;
  } catch (_) { /* URL invalide : on garde le fallback */ }
  base = base.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
  return `product-${productId}-${index}-${base}`;
}

async function uploadImage(url, publicId) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: FOLDER,
    public_id: publicId,
    resource_type: 'image',
    overwrite: true,
  });
  return result.secure_url;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { OR: IMAGE_FIELDS.map(field => ({ [field]: { not: null } })) },
    orderBy: { id: 'asc' },
  });

  const totalImages = products.reduce((count, product) =>
    count + IMAGE_FIELDS.filter(field => product[field]).length, 0);

  console.log(`Migration Cloudinary : ${products.length} produits, ${totalImages} images`);
  console.log(`Dossier Cloudinary : ${FOLDER}`);

  const mapping = {};
  let migrated = 0;
  let skipped = 0;
  const errors = [];

  for (const product of products) {
    const updates = {};

    for (const field of IMAGE_FIELDS) {
      const url = product[field];
      if (!url) continue;
      if (url.includes('cloudinary.com')) {
        skipped++;
        continue;
      }

      const publicId = safePublicId(product.id, field, url);
      try {
        const newUrl = await uploadImage(url, publicId);
        updates[field] = newUrl;
        mapping[url] = newUrl;
        migrated++;
        console.log(`[${migrated}/${totalImages}] produit ${product.id} · ${field} → OK`);
      } catch (error) {
        errors.push({ productId: product.id, field, url, error: error.message });
        console.error(`✗ produit ${product.id} · ${field} : ${error.message}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({ where: { id: product.id }, data: updates });
    }
  }

  await fs.mkdir(path.dirname(MAPPING_FILE), { recursive: true });
  await fs.writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2));

  console.log(`\nTerminé : ${migrated} uploadées, ${skipped} déjà sur Cloudinary, ${errors.length} erreurs`);
  console.log(`Mapping sauvegardé : ${MAPPING_FILE}`);
  if (errors.length > 0) {
    console.error('Erreurs détaillées :', JSON.stringify(errors, null, 2));
    process.exitCode = 1;
  }
}

main()
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
