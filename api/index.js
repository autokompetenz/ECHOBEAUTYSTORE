require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { prisma } = require('../lib/prisma.js');
const { sendWelcomeEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendAdminOrderNotification } = require('../lib/mailer.js');

const app = express();

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL manquant');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seuls les fichiers image sont autorisés'), false);
  }
});

async function uploadProductImages(files) {
  const sorted = [...files].sort((a, b) =>
    a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
  );
  const results = await Promise.all(
    sorted.map(async (file, index) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${index}-${safeName}`;
      const { error, data } = await supabase.storage
        .from('products')
        .upload(fileName, file.buffer, { contentType: file.mimetype });
      if (error) { console.error('Supabase upload error:', JSON.stringify(error)); throw error; }
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
      return { index, url: publicUrlData.publicUrl };
    })
  );
  const urls = {};
  results.forEach(({ index, url }) => {
    urls[index === 0 ? 'imageUrl' : `imageUrl${index + 1}`] = url;
  });
  return urls;
}

function parseProductFormBody(data) {
  return {
    name: data.name,
    price: Number(data.price),
    stock: Number(data.stock) || 1,
    description: data.description || null,
    category: data.category,
    subcategory: data.subcategory || null,
    weight: data.weight || null,
    volume: data.volume || null,
    featured: data.featured === 'true' || data.featured === true,
    isActive: data.isActive !== 'false' && data.isActive !== false,
    imageUrl: data.imageUrl || null,
  };
}

const corsOptions = {
  origin: ['https://echobeautystore.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CMD-${year}${month}${day}-${random}`;
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isAdmin) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id:true, username:true, email:true, firstName:true, lastName:true, role:true } });
      if (admin) { req.user = admin; return next(); }
      return res.status(401).json({ error: 'Aucun administrateur trouvé' });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id:true, username:true, email:true, firstName:true, lastName:true, role:true, phone:true, address:true, monthlySalary:true },
    });
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès administrateur requis' });
  next();
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api', (req, res) => {
  res.json({ status: 'ok', service: 'Echo Beauty Store API', version: '2.0.0', time: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: 'Code PIN requis' });
    if (pin !== process.env.ADMIN_PIN) return res.status(401).json({ error: 'Code PIN incorrect' });
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Connexion réussie', token, user: { id:1, username:'admin', email:'contact@echobeautystore.bj', firstName:'Admin', lastName:'Beauty', role:'ADMIN' } });
  } catch (e) { console.error('Login error:', e); res.status(500).json({ error: 'Erreur serveur' }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, monthlySalary } = req.body;
    if (!username || !email || !password || !firstName || !lastName) return res.status(400).json({ error: 'Champs obligatoires manquants' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (min. 8 caractères)' });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ error: existing.email === email ? 'Email déjà utilisé' : "Nom d'utilisateur déjà pris" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, password: hashed, firstName, lastName, phone: phone || null, monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null },
      select: { id:true, username:true, email:true, firstName:true, lastName:true, role:true, phone:true, monthlySalary:true },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    try {
      await sendWelcomeEmail({ email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr);
    }
    res.status(201).json({ message: 'Compte créé avec succès', token, user });
  } catch (e) { console.error('Register error:', e); res.status(500).json({ error: 'Erreur serveur' }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// ─── Products ─────────────────────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, featured, limit, page = 1, sort } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = page ? (parseInt(page) - 1) * (take || 12) : 0;
    const where = { isActive: true };

    if (category) where.category = category;
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
    if (featured !== undefined) where.featured = featured === 'true';

    const orderBy =
      sort === 'price_asc'  ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
                              { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, take, skip, orderBy }),
      prisma.product.count({ where })
    ]);

    res.json({ products, total });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', products: [], total: 0 });
  }
});

app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = [
      { category: 'REMISE_EN_FORME', label: 'Remise en forme' },
      { category: 'INSTRUMENTS_MASSAGE', label: 'Instruments de massage' },
      { category: 'PRODUITS_AMAIGRISSANTS', label: 'Produits amaigrissants' },
      { category: 'JOUETS_ADULTES', label: 'Jouets pour adultes' }
    ];
    res.json({ categories });
  } catch (error) {
    console.error('GET /api/products/categories error:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', categories: [] });
  }
});

