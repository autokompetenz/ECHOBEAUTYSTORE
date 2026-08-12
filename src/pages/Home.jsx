import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { productAPI } from '../services/api';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import ProductCard from '../components/ProductCard';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ALL_REVIEWS } from '../utils/reviews';
import { SITE } from '../utils/site';

const SERVICES = [
  { icon:'💪', tag:'BIEN-ÊTRE',
    title:'Remise en Forme',
    desc:'Haltères, tapis, accessoires fitness et compléments alimentaires pour un entraînement complet à la maison.' },
  { icon:'💆', tag:'RELAXATION',
    title:'Instruments de Massage',
    desc:'Appareils de massage électriques, coussins shiatsu, pierres chaudes et accessoires bien-être.' },
  { icon:'⚖️', tag:'MINCEUR',
    title:'Produits Amaigrissants',
    desc:'Brûleurs de graisse, ceintures amincissantes, crèmes minceur et tisanes pour affiner la silhouette.' },
  { icon:'🔞', tag:'18+',
    title:'Bien-être Adulte',
    desc:'Accessoires réservés aux adultes (18+ et plus). Livraison et facturation discrètes, emballage neutre.' },
  { icon:'🚚', tag:'RAPIDE',
    title:'Livraison Express',
    desc:`Livraison à Cotonou en 24-48h et partout au Bénin. Suivi en temps réel de votre commande.` },
  { icon:'💳', tag:'PAIEMENT SIMPLE',
    title:'Paiement Simple',
    desc:`Paiement par Mobile Money (MTN, Moov), virement bancaire ou à la livraison. Sans frais cachés.` },
];

const getPurchaseSteps = () => [
  {
    icon: '🔍', step: '01',
    title: 'Découvrir nos produits',
    desc: 'Parcourez notre catalogue en ligne. Filtrez par catégorie ou prix. Chaque fiche produit inclut photos HD, description complète et composition.',
  },
  {
    icon: '💬', step: '02',
    title: 'Commander sur WhatsApp',
    desc: 'Choisissez votre quantité et cliquez sur "Commander". Le message est pré-rempli sur WhatsApp : ajoutez simplement votre nom et votre adresse de livraison pour confirmer.',
  },
  {
    icon: '💳', step: '03',
    title: 'Paiement sécurisé',
    desc: 'Paiement par Mobile Money (MTN, Moov), virement bancaire ou à la livraison. Reçu officiel émis immédiatement. Transparence totale, aucun frais caché.',
  },
  {
    icon: '📧', step: '04',
    title: 'Confirmation par email',
    desc: 'Dès la validation, vous recevez par email votre bon de commande avec un numéro de suivi unique pour suivre votre colis.',
  },
  {
    icon: '🚚', step: '05',
    title: 'Livraison à domicile',
    desc: 'Vos produits livrés à Cotonou en 24-48h et partout au Bénin. Emballage soigné pour protéger vos commandes, et livraison discrète sur demande.',
  },
  {
    icon: '⭐', step: '06',
    title: 'Votre avis compte',
    desc: 'Après réception, partagez votre expérience. Votre satisfaction est notre priorité — notre équipe est disponible 7j/7 pour toute question.',
  },
];

