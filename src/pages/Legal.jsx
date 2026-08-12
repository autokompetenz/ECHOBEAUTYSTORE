import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { SITE } from '../utils/site';

const LEGAL_PAGES = {
  '/mentions-legales': {
    title: 'Mentions Légales',
    content: `
<h2>Éditeur du site</h2>
<p><strong>${SITE.name}</strong><br/>
${SITE.address}<br/>
Téléphone : ${SITE.phone}<br/>
Email : ${SITE.email}</p>
<h2>Identification de l'entreprise</h2>
<p>Entreprise de droit béninois spécialisée dans la vente de produits de remise en forme, de massage, de minceur et de bien-être adulte.<br/>
${SITE.ifu}<br/>
${SITE.rccm}<br/>
Immatriculation au registre du commerce et du crédit mobilier (RCCM) — ${SITE.city}.</p>
<h2>Activité</h2>
<p>Vente au détail et en gros d'articles de remise en forme, instruments de massage, produits amaigrissants et accessoires bien-être adulte (réservés aux personnes majeures, 18+).<br/>
Zone de livraison : Cotonou (24-48h) et tout le Bénin.</p>
<h2>Hébergement</h2>
<p>Vercel Inc., 340 Pine Street, San Francisco, CA 94104, USA.<br/>Base de données : Supabase Inc., Singapore.</p>
<h2>Propriété intellectuelle</h2>
<p>Tout le contenu (textes, images, marques, logos) est la propriété exclusive de ${SITE.name}. Reproduction interdite sans autorisation écrite préalable.</p>
<h2>Droit applicable</h2>
<p>Les présentes mentions sont soumises au droit béninois. En cas de litige, juridiction compétente : ${SITE.city}, Bénin.</p>`,
  },

  '/politique-confidentialite': {
    title: 'Politique de Confidentialité',
    content: `
<h2>1. Responsable du traitement</h2>
<p>${SITE.name}, ${SITE.address} — ${SITE.email}</p>
<h2>2. Données collectées</h2>
<ul><li>Nom, prénom, email, téléphone, adresse de livraison</li><li>Historique des commandes</li><li>Données techniques de navigation (cookies)</li></ul>
<h2>3. Utilisation des données</h2>
<ul><li>Traitement et suivi de vos commandes</li><li>Livraison à Cotonou et dans tout le Bénin</li><li>Service client (email, téléphone, WhatsApp)</li><li>Amélioration de nos services</li></ul>
<h2>4. Protection des données</h2>
<p>Conformément à la loi n° 2017-20 du 20 avril 2018 portant code du numérique en République du Bénin, vos données sont protégées. Mots de passe chiffrés (bcrypt), JWT avec expiration, connexions HTTPS.</p>
<h2>5. Vos droits</h2>
<p>Accès, rectification, effacement et opposition de vos données. Contact : ${SITE.email}</p>`,
  },

  '/cgv': {
    title: 'Conditions Générales de Vente',
    content: `
<h2>Article 1 — Objet</h2>
<p>Les présentes CGV régissent les relations entre ${SITE.name} et tout acheteur via le site, pour des livraisons à Cotonou et partout au Bénin.</p>
<h2>Article 2 — Prix</h2>
<p>Prix affichés en Francs CFA (FCFA), toutes taxes comprises. Modifiables à tout moment sans préavis.</p>
<h2>Article 3 — Paiement</h2>
<p>Paiement par Mobile Money (MTN, Moov), virement bancaire ou à la livraison. Aucun frais caché.</p>
<h2>Article 4 — Livraison</h2>
<p>Livraison à Cotonou sous 24-48h et dans les autres villes du Bénin sous 2 à 5 jours ouvrés. Suivi de commande disponible en temps réel.</p>
<h2>Article 5 — Droit applicable</h2>
<p>Les présentes CGV sont soumises au droit béninois. Juridiction compétente : ${SITE.city}, Bénin.</p>`,
  },

  '/cookies': {
    title: 'Politique de Cookies',
    content: `
<h2>Cookies utilisés</h2>
<ul>
<li><code>ak_token</code> — Authentification JWT (session)</li>
<li><code>ak_user</code> — Données utilisateur en cache (session)</li>
<li><code>ak_lang</code> — Préférence de langue (1 an)</li>
<li><code>ak_theme</code> — Préférence de thème (1 an)</li>
<li><code>pc_cookies</code> — Consentement cookies (1 an)</li>
</ul>
<h2>Gestion</h2>
<p>Via la bannière à la première visite ou via les paramètres de votre navigateur.</p>
<h2>Contact</h2>
<p>${SITE.email}</p>`,
  },
};

export default function Legal() {
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const slug = location.pathname === '/politique-de-vente' ? '/cgv' : location.pathname;
  const page = LEGAL_PAGES[slug];

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  if (!page) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:80, fontWeight:900, color:'var(--red)' }}>404</p>
        <Link to="/" className="btn-gold" style={{ marginTop:20 }}>Accueil</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop: isMobile ? 88 : 100 }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '28px 5% 32px' : '56px 6% 44px', borderBottom:'1px solid var(--border)', background:'var(--bg-card2)' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-3)', textDecoration:'none', marginBottom:20, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600 }}>
            ← Retour
          </Link>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,5vw,60px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:20 }}>
            {page.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:820, margin:'0 auto', padding: isMobile ? '28px 5% 60px' : '52px 6% 80px' }}>
        <div className="legal-body" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>

      <style>{`
        .legal-body h2 { color: var(--text); font-size: ${isMobile?'18px':'22px'}; font-weight: 800; margin: 32px 0 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border); font-family: 'Outfit', sans-serif; }
        .legal-body h3 { color: var(--text-2); font-size: ${isMobile?'16px':'18px'}; font-weight: 700; margin: 22px 0 10px; font-family: 'Outfit', sans-serif; }
        .legal-body p  { color: var(--text-2); font-size: ${isMobile?'15px':'16px'}; line-height: 1.8; margin-bottom: 14px; }
        .legal-body ul { padding-left: 22px; margin-bottom: 14px; }
        .legal-body li { color: var(--text-2); font-size: ${isMobile?'15px':'16px'}; line-height: 1.8; margin-bottom: 7px; }
        .legal-body strong { color: var(--text); }
        .legal-body em    { color: var(--text-3); }
        .legal-body code  { background: var(--red-bg); color: var(--red); padding: 2px 8px; border-radius: 4px; font-size: 13px; }
        .legal-body a     { color: var(--red); }
      `}</style>
    </div>
  );
}