app.get('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ products, total: products.length });
  } catch (error) {
    console.error('Admin products list error:', error);
    res.status(500).json({ error: 'Erreur serveur', products: [], total: 0 });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId) || productId <= 0) return res.status(400).json({ error: 'Invalid product ID - must be a positive number' });
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { _count: { select: { cartItems: true } } }
    });
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ product });
  } catch (error) {
    console.error('GET /api/products/:id error:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, upload.any(), async (req, res) => {
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    const requiredFields = ['name', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) return res.status(400).json({ error: `Champs obligatoires manquants: ${missingFields.join(', ')}` });

    const productData = {
      name: req.body.name, price: Number(req.body.price),
      stock: Number(req.body.stock) || 1, description: req.body.description || null,
      category: req.body.category, subcategory: req.body.subcategory || null,
      featured: req.body.featured === 'true' || req.body.featured === true,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
    };

    if (req.files && req.files.length > 0) {
      try { Object.assign(productData, await uploadProductImages(req.files)); }
      catch (uploadErr) { console.error('Supabase upload error:', uploadErr); return res.status(500).json({ error: "Erreur lors de l'upload des images" }); }
    }

    const product = await prisma.product.create({ data: productData });
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, upload.any(), async (req, res) => {
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId) || productId <= 0) return res.status(400).json({ error: 'Invalid product ID - must be a positive number' });

    const requiredFields = ['name', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) return res.status(400).json({ error: `Champs obligatoires manquants: ${missingFields.join(', ')}` });

    const productData = {
      name: req.body.name, price: Number(req.body.price),
      stock: Number(req.body.stock) || 1, description: req.body.description || null,
      category: req.body.category, subcategory: req.body.subcategory || null,
      featured: req.body.featured === 'true' || req.body.featured === true,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
    };

    if (req.files && req.files.length > 0) {
      try { Object.assign(productData, await uploadProductImages(req.files)); }
      catch (uploadErr) { console.error('Supabase upload error:', uploadErr); return res.status(500).json({ error: "Erreur lors de l'upload des images" }); }
    }

    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      existingImages.forEach((url, idx) => {
        const fieldName = idx === 0 ? 'imageUrl' : `imageUrl${idx + 1}`;
        if (!productData[fieldName]) productData[fieldName] = url;
      });
    }

    const product = await prisma.product.update({ where: { id: productId }, data: productData });
    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
});

app.patch('/api/products/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });
    const product = await prisma.product.update({ where: { id: productId }, data: { isActive: !existing.isActive } });
    res.json({ product });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId) || productId <= 0) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });
    await prisma.$transaction([
      prisma.cart.deleteMany({ where: { productId } }),
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (e) { console.error('Delete product error:', e); res.status(500).json({ error: 'Erreur lors de la suppression du produit' }); }
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.cart.findMany({
      where: { userId: req.user.id }, include: { product: true }, orderBy: { createdAt: 'desc' },
    });
    const cartItems = items.map(item => ({ id: item.id, quantity: item.quantity, productId: item.productId, product: item.product }));
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({ cartItems, total, count: cartItems.length });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.get('/api/cart/count', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.cart.count({ where: { userId: req.user.id } });
    res.json({ count });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Produit non trouvé' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Stock insuffisant' });

    const existingItem = await prisma.cart.findFirst({ where: { userId: req.user.id, productId: parseInt(productId) } });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) return res.status(400).json({ error: 'Stock insuffisant' });
      await prisma.cart.update({ where: { id: existingItem.id }, data: { quantity: newQuantity } });
    } else {
      await prisma.cart.create({ data: { userId: req.user.id, productId: parseInt(productId), quantity } });
    }

    const updatedCart = await prisma.cart.findMany({ where: { userId: req.user.id }, include: { product: true }, orderBy: { createdAt: 'desc' } });
    const cartItems = updatedCart.map(item => ({ id: item.id, quantity: item.quantity, productId: item.productId, product: item.product }));
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.status(existingItem ? 200 : 201).json({ cartItems, total, count: cartItems.length });
  } catch (e) {
    console.error('POST /api/cart error:', e);
    res.status(500).json({ error: e.message || 'Erreur serveur' });
  }
});