const getFAQ = () => [
  {
    q: 'Quels types de produits proposez-vous ?',
    a: 'Echo Beauty Store propose une large gamme : remise en forme (haltères, tapis, compléments alimentaires), instruments de massage (appareils, coussins shiatsu, accessoires), produits amaigrissants (brûleurs de graisse, crèmes minceur, tisanes) et bien-être adulte (réservé aux 18+ et plus, livraison discrète).',
  },
  {
    q: 'Livrez-vous partout au Bénin ?',
    a: "Oui, nous livrons à Cotonou en 24-48h et partout au Bénin. Nos produits sont soigneusement emballés. Vous recevez un numéro de suivi dès l'expédition pour suivre votre commande en temps réel.",
  },
  {
    q: 'Proposez-vous des prix de gros ?',
    a: 'Oui. Nous proposons des tarifs préférentiels pour les commandes en volume. Contactez-nous via WhatsApp ou email pour recevoir nos conditions tarifaires professionnelles (revendeurs, salons de beauté, boutiques).',
  },
  {
    q: 'Vos produits sont-ils authentiques ?',
    a: "Absolument. Echo Beauty Store travaille directement avec des fournisseurs officiels et des marques certifiées. Tous nos produits sont authentiques et rigoureusement sélectionnés pour garantir leur qualité.",
  },
  {
    q: 'Comment suivre ma commande ?',
    a: "Dès l'expédition de votre commande, vous recevez un email avec un numéro de suivi unique. Rendez-vous sur la page \"Suivi commande\" de notre site ou dans votre espace client pour consulter l'état de votre livraison en temps réel.",
  },
];

function Stars({ n=5 }) {
  return <span style={{ display:'inline-flex', gap:2 }}>{Array.from({length:5}).map((_,i)=><span key={i} style={{ color:i<n?'#FFAA00':'var(--border-2)', fontSize:15 }}>★</span>)}</span>;
}

function CookieBanner() {
  const [visible, setVisible] = useState(!localStorage.getItem('pc_cookies'));
  if (!visible) return null;
  const accept  = () => { localStorage.setItem('pc_cookies','1'); setVisible(false); };
  const decline = () => { localStorage.setItem('pc_cookies','0'); setVisible(false); };
  return (
    <div className="cookie-banner" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
      <p style={{ fontSize:14, color:'var(--text-2)', flex:1 }}>🍪 Nous utilisons des cookies pour améliorer votre expérience.</p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={decline} style={{ padding:'9px 18px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-3)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Refuser</button>
        <button onClick={accept} className="btn-gold" style={{ fontSize:13, padding:'9px 20px' }}>Accepter</button>
      </div>
    </div>
  );
}

function PurchaseStepsSection({ isMobile }) {
  const steps = getPurchaseSteps();

  return (
    <section style={{ background:'var(--bg)', borderTop:'1px solid var(--border)' }} className="section-pad">
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div className="section-eyebrow" style={{ justifyContent:'center' }}>Comment ça marche</div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line' }}>De la commande<br/>à la livraison</h2>
          <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:560, margin:'12px auto 0' }}>Un processus simple et transparent, de la sélection du produit jusqu'à sa livraison chez vous.</p>
        </div>
        {!isMobile ? (
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:'linear-gradient(to bottom, rgba(200,16,46,0.08), rgba(200,16,46,0.4), rgba(200,16,46,0.08))', transform:'translateX(-50%)', pointerEvents:'none' }} />
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div key={i} initial={{ opacity:0, x: isLeft ? -40 : 40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:i * 0.1 }}
                  style={{ display:'grid', gridTemplateColumns:'1fr 80px 1fr', gap:0, alignItems:'center', marginBottom: i < steps.length - 1 ? 40 : 0 }}>
                  <div style={{ gridColumn:1, display:'flex', justifyContent:'flex-end', paddingRight:40 }}>
                    {isLeft ? <StepCard data={s} align="right" /> : <div />}
                  </div>
                  <div style={{ gridColumn:2, display:'flex', justifyContent:'center', alignItems:'center', position:'relative', zIndex:2 }}>
                    <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg, #9B0B22, #C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 0 0 6px var(--bg), 0 0 0 8px rgba(200,16,46,0.2)' }}>{s.icon}</div>
                  </div>
                  <div style={{ gridColumn:3, paddingLeft:40 }}>
                    {!isLeft ? <StepCard data={s} align="left" /> : <div />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ position:'relative', paddingLeft:52 }}>
            <div style={{ position:'absolute', left:20, top:8, bottom:8, width:2, background:'linear-gradient(to bottom, rgba(200,16,46,0.08), rgba(200,16,46,0.4), rgba(200,16,46,0.08))' }} />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i * 0.08 }}
                style={{ position:'relative', marginBottom: i < steps.length - 1 ? 28 : 0 }}>
                <div style={{ position:'absolute', left:-42, top:16, width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, #9B0B22, #C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 0 0 4px var(--bg), 0 0 0 6px rgba(200,16,46,0.15)', zIndex:2 }}>{s.icon}</div>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.25em', color:'var(--red)', background:'var(--red-bg)', border:'1px solid var(--red-border)', padding:'2px 8px', borderRadius:3 }}>{s.step}</span>
                    <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:'var(--text)' }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.65 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StepCard({ data, align }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'24px 28px', boxShadow:'var(--shadow-sm)', maxWidth:420, textAlign: align }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', background:'var(--red-bg)', border:'1px solid var(--red-border)', padding:'3px 10px', borderRadius:3, order: align === 'right' ? 2 : 1 }}>ÉTAPE {data.step}</span>
      </div>
      <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:10 }}>{data.title}</h3>
      <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.7 }}>{data.desc}</p>
    </div>
  );
}

