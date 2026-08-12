import { SITE } from './site';

// Build a WhatsApp link pre-filled with a single product order (commande directe).
export function buildWhatsAppProductOrder(product, quantity = 1) {
  const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock || 1));
  return buildWhatsAppOrderLink({
    items: [{ product: { id: product.id, name: product.name }, quantity: qty, unitPrice: product.price }],
    totalPrice: product.price * qty,
  });
}

// Build a WhatsApp link pre-filled with the order details and a link to each product.
export function buildWhatsAppOrderLink(order) {
  const base = window.location.origin;
  const lines = [];

  lines.push('🛒 *NOUVELLE COMMANDE*');
  lines.push('');
  if (order.orderNumber) {
    lines.push(`N° : *${order.orderNumber}*`);
    lines.push('');
  }
  lines.push('*PRODUITS :*');
  (order.items || []).forEach((item, i) => {
    const p = item.product || {};
    lines.push(`${i + 1}. ${p.name} x${item.quantity} — ${formatFCFA(item.unitPrice * item.quantity)}`);
    if (p.id) lines.push(`   👉 Voir le produit : ${base}/products/${p.id}`);
  });
  lines.push('');
  lines.push(`*TOTAL :* ${formatFCFA(order.totalPrice)}`);
  lines.push('');
  if (order.customerName) {
    lines.push(`*CLIENT :* ${order.customerName}`);
    lines.push(`Tél : ${order.customerPhone || 'Non renseigné'}`);
  }
  if (order.shippingAddress) lines.push(`Livraison : ${order.shippingAddress}`);

  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

// Format price in FCFA (XOF): 15 000 FCFA
export const formatFCFA = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
};

export const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
export const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