app.put('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await prisma.cart.findFirst({ where: { userId: req.user.id, productId: parseInt(req.params.productId) }, include: { product: true } });
    if (!cartItem) return res.status(404).json({ error: 'Article non trouvé dans le panier' });
    if (quantity > cartItem.product.stock) return res.status(400).json({ error: 'Stock insuffisant' });
    await prisma.cart.update({ where: { id: cartItem.id }, data: { quantity } });
    const updatedCart = await prisma.cart.findMany({ where: { userId: req.user.id }, include: { product: true }, orderBy: { createdAt: 'desc' } });
    const cartItems = updatedCart.map(item => ({ id: item.id, quantity: item.quantity, productId: item.productId, product: item.product }));
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({ cartItems, total, count: cartItems.length });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const productIdNum = Number(req.params.productId);
    if (isNaN(productIdNum) || productIdNum <= 0) return res.status(400).json({ error: 'Invalid product ID - must be a positive number' });
    await prisma.cart.deleteMany({ where: { userId: req.user.id, productId: productIdNum } });
    const cartCount = await prisma.cart.count({ where: { userId: req.user.id } });
    res.json({ success: true, cartCount });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// ─── Orders ───────────────────────────────────────────────────────────────────

// ─── Commande invité (sans compte) ───────────────────────────────────────────

app.post('/api/orders/guest', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, notes, items } = req.body;

    if (!customerName?.trim()) return res.status(400).json({ error: 'Nom requis' });
    if (!customerEmail?.trim()) return res.status(400).json({ error: 'Email requis' });
    if (!customerPhone?.trim()) return res.status(400).json({ error: 'Téléphone requis' });
    if (!shippingAddress?.trim()) return res.status(400).json({ error: 'Adresse de livraison requise' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

    // Vérifier stock et récupérer les produits
    const productIds = items.map(i => parseInt(i.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });

    for (const item of items) {
      const product = products.find(p => p.id === parseInt(item.productId));
      if (!product) return res.status(404).json({ error: `Produit introuvable : ${item.productId}` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Stock insuffisant : ${product.name}` });
    }

    const subtotal = items.reduce((s, i) => {
      const product = products.find(p => p.id === parseInt(i.productId));
      return s + (product?.price || 0) * i.quantity;
    }, 0);

    // Générer numéro de commande unique
    let orderNumber, exists = true;
    while (exists) {
      orderNumber = generateOrderNumber();
      exists = !!(await prisma.order.findUnique({ where: { orderNumber } }));
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          notes: notes || null,
          totalPrice: subtotal,
        },
      });

      await tx.orderItem.createMany({
        data: items.map(i => ({
          orderId: newOrder.id,
          productId: parseInt(i.productId),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.orderTracking.create({
        data: { orderId: newOrder.id, status: 'pending', comment: 'Commande reçue' },
      });

      return newOrder;
    });

    // Email de confirmation (avant la réponse pour garantir l'envoi en serverless)
    try {
      await sendOrderConfirmationEmail({
        email: customerEmail,
        firstName: customerName.split(' ')[0],
        order: { ...order, createdAt: order.createdAt || new Date() },
        items: items.map(i => {
          const product = products.find(p => p.id === parseInt(i.productId));
          return { product, unitPrice: i.unitPrice, quantity: i.quantity };
        }),
      });
    } catch (emailErr) {
      console.error('Guest order email error:', emailErr);
    }

    // Notification à l'admin
    try {
      await sendAdminOrderNotification({
        customerName, customerEmail, customerPhone, shippingAddress,
        orderNumber: order.orderNumber, order,
        items: items.map(i => {
          const product = products.find(p => p.id === parseInt(i.productId));
          return { product, unitPrice: i.unitPrice, quantity: i.quantity };
        }),
      });
    } catch (emailErr) {
      console.error('Admin order notification error:', emailErr);
    }

    res.status(201).json({ success: true, orderNumber: order.orderNumber, order });

  } catch (e) {
    console.error('Guest order error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { shippingAddress, notes } = req.body;
    if (!shippingAddress?.trim()) return res.status(400).json({ error: 'Adresse de livraison requise' });

    const cartItems = await prisma.cart.findMany({ where: { userId: req.user.id }, include: { product: true } });
    if (cartItems.length === 0) return res.status(400).json({ error: 'Panier vide' });

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) return res.status(400).json({ error: `Stock insuffisant : ${item.product.name}` });
    }

    const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

    let orderNumber, exists = true;
    while (exists) {
      orderNumber = generateOrderNumber();
      exists = !!(await prisma.order.findUnique({ where: { orderNumber } }));
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({ data: { orderNumber, userId: req.user.id, shippingAddress, notes: notes || null, totalPrice: subtotal } });
      await tx.orderItem.createMany({ data: cartItems.map(i => ({ orderId: newOrder.id, productId: i.productId, quantity: i.quantity, unitPrice: i.product.price })) });
      for (const item of cartItems) { await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } }); }
      await tx.orderTracking.create({ data: { orderId: newOrder.id, status: 'pending', comment: 'Commande reçue' } });
      await tx.cart.deleteMany({ where: { userId: req.user.id } });
      return newOrder;
    });

    // Email de confirmation (avant la réponse pour garantir l'envoi en serverless)
    try {
      await sendOrderConfirmationEmail({
        email: req.user.email, firstName: req.user.firstName,
        order: { ...order, createdAt: order.createdAt || new Date() },
        items: cartItems.map(i => ({ product: i.product, unitPrice: i.product.price, quantity: i.quantity })),
      });
    } catch (emailErr) {
      console.error('Order confirmation email error:', emailErr);
    }

    // Notification à l'admin
    try {
      await sendAdminOrderNotification({
        customerName: `${req.user.firstName} ${req.user.lastName}`,
        customerEmail: req.user.email,
        customerPhone: req.user.phone,
        shippingAddress,
        orderNumber: order.orderNumber, order,
        items: cartItems.map(i => ({ product: i.product, unitPrice: i.product.price, quantity: i.quantity })),
      });
    } catch (emailErr) {
      console.error('Admin order notification error:', emailErr);
    }

    res.status(201).json({ success: true, orderNumber: order.orderNumber, order });
  } catch (e) { console.error('Create order error:', e); res.status(500).json({ error: 'Erreur serveur' }); }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    try {
      const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
      res.json(orders);
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
  } else {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const where = status ? { status } : {};
      const [orders, total] = await Promise.all([
        prisma.order.findMany({ where, include: { user: { select: { firstName:true, lastName:true, email:true } }, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page)-1)*parseInt(limit), take: parseInt(limit) }),
        prisma.order.count({ where }),
      ]);
      const statusCounts = await prisma.order.groupBy({ by:['status'], _count: { status: true } });
      res.json({ orders, total, statusCounts });
    } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
  }
});

app.get('/api/orders/my', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: 'Utilisateur non authentifié', orders: [] });
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } }, tracking: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(order => ({ ...order, items: order.items || [], tracking: order.tracking || [] })));
  } catch (error) { console.error('GET /api/orders/my ERROR:', error); res.status(500).json({ error: error.message || 'Erreur serveur', orders: [] }); }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);
    const isNumeric = !isNaN(orderId) && orderId > 0;
    const where = isNumeric ? { id: orderId } : { orderNumber: id };
    if (req.user.role !== 'ADMIN') where.userId = req.user.id;
    const order = await prisma.order.findFirst({
      where,
      include: { user: { select: { firstName:true, lastName:true, email:true } }, items: { include: { product: true } }, tracking: { include: { admin: { select: { firstName:true, lastName:true } } }, orderBy: { createdAt: 'desc' } } },
    });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    res.json({ order });
  } catch (e) { console.error('GET /api/orders/:id ERROR:', e); res.status(500).json({ error: 'Erreur serveur' }); }
});

app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: { include: { product: true } }, tracking: { include: { admin: { select: { firstName:true, lastName:true } } }, orderBy: { createdAt: 'desc' } } },
    });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    res.json({ order });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.patch('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
    const currentOrder = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: { select: { email:true, firstName:true } } },
    });
    const statusChanged = currentOrder.status !== status;
    const order = await prisma.order.update({ where: { id: parseInt(req.params.id) }, data: { status } });
    await prisma.orderTracking.create({ data: { orderId: order.id, status, comment: comment || null, updatedBy: req.user.id } });
    let emailSent = false;
    if (statusChanged || comment) {
      const recipientEmail = currentOrder.user?.email || currentOrder.customerEmail;
      const recipientName  = currentOrder.user?.firstName || (currentOrder.customerName || '').split(' ')[0] || 'Client';
      if (recipientEmail) {
        try {
          await sendOrderStatusUpdateEmail({ email: recipientEmail, firstName: recipientName, orderNumber: order.orderNumber, status, comment, statusChanged });
          emailSent = true;
        } catch (emailErr) {
          console.error('Order status update email error:', emailErr);
        }
      }
    }
    res.json({ success: true, order, emailSent });
  } catch (e) { console.error('PATCH /api/orders/:id ERROR:', e); res.status(500).json({ error: 'Erreur serveur' }); }
});

// ─── User ─────────────────────────────────────────────────────────────────────

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, monthlySalary } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone: phone || null, address: address || null, monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null },
      select: { id:true, username:true, email:true, firstName:true, lastName:true, role:true, phone:true, address:true, monthlySalary:true },
    });
    res.json({ message: 'Profil mis à jour', user: updated });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Nouveau mot de passe trop court (min. 8 caractères)' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { password: true } });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// ─── Admin ────────────────────────────────────────────────────────────────────

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalClients, totalProducts, totalOrders, revenueResult, pendingOrders, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName:true, lastName:true } }, items: { include: { product: { select: { name:true } } } } } }),
    ]);
    res.json({ totalClients, totalProducts, totalOrders, totalRevenue: revenueResult._sum.totalPrice || 0, pendingOrders, recentOrders });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ totalClients:0, totalProducts:0, totalOrders:0, totalRevenue:0, pendingOrders:0, recentOrders:[], error: 'Erreur récupération statistiques' });
  }
});

app.get('/api/admin/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const where = { role: 'CLIENT' };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [clients, total] = await Promise.all([
      prisma.user.findMany({ where, select: { id:true, username:true, email:true, firstName:true, lastName:true, phone:true, address:true, monthlySalary:true, createdAt:true, _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' }, take, skip }),
      prisma.user.count({ where }),
    ]);
    res.json({ clients, total, page: parseInt(page), limit: take });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// ─── Error handlers ───────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = app;