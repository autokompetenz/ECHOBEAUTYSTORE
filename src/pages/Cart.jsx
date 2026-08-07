import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../services/api';
import { useCartStore, useAuthStore, useToastStore, useLangStore } from '../store';
import { formatFCFA } from '../utils/helpers';
import { Loader } from '../components/UI';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';
import api from '../services/api';

/* ── CheckoutPanel ── */
function CheckoutPanel({ lang, total, shippingAddress, setShippingAddress, notes, setNotes, placing, handleOrder, isGuest }) {
  const l = lang || 'fr';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Summary */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:14 }}>
          {t('summary', l)}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:9, fontSize:15 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:'var(--text-3)' }}>{t('subtotal', l)}</span>
            <span style={{ color:'var(--text)', fontWeight:600 }}>{formatFCFA(total)}</span>
          </div>
          <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontSize:14, color:'var(--text-3)' }}>{t('total', l)}</span>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:32, color:'var(--text)', letterSpacing:'-0.02em' }}>
              {formatFCFA(total)}
            </span>
          </div>
        </div>
      </div>

        {/* Formulaire commande */}
      <form onSubmit={handleOrder} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:14, boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)' }}>
          {l==='fr'?'Livraison':l==='en'?'Delivery':l==='de'?'Lieferung':l==='es'?'Entrega':l==='it'?'Consegna':'Entrega'}
        </p>

        {/* Champs invité uniquement */}
        {isGuest && (
          <>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                {l==='fr'?'Nom complet *':l==='en'?'Full name *':l==='de'?'Vollständiger Name *':l==='es'?'Nombre completo *':l==='it'?'Nome completo *':'Nome completo *'}
              </label>
              <input type="text" required name="fullName"
                placeholder={l==='fr'?'Votre nom et prénom':l==='en'?'Your full name':'Your full name'}
                className="input-luxury" style={{ fontSize:15 }} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                Email *
              </label>
              <input type="email" required name="email"
                placeholder="votre@email.com"
                className="input-luxury" style={{ fontSize:15 }} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                {t('phone', l)} *
              </label>
              <input type="tel" required name="phone"
                placeholder="+39 000 000 0000"
                className="input-luxury" style={{ fontSize:15 }} />
            </div>
          </>
        )}

        {/* Adresse */}
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            {t('delivery_addr', l)}
          </label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={4} required
            placeholder={t('delivery_ph', l)}
            className="input-luxury"
            style={{ resize:'vertical', minHeight:100, lineHeight:1.6, fontSize:15 }}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
            {t('notes_label', l)}
          </label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notes_ph', l)}
            className="input-luxury" style={{ fontSize:15 }} />
        </div>

        {/* Bandeau paiement */}
        <div style={{ background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>💳</span>
          <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>
            {l==='fr'?'Paiement par virement bancaire sécurisé. Les coordonnées bancaires vous seront communiquées par email après confirmation de votre commande.':
             l==='en'?'Payment by secure bank transfer. Bank details will be sent to you by email after order confirmation.':
             l==='de'?'Zahlung per sicherem Banküberweisung. Bankdaten werden Ihnen nach Auftragsbestätigung per E-Mail mitgeteilt.':
             l==='es'?'Pago por transferencia bancaria segura. Los datos bancarios se le comunicarán por email tras la confirmación del pedido.':
             l==='it'?'Pagamento tramite bonifico bancario sicuro. I dati bancari vi saranno comunicati per email dopo la conferma dell\'ordine.':
             'Pagamento por transferência bancária segura. Os dados bancários serão enviados por email após a confirmação do pedido.'}
          </p>
        </div>

        <button type="submit" disabled={placing} className="btn-primary"
          style={{ justifyContent:'center', padding:'15px 20px', fontSize:14, width:'100%' }}>
          {placing ? '⏳ ...' : '✓ ' + t('place_order', l)}
        </button>
        <p style={{ fontSize:12, textAlign:'center', color:'var(--text-3)' }}>
          ✉ {t('order_email_note', l)}
        </p>
      </form>
    </div>
  );
}

