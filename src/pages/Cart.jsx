import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatFCFA, buildWhatsAppOrderLink } from '../utils/helpers';
import { Loader } from '../components/UI';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

/* ── CheckoutPanel ── */
function CheckoutPanel({ lang, total, onOrderWhatsApp }) {
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

      {/* Commande directe WhatsApp */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:14, boxShadow:'var(--shadow-sm)' }}>
        <button type="button" onClick={onOrderWhatsApp} className="btn-primary"
          style={{ justifyContent:'center', padding:'16px 20px', fontSize:15, width:'100%', background:'#25D366', borderColor:'#25D366' }}>
          💬 {l==='fr'?'Commander sur WhatsApp':l==='en'?'Order on WhatsApp':l==='de'?'Auf WhatsApp bestellen':l==='es'?'Pedir por WhatsApp':l==='it'?'Ordina su WhatsApp':'Encomendar no WhatsApp'}
        </button>
        <p style={{ fontSize:12, textAlign:'center', color:'var(--text-3)', lineHeight:1.6 }}>
          {l==='fr'?'Votre commande est pré-remplie dans le message. Précisez simplement votre nom et votre adresse de livraison pour confirmer.':
           l==='en'?'Your order is pre-filled in the message. Just add your name and delivery address to confirm.':
           l==='de'?'Ihre Bestellung ist im Nachricht vorausgefüllt. Geben Sie einfach Ihren Namen und Ihre Lieferadresse an.':
           l==='es'?'Tu pedido está precargado en el mensaje. Solo añade tu nombre y dirección de entrega.':
           l==='it'?'Il tuo ordine è precompilato nel messaggio. Aggiungi solo nome e indirizzo di consegna.':
           'Seu pedido está pré-preenchido na mensagem. Basta adicionar seu nome e endereço de entrega.'}
        </p>
      </div>
    </div>
  );
}

/* ── Main Cart ── */
export default function Cart() {
  const { cartItems, total, loading, fetchCart, removeItem, clear } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (productId, name) => {
    try {
      await removeItem(productId);
      addToast(`${name} ${t('remove', lang)}`, 'info');
    } catch { addToast('Erreur', 'error'); }
  };

  const handleOrderWhatsApp = () => {
    const order = {
      items: cartItems.map(i => ({
        product: { id: i.productId, name: i.product?.name },
        quantity: i.quantity,
        unitPrice: i.product?.price || 0,
      })),
      totalPrice: total,
    };
    window.open(buildWhatsAppOrderLink(order), '_blank');
    clear();
    addToast(lang === 'fr' ? 'Redirection vers WhatsApp…' : 'Redirecting to WhatsApp…', 'success');
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
                onOrderWhatsApp={handleOrderWhatsApp}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}