function FAQSection({ isMobile }) {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = getFAQ();

  return (
    <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div className="section-eyebrow" style={{ justifyContent:'center' }}>FAQ</div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line', lineHeight:1.1 }}>Vos questions,<br/>nos réponses</h2>
          <p style={{ fontSize:15, color:'var(--text-3)', marginTop:14, maxWidth:580, margin:'14px auto 0' }}>Tout ce que vous devez savoir sur nos produits et services.</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.4, delay:i * 0.06 }}
                style={{ background:'var(--bg-card)', border:`1px solid ${isOpen ? 'rgba(200,16,46,0.35)' : 'var(--border)'}`, borderRadius:14, overflow:'hidden', boxShadow: isOpen ? '0 4px 24px rgba(200,16,46,0.08)' : 'var(--shadow-sm)', transition:'border-color 0.3s, box-shadow 0.3s' }}>
                <button onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding: isMobile ? '18px 20px' : '22px 28px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flex:1 }}>
                    <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background: isOpen ? 'linear-gradient(135deg, #9B0B22, #C8102E)' : 'var(--red-bg)', border:`1px solid ${isOpen ? 'transparent' : 'var(--red-border)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s' }}>
                      <span style={{ fontSize:14, fontWeight:900, color: isOpen ? '#fff' : 'var(--red)', fontFamily:"'Outfit',sans-serif" }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize: isMobile ? 14 : 16, color:'var(--text)', lineHeight:1.4 }}>{item.q}</span>
                  </div>
                  <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background: isOpen ? 'rgba(200,16,46,0.12)' : 'var(--bg-card2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s' }}>
                    <span style={{ fontSize:16, color: isOpen ? 'var(--red)' : 'var(--text-3)', transform: isOpen ? 'rotate(45deg)' : 'none', display:'inline-block', transition:'transform 0.3s', lineHeight:1 }}>+</span>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div key="answer" initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.35, ease:[0.4, 0, 0.2, 1] }} style={{ overflow:'hidden' }}>
                      <div style={{ padding: isMobile ? '0 20px 20px 66px' : '0 28px 24px 74px', borderTop:'1px solid var(--border)', paddingTop: 16 }}>
                        <p style={{ fontSize: isMobile ? 13 : 14, color:'var(--text-2)', lineHeight:1.75 }}>{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.3 }}
          style={{ marginTop:40, textAlign:'center', padding: isMobile ? '24px 20px' : '32px 40px', background:'linear-gradient(135deg,rgba(200,16,46,0.06),rgba(200,16,46,0.02))', border:'1px solid rgba(200,16,46,0.15)', borderRadius:16 }}>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize: isMobile ? 15 : 17, color:'var(--text)', marginBottom:8 }}>Une autre question ?</p>
          <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:20 }}>Notre équipe répond sous 24h par WhatsApp ou email.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer"
              style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700, padding:'11px 22px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8 }}>
              💬 WhatsApp
            </a>
            <a href={`mailto:${SITE.email}`} className="btn-ghost" style={{ fontSize:13 }}>✉ Email</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackNum, setTrackNum] = useState('');
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const l = lang || 'fr';
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] });
  const heroY = useTransform(scrollYProgress, [0,1], ['0%','25%']);
  const heroO = useTransform(scrollYProgress, [0,0.7], [1,0]);

  useEffect(() => {
    setLoading(true);
    productAPI.getAll({ featured:'true', limit:12 })
      .then(r => { setFeatured(r.data.products||[]); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackNum.trim()) navigate(`/track/${trackNum.trim().toUpperCase()}`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position:'relative', height: isMobile ? '100svh' : '100vh', minHeight:580, display:'flex', alignItems:'center', overflow:'hidden' }}>
        <motion.div style={{ position:'absolute', inset:0, y:heroY }}>
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&q=80&auto=format"
            alt="Bien-être" style={{ width:'100%', height:'110%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.3) 100%)' }} />
        </motion.div>

        <motion.div style={{ position:'relative', zIndex:2, padding: isMobile ? '0 5%' : '0 7%', maxWidth:780, opacity:heroO }}>
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(200,16,46,0.15)', border:'1px solid rgba(200,16,46,0.3)', borderRadius:4, padding:'7px 16px', marginBottom:28 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#C8102E', display:'inline-block' }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>
                {t('hero_badge', l)}
              </span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, delay:0.2 }}
            style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 'clamp(38px,10vw,56px)' : 'clamp(52px,6vw,88px)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.0, marginBottom:22 }}>
            Echo<br/><span style={{ color:'#C8102E' }}>Beauty</span><br/>Store
          </motion.h1>

          <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.35 }}
            style={{ fontSize: isMobile ? 15 : 18, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:36, maxWidth:520 }}>
            {t('hero_subtitle', l)}
          </motion.p>

          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.5 }}
            style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/catalog" className="btn-primary" style={{ fontSize: isMobile ? 13 : 14 }}>
              {t('hero_cta1', l)} →
            </Link>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: isMobile ? 13 : 14, borderColor:'rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.85)', textDecoration:'none' }}>
              💬 WhatsApp
            </a>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8, duration:0.6 }}
          style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)', padding: isMobile ? '16px 5%' : '22px 7%', display:'flex', justifyContent:'space-around', gap:16, flexWrap:'wrap' }}>
          {[
            { value:'10+', label:t('hero_stat1', l) },
            { value:'4.9★', label:t('hero_stat2', l) },
            { value:'100%', label:t('hero_stat3', l) },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 22 : 30, color:'#C8102E', lineHeight:1 }}>{value}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color:'rgba(255,255,255,0.45)', marginTop:4, fontWeight:600, letterSpacing:'0.05em' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── TRACK BAR ── */}
      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '20px 5%' : '24px 7%' }}>
        <form onSubmit={handleTrack} style={{ maxWidth:640, margin:'0 auto', display:'flex', gap:10 }}>
          <input value={trackNum} onChange={e => setTrackNum(e.target.value)}
            placeholder={t('track_ph', l)}
            className="input-luxury"
            style={{ flex:1, fontSize: isMobile ? 14 : 15 }} />
          <button type="submit" className="btn-primary" style={{ padding:'13px 20px', fontSize:13, whiteSpace:'nowrap', flexShrink:0 }}>
            {t('track_order', l)}
          </button>
        </form>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:36 }}>
            <div>
              <div className="section-eyebrow">{t('catalog_title', l)}</div>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1.05, whiteSpace:'pre-line' }}>
                Nos Produits<br/>à la Une
              </h2>
            </div>
            <Link to="/catalog" className="btn-outline">{t('see_all', l)} →</Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, minHeight:280, display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ width:'100%', height:160, background:'var(--bg-card2)', borderRadius:8 }} />
                  <div style={{ height:20, background:'var(--bg-card2)', borderRadius:4, width:'70%' }} />
                  <div style={{ height:16, background:'var(--bg-card2)', borderRadius:4, width:'50%' }} />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              {featured.slice(0, isMobile ? 3 : 6).map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <PurchaseStepsSection isMobile={isMobile} />

      {/* ── SERVICES ── */}
      <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('services_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line' }}>Nos Gammes<br/>de Produits</h2>
            <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:520, margin:'12px auto 0' }}>{t('services_sub', l)}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 18 }}>
            {SERVICES.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07, duration:0.5 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 24px', transition:'all 0.3s', boxShadow:'var(--shadow-sm)' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,16,46,0.3)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
                <div style={{ fontSize:32, marginBottom:14 }}>{s.icon}</div>
                <span style={{ display:'inline-block', background:'var(--red-bg)', border:'1px solid var(--red-border)', color:'var(--red)', fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'3px 10px', borderRadius:3, marginBottom:10 }}>{s.tag}</span>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQSection isMobile={isMobile} />

      {/* ── WHY CHOOSE US ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>Notre Force</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line' }}>Ce qui nous<br/>distingue</h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 24 : 32 }}>
            {[
              { img:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80', alt:'Qualité',
                title:'Produits 100% authentiques',
                desc:'Produits authentiques, sélectionnés auprès de fournisseurs officiels. Qualité garantie sur toute notre gamme.', dir:-20 },
              { img:'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&q=80', alt:'Prix',
                title:'Prix compétitifs',
                desc:'Tarifs avantageux pour les particuliers comme pour les professionnels. Remises volume pour les revendeurs, salons et boutiques de beauté.', dir:20 },
              { img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', alt:'Livraison',
                title:'Livraison rapide au Bénin',
                desc:'Livraison à Cotonou en 24-48h et partout au Bénin. Emballage soigné pour protéger vos produits. Suivi en temps réel de votre commande.', dir:-20 },
              { img:'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80', alt:'Support',
                title:'Support expert 7j/7',
                desc:'Notre équipe de spécialistes est disponible par WhatsApp, email et téléphone pour vous conseiller et accompagner vos commandes.', dir:20 },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, x: item.dir }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:i * 0.1 }}
                style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
                <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                  <img src={item.img} alt={item.alt} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>{item.title}</h3>
                  <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Banner */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.6 }}
            style={{ marginTop:48, padding: isMobile ? 28 : 36, background:'linear-gradient(135deg,rgba(200,16,46,0.08),rgba(200,16,46,0.03))', border:'2px solid rgba(200,16,46,0.2)', borderRadius:16, display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:24, textAlign:'center' }}>
            {[
              { value:'2021', label:'Fondée en' },
              { value:'500+', label:'Clientes satisfaites' },
              { value:'4.9★', label:'Note clients' },
              { value:'100%', label:'Produits certifiés' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize: isMobile ? 32 : 40, color:'#C8102E', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize: isMobile ? 12 : 13, color:'var(--text-3)', marginTop:6, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section-pad" style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('reviews_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line' }}>Ce que disent<br/>nos clients</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 20 }}>
            {ALL_REVIEWS.slice(0, 6).map((r, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08, duration:0.5 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 24px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#9B0B22,#C8102E)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:14, color:'#fff', flexShrink:0 }}>{r.avatar}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{r.name}</p>
                    <Stars n={r.rating} />
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:11, fontWeight:600, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'var(--green)', padding:'3px 10px', borderRadius:4 }}>✓ {t('verified', l)}</span>
                </div>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>"{r.textFr}"</p>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:36 }}>
            <Link to="/avis" className="btn-outline" style={{ fontSize:14, padding:'13px 32px' }}>
              Voir tous les avis →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ background:'var(--bg)', borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 60, alignItems:'center' }}>
          <div>
            <div className="section-eyebrow">{t('contact_label', l)}</div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:20 }}>
              {t('contact_title', l)}
            </h2>
            <p style={{ fontSize:15, color:'var(--text-3)', lineHeight:1.7, marginBottom:28 }}>
              Notre équipe de spécialistes est à votre disposition pour toute question sur nos produits.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, padding:'13px 24px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8 }}>
                💬 WhatsApp
              </a>
              <a href={`mailto:${SITE.email}`} className="btn-ghost" style={{ fontSize:13 }}>✉ Email</a>
            </div>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding: isMobile ? 22 : 32, boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:18 }}>{t('contact_hours', l)}</p>
            {SITE.hours.map(({ day, hours }) => (
              <div key={day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{day}</span>
                <span style={{ fontSize:14, color:hours===SITE.hours[2].hours?'#DC2626':'var(--green)', fontWeight:700 }}>{hours}</span>
              </div>
            ))}
            <div style={{ marginTop:20, padding:'14px 18px', background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8 }}>
              <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
                📍 {SITE.address}<br/>
                🏢 {SITE.ifu}<br/>
                ✉ <a href={`mailto:${SITE.email}`} style={{ color:'var(--red)', textDecoration:'none', fontWeight:600 }}>{SITE.email}</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', padding: isMobile ? '36px 5% 28px' : '48px 7% 32px' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto', gap: isMobile ? 24 : 40, alignItems:'start' }}>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:900, color:'var(--text)', letterSpacing:'0.05em' }}>ECHO BEAUTY</div>
              <div style={{ fontSize:9, letterSpacing:'0.4em', color:'var(--red)', textTransform:'uppercase', marginTop:3, marginBottom:12 }}>STORE · Cotonou</div>
              <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6, maxWidth:240 }}>
                Votre boutique bien-être de confiance à Cotonou.
              </p>
              <div style={{ marginTop:12, fontSize:11, color:'var(--text-3)', lineHeight:1.8 }}>
                <div>{SITE.ifu}</div>
                <div>{SITE.rccm}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 20 : 16, paddingLeft: isMobile ? 0 : 40 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>Navigation</p>
                {[{to:'/catalog',label:t('nav_catalog',l)},{to:'/track',label:t('nav_track',l)},{to:'/avis',label:'Avis clients'}].map(({to,label})=>(
                  <Link key={to} to={to} style={{ display:'block', fontSize:14, color:'var(--text-3)', textDecoration:'none', marginBottom:8, transition:'color 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.color='var(--red)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-3)'}>{label}</Link>
                ))}
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>Contact</p>
                <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.8 }}>
                  📍 {SITE.address}<br/>
                  📞 {SITE.phone}<br/>
                  ✉ {SITE.email}<br/>
                  💬 <a href={`https://wa.me/${SITE.whatsapp}`} style={{ color:'var(--red)', textDecoration:'none' }}>WhatsApp</a>
                </p>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--red)', marginBottom:12 }}>Informations légales</p>
                {[
                  { to:'/mentions-legales', label:'Mentions légales' },
                  { to:'/politique-de-vente', label:'Politique de vente' },
                  { to:'/cgv', label:'CGV' },
                  { to:'/politique-confidentialite', label:'Confidentialité' },
                  { to:'/cookies', label:'Cookies' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} style={{ display:'block', fontSize:14, color:'var(--text-3)', textDecoration:'none', marginBottom:8, transition:'color 0.2s' }}
                    onMouseOver={e=>{ e.currentTarget.style.color='var(--red)'; }}
                    onMouseOut={e=>{ e.currentTarget.style.color='var(--text-3)'; }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height:1, background:'var(--border)', margin:'28px 0 20px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>© {new Date().getFullYear()} {SITE.name}. {t('copyright', l)}.</p>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>{t('made_in', l)}</p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
