import { useState, useEffect } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../services/api';
import { useToastStore, useLangStore, useThemeStore } from '../store';
import { formatFCFA, buildWhatsAppProductOrder } from '../utils/helpers';
import { Loader } from '../components/UI';
import ProductCard from '../components/ProductCard';
import { t } from '../utils/i18n';
import { CATEGORIES, CATEGORY_ICONS, getCategoryLabel } from '../utils/categories';

const INFO_TITLE = {
  fr: 'Informations complémentaires sur le produit',
  en: 'Additional product information',
  de: 'Zusätzliche Produktinformationen',
  ar: 'معلومات إضافية عن المنتج',
};

const SPEC_LABELS = {
  fr: { category:'Catégorie', subcategory:'Sous-catégorie', stock:'Disponibilité', available:'disponible(s)', unavailable:'Épuisé' },
};

const IMAGE_FIELDS = [
  'imageUrl','imageUrl2','imageUrl3','imageUrl4','imageUrl5',
  'imageUrl6','imageUrl7','imageUrl8','imageUrl9','imageUrl10',
  'imageUrl11','imageUrl12','imageUrl13','imageUrl14','imageUrl15',
  'imageUrl16','imageUrl17','imageUrl18','imageUrl19','imageUrl20'
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const SL = SPEC_LABELS[lang] || SPEC_LABELS.fr;
  const { isMobile } = useBreakpoint();

  // Theme-aware color tokens — computed from isDark
  const C = {
    bg:      isDark ? '#0a0a0a'                  : '#f5f5f5',
    card:    isDark ? '#141414'                  : '#ffffff',
    card2:   isDark ? '#1a1a1a'                  : '#ececec',
    border:  isDark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.1)',
    text:    isDark ? '#ffffff'                  : '#111111',
    text2:   isDark ? 'rgba(255,255,255,0.65)'   : '#444444',
    text3:   isDark ? 'rgba(255,255,255,0.35)'   : '#888888',
    red:     '#C8102E',
    shadow:  isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
    disabledBg:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    disabledText: isDark ? '#444' : '#aaa',
  };

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then(r => { setProduct(r.data.product); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/catalog'); });
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;
    const productId = Number(product.id);
    setSimilarLoading(true);
    setSimilarProducts([]);

    const pickOthers = (list) => list.filter(p => Number(p.id) !== productId);

    productAPI.getAll({ category: product.category, limit: 12 })
      .then(async (r) => {
        let others = pickOthers(r.data.products || []);
        if (others.length < 3) {
          const fallback = await productAPI.getAll({ limit: 12 });
          const extra = pickOthers(fallback.data.products || [])
            .filter(p => !others.some(o => o.id === p.id));
          others = [...others, ...extra];
        }
        setSimilarProducts(others.slice(0, 3));
      })
      .catch(() => setSimilarProducts([]))
      .finally(() => setSimilarLoading(false));
  }, [product?.id, product?.category]);

  const handleOrder = () => {
    const url = buildWhatsAppProductOrder(product, qty);
    window.open(url, '_blank');
    addToast(
      lang === 'fr' ? 'Redirection vers WhatsApp…' :
      lang === 'en' ? 'Redirecting to WhatsApp…' :
      lang === 'de' ? 'Weiterleitung zu WhatsApp…' :
      'جارٍ التحويل إلى واتساب…', 'success'
    );
  };

  if (loading) return (
    <div style={{ paddingTop: 100, background: isDark ? '#0a0a0a' : '#f5f5f5', minHeight: '100vh' }}>
      <Loader text="Chargement..." />
    </div>
  );
  if (!product) return null;

  const images = IMAGE_FIELDS.map(f => product?.[f]).filter(Boolean);

  const breadcrumbs   = { fr:'Accueil', en:'Home', de:'Startseite', ar:'الرئيسية' };
  const catalogBc     = { fr:'Catalogue', en:'Catalogue', de:'Katalog', ar:'الكتالوج' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: 76 }}>

      {/* Breadcrumb */}
      <div style={{ padding: '18px 6%', borderBottom: `1px solid ${C.border}`, background: C.card2 }}>
        <p style={{ fontSize: 13, color: C.text3 }}>
          <Link to="/" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = C.text3}>
            {breadcrumbs[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <Link to="/catalog" style={{ color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = C.red}
            onMouseOut={e => e.target.style.color = C.text3}>
            {catalogBc[lang]}
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.3 }}>›</span>
          <span style={{ color: C.text2 }}>{product.name}</span>
        </p>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '28px 4%' : '52px 6%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 64 }}>

          {/* ── Gallery ── */}
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'relative', borderRadius: 14, overflow: 'hidden',
                aspectRatio: '4/3', background: C.card, boxShadow: C.shadow,
              }}
            >
              <img
                src={images[activeImg] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'}
                alt={`${product.name}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.featured && (
                <div style={{
                  position: 'absolute', top: 18, left: 18,
                  background: '#C8102E', color: '#fff',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.15em',
                  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 4,
                }}>
                  ★ {lang === 'fr' ? 'Recommandé' : lang === 'en' ? 'Featured' : lang === 'de' ? 'Empfohlen' : 'مميز'}
                </div>
              )}
              {images.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 14, right: 14,
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: 12, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 20, backdropFilter: 'blur(4px)',
                }}>
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)',
                gap: 10, marginTop: 16,
              }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{
                      aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
                      border: `2.5px solid ${activeImg === i ? '#C8102E' : C.border}`,
                      opacity: activeImg === i ? 1 : 0.6,
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      padding: 0, background: C.card,
                      transform: activeImg === i ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onMouseOver={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.borderColor='rgba(200,16,46,0.4)'; }}}
                    onMouseOut={e => { if (activeImg !== i) { e.currentTarget.style.opacity='0.6'; e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor=C.border; }}}
                  >
                    <img src={img} alt={`Vue ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.red }}>
                {getCategoryLabel(lang, product.category)}
              </span>
              {product.category === 'JOUETS_ADULTES' && (
                <span style={{ background: C.card, border: '1px solid ' + C.border, color: C.text, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', padding: '4px 10px', borderRadius: 6 }}>🔞 18+</span>
              )}
            </div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 900,
              fontSize: isMobile ? 36 : 52, color: C.text,
              letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 20,
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 40, color: C.text, letterSpacing: '-0.02em' }}>
                {formatFCFA(product.price)}
              </span>
            </div>

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: SL.category, value: product.category, icon: '📂' },
                product.subcategory ? { label: SL.subcategory, value: product.subcategory, icon: '📋' } : null,
                { label: SL.stock, value: product.stock > 0 ? `${product.stock} ${SL.available}` : SL.unavailable, highlight: product.stock > 0 ? '#22C55E' : '#EF4444', icon: '📦' },
              ].filter(Boolean).map(({ label, value, highlight, icon }) => (
                <div key={label}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: isMobile ? '14px 16px' : '16px 18px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='translateY(0)'; }}
                >
                  <span style={{ fontSize: 24, opacity: 0.8 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: highlight || C.text }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Informations complémentaires */}
            {product.description && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 800,
                  fontSize: isMobile ? 20 : 24, color: C.text,
                  letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.2,
                }}>
                  {INFO_TITLE[lang] || INFO_TITLE.fr}
                </h3>
                <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.75, borderLeft: '3px solid rgba(200,16,46,0.4)', paddingLeft: 18 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Avertissement adultes */}
            {product.category === 'JOUETS_ADULTES' && (
              <div style={{ marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start', background: C.card, border: '1px solid ' + C.border, borderRadius: 12, padding: isMobile ? '16px 18px' : '18px 22px' }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>🔞</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text, marginBottom: 6 }}>Réservé aux adultes (18+ et plus)</p>
                  <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6 }}>Livraison et facturation discrètes : emballage neutre sans mention du contenu. Ce produit est réservé aux personnes majeures.</p>
                </div>
              </div>
            )}

            {/* Commande directe : quantité + Commander sur WhatsApp */}
            <div style={{ display:'flex', gap:12, alignItems:'stretch' }}>
              {/* Quantité */}
              <div style={{
                display:'flex', alignItems:'center',
                background:C.card, border:`1px solid ${C.border}`,
                borderRadius:12, overflow:'hidden', flexShrink:0,
              }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={product.stock===0 || qty<=1}
                  style={{
                    width: isMobile ? 46 : 52, height: isMobile ? 50 : 54,
                    border:'none', background:'transparent', color:C.text,
                    fontSize:22, fontWeight:700, cursor: product.stock===0||qty<=1 ? 'not-allowed' : 'pointer',
                    opacity: product.stock===0||qty<=1 ? 0.3 : 1, transition:'all 0.2s',
                    fontFamily:"'Outfit',sans-serif",
                  }}
                  onMouseOver={e => { if(qty>1&&product.stock>0){ e.currentTarget.style.background=C.card2; } }}
                  onMouseOut={e => { e.currentTarget.style.background='transparent'; }}
                >−</button>
                <span style={{
                  width: isMobile ? 40 : 48, textAlign:'center',
                  fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:C.text,
                  borderLeft:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}`,
                  lineHeight: isMobile ? '50px' : '54px',
                }}>{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={product.stock===0 || qty>=product.stock}
                  style={{
                    width: isMobile ? 46 : 52, height: isMobile ? 50 : 54,
                    border:'none', background:'transparent', color:C.text,
                    fontSize:20, fontWeight:700, cursor: product.stock===0||qty>=product.stock ? 'not-allowed' : 'pointer',
                    opacity: product.stock===0||qty>=product.stock ? 0.3 : 1, transition:'all 0.2s',
                    fontFamily:"'Outfit',sans-serif",
                  }}
                  onMouseOver={e => { if(qty<product.stock&&product.stock>0){ e.currentTarget.style.background=C.card2; } }}
                  onMouseOut={e => { e.currentTarget.style.background='transparent'; }}
                >+</button>
              </div>

              {/* Commander */}
              <button
                onClick={handleOrder}
                disabled={product.stock === 0}
                style={{
                  flex:1, borderRadius:12, padding: isMobile ? '0 18px' : '0 24px',
                  fontFamily:"'Outfit',sans-serif", fontSize: isMobile?14:15, fontWeight:800,
                  letterSpacing:'0.08em', textTransform:'uppercase', border:'none',
                  cursor: product.stock===0 ? 'not-allowed' : 'pointer',
                  transition:'all 0.3s ease',
                  background: product.stock===0 ? C.disabledBg : 'linear-gradient(135deg,#25D366,#128C7E)',
                  color: product.stock===0 ? C.disabledText : '#fff',
                  boxShadow: product.stock>0 ? '0 4px 16px rgba(37,211,102,0.35)' : 'none',
                }}
                onMouseOver={e => { if (product.stock>0) { e.currentTarget.style.background='linear-gradient(135deg,#128C7E,#075E54)'; e.currentTarget.style.transform='scale(1.02)'; }}}
                onMouseOut={e => { if (product.stock>0) { e.currentTarget.style.background='linear-gradient(135deg,#25D366,#128C7E)'; e.currentTarget.style.transform='scale(1)'; }}}
              >
                {product.stock===0 ? t('out_of_stock',lang) : '💬 '+(lang==='fr'?'Commander':lang==='en'?'Order now':lang==='de'?'Jetzt bestellen':'اطلب الآن')}
              </button>
            </div>
            {product.stock > 0 && (
              <p style={{ marginTop:12, fontSize:13, color:C.text3, textAlign:'center' }}>
                {lang==='fr' ? `Commande directe sur WhatsApp — ${qty} × ${formatFCFA(product.price)} = ${formatFCFA(product.price * qty)}` :
                lang==='en' ? `Direct WhatsApp order — ${qty} × ${formatFCFA(product.price)} = ${formatFCFA(product.price * qty)}` :
                `WhatsApp-Bestellung — ${qty} × ${formatFCFA(product.price)} = ${formatFCFA(product.price * qty)}`}
              </p>
            )}
          </div>
        </div>

        {/* ==================== PREMIUM SECTIONS ==================== */}
        
        {/* 1. SECTION GARANTIE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 48 : 72 }}
        >
          <div style={{ marginBottom: isMobile ? 24 : 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Protection' : lang === 'en' ? 'Protection' : lang === 'de' ? 'Schutz' : 'حماية'}
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.02em', marginTop: 8 }}>
              {lang === 'fr' ? 'Protection adaptée à vos besoins' : lang === 'en' ? 'Protection tailored to your needs' : lang === 'de' ? 'Schutz maßgeschneidert für Ihre Bedürfnisse' : 'حماية مخصصة لاحتياجاتك'}
            </h2>
          </div>

          {/* Coverage grid */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 20 }}>
              {lang === 'fr' ? 'Nos engagements' : lang === 'en' ? 'Our commitments' : lang === 'de' ? 'Unsere Versprechen' : 'التزاماتنا'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { text: lang === 'fr' ? 'Produits authentiques certifiés' : lang === 'en' ? 'Certified authentic products' : lang === 'de' ? 'Zertifizierte Originalprodukte' : 'منتجات أصلية معتمدة', icon: '✨' },
                { text: lang === 'fr' ? 'Emballage soigné et sécurisé' : lang === 'en' ? 'Careful secure packaging' : lang === 'de' ? 'Sorgfältige sichere Verpackung' : 'تغليف آمن ومحكم', icon: '📦' },
                { text: lang === 'fr' ? 'Conforme aux normes UE' : lang === 'en' ? 'EU standard compliant' : lang === 'de' ? 'EU-Normen konform' : 'مطابق لمعايير الاتحاد الأوروبي', icon: '✅' },
                { text: lang === 'fr' ? 'Date de péremption vérifiée' : lang === 'en' ? 'Expiration date verified' : lang === 'de' ? 'Verfallsdatum geprüft' : 'تاريخ انتهاء الصلاحية مؤكد', icon: '📅' },
                { text: lang === 'fr' ? 'Service client réactif' : lang === 'en' ? 'Responsive customer service' : lang === 'de' ? 'Reaktiver Kundenservice' : 'خدمة عملاء سريعة الاستجابة', icon: '💬' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.card2, borderRadius: 10, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, boxShadow: C.shadow }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 20 }}>
              {lang === 'fr' ? 'Livraison' : lang === 'en' ? 'Delivery' : lang === 'de' ? 'Lieferung' : 'توصيل'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { text: lang === 'fr' ? 'Livraison express 24-48h' : lang === 'en' ? 'Express 24-48h delivery' : lang === 'de' ? 'Express 24-48h Lieferung' : 'توصيل سريع 24-48 ساعة', icon: '🚚' },
                { text: lang === 'fr' ? 'Suivi en temps réel' : lang === 'en' ? 'Real-time tracking' : lang === 'de' ? 'Echtzeitverfolgung' : 'تتبع في الوقت الفعلي', icon: '📍' },
                { text: lang === 'fr' ? 'Emballage discret' : lang === 'en' ? 'Discreet packaging' : lang === 'de' ? 'Diskrete Verpackung' : 'تغليف محتشم', icon: '📦' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: C.card2, borderRadius: 10, border: '1px solid transparent', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.transform='translateY(0)'; }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 2. SECTION LIVRAISON */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 48 : 72 }}
        >
          <div style={{ marginBottom: isMobile ? 24 : 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Livraison' : lang === 'en' ? 'Delivery' : lang === 'de' ? 'Lieferung' : 'توصيل'}
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.02em', marginTop: 8 }}>
              {lang === 'fr' ? 'Livraison produit' : lang === 'en' ? 'Product delivery' : lang === 'de' ? 'Produktlieferung' : 'توصيل المنتج'}
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: C.text2, marginTop: 12, maxWidth: 700, lineHeight: 1.6 }}>
              Votre {product.name} livré partout au Bénin. Produit emballé avec soin et documents conformes.
            </p>
          </div>

          {/* Delivery info card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>
                  {lang === 'fr' ? 'Livraison à domicile' : lang === 'en' ? 'Home delivery' : lang === 'de' ? 'Hauslieferung' : 'توصيل للمنزل'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { text: 'Partout au Bénin', icon: '🌍' },
                    { text: 'Délai : 24-48h à Cotonou, 2 à 5 jours ouvrés ailleurs', icon: '📅' },
                    { text: lang === 'fr' ? 'Livraison assurée' : lang === 'en' ? 'Insured delivery' : lang === 'de' ? 'Versicherte Lieferung' : 'توصيل مؤمن', icon: '🛡️' },
                    { text: lang === 'fr' ? 'Signature à la remise' : lang === 'en' ? 'Signature on delivery' : lang === 'de' ? 'Unterschrift bei Übergabe' : 'توقيع عند الاستلام', icon: '✍️' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>
                  {lang === 'fr' ? 'Avantages' : lang === 'en' ? 'Advantages' : lang === 'de' ? 'Vorteile' : 'المزايا'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    '✓ Livraison partout au Bénin',
                    lang === 'fr' ? '✓ Créneau confirmé avec le client' : lang === 'en' ? '✓ Time slot confirmed with client' : lang === 'de' ? '✓ Zeitfenster mit Kunde bestätigt' : '✓ فترة زمنية مؤكدة مع العميل',
                    lang === 'fr' ? '✓ Suivi avant remise' : lang === 'en' ? '✓ Tracking before handover' : lang === 'de' ? '✓ Verfolgung vor Übergabe' : '✓ تتبع قبل التسليم',
                    lang === 'fr' ? '✓ Documents préparés' : lang === 'en' ? '✓ Documents prepared' : lang === 'de' ? '✓ Dokumente vorbereitet' : '✓ الوثائق محضرة',
                    lang === 'fr' ? '✓ Accompagnement à la réception' : lang === 'en' ? '✓ Assistance on receipt' : lang === 'de' ? '✓ Begleitung bei Empfang' : '✓ مرافقة عند الاستلام',
                  ].map((item, i) => (
                    <div key={i} style={{ fontSize: 14, fontWeight: 600, color: C.text2, lineHeight: 1.6 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info box */}
            <div style={{ marginTop: 24, padding: 16, background: isDark ? 'rgba(200,16,46,0.08)' : 'rgba(200,16,46,0.05)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: 10 }}>
              <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, textAlign: 'center' }}>
                {lang === 'fr' ? 'Le produit est livré emballé avec soin et tous les documents en règle.' : lang === 'en' ? 'The product is delivered carefully packaged with all documents in order.' : lang === 'de' ? 'Das Produkt wird sorgfältig verpackt mit allen ordnungsgemäßen Dokumenten geliefert.' : 'يتم تسليم المنتج معبأ بعناية مع جميع الوثائق مرتبة.'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: 20 }}>
              {lang === 'fr' ? 'Du clic à la livraison – sans souci' : lang === 'en' ? 'From click to delivery – hassle-free' : lang === 'de' ? 'Vom Klick zur Lieferung – sorgenfrei' : 'من النقرة إلى التوصيل - بلا متاعب'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              {[
                { step: '1', text: lang === 'fr' ? 'Validation commande' : lang === 'en' ? 'Order validation' : lang === 'de' ? 'Bestellvalidierung' : 'التحقق من الطلب', icon: '📋' },
                { step: '2', text: lang === 'fr' ? 'Préparation produit' : lang === 'en' ? 'Product preparation' : lang === 'de' ? 'Produktvorbereitung' : 'تحضير المنتج', icon: '🔧' },
                { step: '3', text: lang === 'fr' ? 'Transport sécurisé' : lang === 'en' ? 'Secure transport' : lang === 'de' ? 'Sicherer Transport' : 'نقل آمن', icon: '🚚' },
                { step: '4', text: lang === 'fr' ? 'Livraison domicile' : lang === 'en' ? 'Home delivery' : lang === 'de' ? 'Hauslieferung' : 'توصيل للمنزل', icon: '🏠' },
                { step: '5', text: lang === 'fr' ? 'Réception produit' : lang === 'en' ? 'Product receipt' : lang === 'de' ? 'Produktempfang' : 'استلام المنتج', icon: '�' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#C8102E,#9B0B22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff' }}>
                    {item.step}
                  </div>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { text: '✓ Livraison Bénin', color: '#C8102E' },
              { text: lang === 'fr' ? '✓ Remise à domicile' : lang === 'en' ? '✓ Home delivery' : lang === 'de' ? '✓ Hauslieferung' : '✓ توصيل للمنزل', color: '#C8102E' },
              { text: lang === 'fr' ? '✓ Date au choix' : lang === 'en' ? '✓ Date of your choice' : lang === 'de' ? '✓ Datum nach Wahl' : '✓ تاريخ حسب اختيارك', color: '#C8102E' },
              { text: lang === 'fr' ? '✓ Transaction sécurisée' : lang === 'en' ? '✓ Secure transaction' : lang === 'de' ? '✓ Sichere Transaktion' : '✓ معاملة آمنة', color: '#C8102E' },
            ].map((badge, i) => (
              <div key={i} style={{ padding: '10px 20px', background: isDark ? 'rgba(200,16,46,0.1)' : 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.25)', borderRadius: 8, fontSize: 13, fontWeight: 700, color: badge.color }}>
                {badge.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. SECTION QUALITÉ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 48 : 72 }}
        >
          <div style={{ marginBottom: isMobile ? 24 : 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Qualité' : lang === 'en' ? 'Quality' : lang === 'de' ? 'Qualität' : 'جودة'}
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.02em', marginTop: 8 }}>
              {lang === 'fr' ? 'Produits certifiés et authentiques' : lang === 'en' ? 'Certified and authentic products' : lang === 'de' ? 'Zertifizierte und authentische Produkte' : 'منتجات معتمدة وأصلية'}
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: C.text2, marginTop: 12, maxWidth: 700, lineHeight: 1.6 }}>
              Tous nos produits sont 100% authentiques et proviennent directement des fabricants officiels.
            </p>
          </div>

          {/* Quality grid */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isMobile ? 24 : 32, marginBottom: 24, boxShadow: C.shadow }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { title: 'Produits authentiques', desc: 'Conformes aux normes de qualité', icon: '✅' },
                { title: lang === 'fr' ? 'Authentique' : lang === 'en' ? 'Authentic' : lang === 'de' ? 'Authentisch' : 'أصلي', desc: lang === 'fr' ? 'Source directe fabricant' : lang === 'en' ? 'Direct from manufacturer' : lang === 'de' ? 'Direkt vom Hersteller' : 'مباشر من الشركة المصنعة', icon: '🏷️' },
                { title: lang === 'fr' ? 'Fraîcheur garantie' : lang === 'en' ? 'Freshness guaranteed' : lang === 'de' ? 'Frische garantiert' : 'ضمان النضارة', desc: lang === 'fr' ? 'Dates de péremption vérifiées' : lang === 'en' ? 'Expiration dates verified' : lang === 'de' ? 'Verfallsdaten überprüft' : 'تم التحقق من تواريخ انتهاء الصلاحية', icon: '✨' },
                { title: lang === 'fr' ? 'Emballage sécurisé' : lang === 'en' ? 'Secure packaging' : lang === 'de' ? 'Sichere Verpackung' : 'تغليف آمن', desc: lang === 'fr' ? 'Protection optimale' : lang === 'en' ? 'Optimal protection' : lang === 'de' ? 'Optimaler Schutz' : 'حماية مثالية', icon: '📦' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '20px', background: C.card2, borderRadius: 12, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(200,16,46,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.title}</h5>
                    <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification badge */}
          <div style={{ background: 'linear-gradient(135deg,rgba(200,16,46,0.1),rgba(200,16,46,0.05))', border: '2px solid rgba(200,16,46,0.3)', borderRadius: 16, padding: isMobile ? 28 : 36, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 48 }}>✓</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8102E' }}>
                  {lang === 'fr' ? 'Certifié Echo Beauty Store' : lang === 'en' ? 'Certified Echo Beauty Store' : lang === 'de' ? 'Zertifiziert Echo Beauty Store' : 'معتمد من Echo Beauty Store'}
                </div>
                <p style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.text, marginTop: 4 }}>
                  {lang === 'fr' ? 'Ce produit a validé notre contrôle qualité complet.' : lang === 'en' ? 'This product has passed our complete quality control.' : lang === 'de' ? 'Dieses Produkt hat unsere vollständige Qualitätskontrolle bestanden.' : 'اجتاز هذا المنتج فحص الجودة الكامل لدينا.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. SECTION TRANSPARENCE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: isMobile ? 48 : 72, marginBottom: isMobile ? 48 : 72 }}
        >
          <div style={{ marginBottom: isMobile ? 24 : 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.red }}>
              {lang === 'fr' ? 'Transparence' : lang === 'en' ? 'Transparency' : lang === 'de' ? 'Transparenz' : 'شفافية'}
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.02em', marginTop: 8 }}>
              {lang === 'fr' ? 'Traçabilité et origine' : lang === 'en' ? 'Traceability and origin' : lang === 'de' ? 'Rückverfolgbarkeit und Herkunft' : 'قابلية التتبع والأصل'}
            </h2>
          </div>

          {/* Transparency badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#C8102E,#9B0B22)', borderRadius: 10, fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {lang === 'fr' ? 'Transparence totale' : lang === 'en' ? 'Total transparency' : lang === 'de' ? 'Volle Transparenz' : 'شفافية كاملة'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#C8102E' }}>100%</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text2 }}>
                {lang === 'fr' ? 'Traçabilité vérifiée' : lang === 'en' ? 'Verified traceability' : lang === 'de' ? 'Verifizierte Rückverfolgbarkeit' : 'قابلية التتبع موثقة'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: isMobile ? 15 : 17, color: C.text2, marginBottom: 32, maxWidth: 700, lineHeight: 1.6 }}>
            {lang === 'fr' ? 'Ce produit bénéficie d\'une traçabilité complète. Origine, lot de fabrication et date de péremption sont clairement identifiés.' : lang === 'en' ? 'This product benefits from complete traceability. Origin, batch number and expiration date are clearly identified.' : lang === 'de' ? 'Dieses Produkt verfügt über eine vollständige Rückverfolgbarkeit. Herkunft, Chargennummer und Verfallsdatum sind klar identifiziert.' : 'يتمتع هذا المنتج بقابلية تتبع كاملة. الأصل، رقم الدفعة وتاريخ انتهاء الصلاحية محددة بوضوح.'}
          </p>

          {/* History cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
            {[
              { title: lang === 'fr' ? 'Origine vérifiée' : lang === 'en' ? 'Verified origin' : lang === 'de' ? 'Verifizierte Herkunft' : 'أصل موثق', desc: lang === 'fr' ? 'Fabricant officiel certifié' : lang === 'en' ? 'Certified official manufacturer' : lang === 'de' ? 'Zertifizierter offizieller Hersteller' : 'شركة مصنعة رسمية معتمدة', icon: '🏭' },
              { title: lang === 'fr' ? 'Numéro de lot' : lang === 'en' ? 'Batch number' : lang === 'de' ? 'Chargennummer' : 'رقم الدفعة', desc: lang === 'fr' ? 'Traçabilité complète' : lang === 'en' ? 'Complete traceability' : lang === 'de' ? 'Vollständige Rückverfolgbarkeit' : 'قابلية تتبع كاملة', icon: '📋' },
              { title: lang === 'fr' ? 'Date de péremption' : lang === 'en' ? 'Expiration date' : lang === 'de' ? 'Verfallsdatum' : 'تاريخ انتهاء الصلاحية', desc: lang === 'fr' ? 'Produit frais garanti' : lang === 'en' ? 'Fresh product guaranteed' : lang === 'de' ? 'Frisches Produkt garantiert' : 'منتج طازج مضمون', icon: '📅' },
              { title: lang === 'fr' ? 'Certification' : lang === 'en' ? 'Certification' : lang === 'de' ? 'Zertifizierung' : 'شهادة', desc: lang === 'fr' ? 'Normes CE respectées' : lang === 'en' ? 'CE standards respected' : lang === 'de' ? 'CE-Normen eingehalten' : 'معايير CE محترمة', icon: '✅' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: isMobile ? 24 : 28, boxShadow: C.shadow, transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='rgba(200,16,46,0.4)'; e.currentTarget.style.transform='translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,rgba(200,16,46,0.15),rgba(200,16,46,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.title}</h5>
                    <p style={{ fontSize: 14, color: C.text3, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related Products */}
        {product && (similarLoading || similarProducts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginTop: isMobile ? 48 : 72 }}
          >
            <div style={{ marginBottom: isMobile ? 24 : 32 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.red }}>
                {lang==='fr'?'VOUS POURRIEZ AUSSI AIMER':lang==='en'?'YOU MIGHT ALSO LIKE':lang==='de'?'SIE KÖNNTEN AUCH GEFALLEN':lang==='es'?'TAMBIÉN PODRÍA GUSTARLE':lang==='it'?'POTREBBE PIACERTI ANCHE':'VOCÊ TAMBÉM PODE GOSTAR'}
              </span>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.02em', marginTop: 8 }}>
                {lang==='fr'?'Produits similaires':lang==='en'?'Similar Products':lang==='de'?'Ähnliche Produkte':lang==='es'?'Productos Similares':lang==='it'?'Prodotti Simili':'Produtos Similares'}
              </h2>
            </div>
            {similarLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Loader />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
                {similarProducts.slice(0, isMobile ? 2 : 3).map((similar, i) => (
                  <ProductCard key={similar.id} product={similar} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Product Category Suggestions */}
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ marginTop: isMobile ? 48 : 72 }}
          >
            <div style={{ marginBottom: isMobile ? 24 : 32 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.red }}>
                {lang==='fr'?'AUTRES CATÉGORIES':lang==='en'?'OTHER CATEGORIES':lang==='de'?'ANDERE KATEGORIEN':lang==='es'?'OTRAS CATEGORÍAS':lang==='it'?'ALTRE CATEGORIE':'OUTRAS CATEGORIAS'}
              </span>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 42, color: C.text, letterSpacing: '-0.02em', marginTop: 8 }}>
                {lang==='fr'?'Explorez notre gamme':lang==='en'?'Explore our range':lang==='de'?'Erkunden Sie unsere Auswahl':lang==='es'?'Explore nuestra gama':lang==='it'?'Esplora la nostra gamma':'Explore nossa gama'}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
              {CATEGORIES.filter(cat => cat !== product.category).map(cat => (
                <Link
                  key={cat}
                  to={`/catalog?category=${cat}`}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 24,
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.3s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: 40 }}>{CATEGORY_ICONS[cat]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{getCategoryLabel(lang, cat)}</div>
                  <div style={{ fontSize: 13, color: C.text3 }}>
                    {lang === 'fr' ? 'Voir le catalogue →' :
                     lang === 'en' ? 'View catalogue →' :
                     lang === 'de' ? 'Katalog ansehen →' :
                     lang === 'ar' ? 'عرض الكتالوج ←' :
                     'Ver catálogo →'}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}