// Format price in FCFA (XOF): 15 000 FCFA
export const formatFCFA = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
};

export function calculateMonthlyPayment(price, months = 60, annualRate = 0.06) {
  const r = annualRate / 12;
  return Math.round((price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export function calculateOrderTotals(subtotal) {
  return { total: subtotal, discount: null, deposit: null, monthly: null };
}

export const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
export const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
export const PAYMENT_LABELS = {
  full: 'Paiement intégral (-5%)', deposit: 'Acompte 25%', monthly: 'Mensualités 60 mois',
};

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