/* ── Main Cart ── */
export default function Cart() {
  const { cartItems, total, loading, fetchCart, removeItem, clear } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  const isGuest = !isAuthenticated;

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (productId, name) => {
    try {
      await removeItem(productId);
      addToast(`${name} ${t('remove', lang)}`, 'info');
    } catch { addToast('Erreur', 'error'); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      addToast(t('delivery_addr', lang).replace(' *', '') + ' requis', 'warning');
      return;
    }

    try {
      setPlacing(true);

      if (isGuest) {
        // Commande invité
        const formData = new FormData(e.target);
        const orderData = {
          shippingAddress,
          notes,
          customerName:  formData.get('fullName'),
          customerEmail: formData.get('email'),
          customerPhone: formData.get('phone'),
          items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.product.price })),
        };
        const { data } = await api.post('/orders/guest', orderData);
        clear();
        navigate(`/order-confirm/${data.orderNumber}`);
      } else {
        // Commande utilisateur connecté (route existante)
        const { data } = await orderAPI.create({ shippingAddress, notes });
        fetchCart();
        navigate(`/order-confirm/${data.orderNumber}`);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setPlacing(false); }
  };

  const l = lang || 'fr';
  const items = Array.isArray(cartItems) ? cartItems : [];

  if (loading) return (
    <div style={{ paddingTop:100, background:'var(--bg)', minHeight:'100vh', display:'flex', justifyContent:'center' }}>
      <Loader />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '36px 4% 24px' : '52px 6% 32px', background:'var(--bg-card2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div className="section-eyebrow">{t('nav_cart', l)}</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(32px,5vw,64px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
            {t('cart_title', l)}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:'0 auto', padding: isMobile ? '24px 4%' : '40px 6%' }}>
        {items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:72, marginBottom:20 }}>🛒</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:28, color:'var(--text)', marginBottom:12 }}>
              {t('cart_empty', l)}
            </h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginBottom:32 }}>
                      {l==='fr'?'Découvrez nos produits et ajoutez-les à votre panier.':
               l==='en'?'Discover our cosmetic products and add them to your cart.':
               l==='de'?'Entdecken Sie unsere Kosmetikprodukte.':
               l==='es'?'Descubra nuestros productos cosméticos.':
               l==='it'?'Scoprite i nostri prodotti cosmetici.':
               'Descubra nossos produtos cosméticos.'}
            </p>
            <Link to="/catalog" className="btn-primary">
              {l==='fr'?'Voir nos produits →':l==='en'?'See our products →':l==='de'?'Produkte ansehen →':l==='es'?'Ver productos →':l==='it'?'Vedi prodotti →':'Ver produtos →'}
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 20 : 32 }}>

            {/* Liste des articles */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:4 }}>
                {items.length} {t('found', l)}
              </p>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item?.id || item?.productId}
                    layout
                    initial={{ opacity:0, x:-16 }}
                    animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, height:0 }}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 14 : 20, display:'flex', gap: isMobile ? 12 : 18, alignItems:'center', boxShadow:'var(--shadow-sm)' }}>
                    <Link to={`/products/${item?.productId}`} style={{ width: isMobile ? 88 : 130, flexShrink:0, borderRadius:8, overflow:'hidden', display:'block' }}>
                      <img
                        src={item?.product?.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70'}
                        alt={item?.product?.name}
                        style={{ width:'100%', height: isMobile ? 64 : 95, objectFit:'cover', display:'block' }}
                      />
                    </Link>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link to={`/products/${item?.productId}`} style={{ textDecoration:'none' }}>
                        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 20, color:'var(--text)', marginBottom:3, letterSpacing:'-0.01em' }}>
                          {item?.product?.name}
                        </h3>
                      </Link>
                      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:6 }}>
                        {item?.product?.subcategory || ''}
                      </p>
                      <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 19 : 24, color:'var(--red)' }}>
                        {formatFCFA(item?.product?.price || 0)}
                      </p>
                      <button
                        onClick={() => handleRemove(item?.productId, item?.product?.name)}
                        style={{ marginTop:8, fontSize:13, color:'#DC2626', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:600, padding:0 }}>
                        ✕ {t('remove', l)}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout */}
            <div>
              <CheckoutPanel
                lang={l}
                total={total}
                shippingAddress={shippingAddress}
                setShippingAddress={setShippingAddress}
                notes={notes}
                setNotes={setNotes}
                placing={placing}
                handleOrder={handleOrder}
                isGuest={isGuest}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}