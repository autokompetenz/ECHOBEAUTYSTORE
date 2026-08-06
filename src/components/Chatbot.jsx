import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store';
import { SITE } from '../utils/site';

const RESPONSES = {
  fr: {
    default:  `Merci pour votre message ! Notre équipe vous répond rapidement.\n📞 ${SITE.phone}\n📧 ${SITE.email}`,
    horaires: "Nos horaires :\n🕗 Lun–Ven : 09h00 – 18h00\n🕘 Samedi : 09h00 – 14h00\n❌ Dimanche : Fermé",
    prix:     "Tarifs compétitifs détail et gros !\nRemises volume disponibles pour les professionnels.\n\n💬 WhatsApp : " + SITE.phone + "\n📧 " + SITE.email,
    rdv:      `Pour prendre rendez-vous ou être conseillé :\n\n💬 WhatsApp : ${SITE.phone}\n📧 ${SITE.email}\n\nNous répondons rapidement !`,
    adresse:  `📍 Notre boutique :\n${SITE.address}\n\n🛵 Livraison à Cotonou en 24-48h et partout au Bénin !`,
    bonjour:  `Bonjour ! Bienvenue chez Echo Beauty Store 👋\n\nComment puis-je vous aider ?\n• Horaires d'ouverture\n• Prendre rendez-vous\n• Tarifs & devis\n• Notre adresse`,
    garantie: "Oui ! Nous offrons une garantie sur :\n✅ Tous les produits vendus\n✅ Produits authentiques certifiés\n✅ Service après-vente inclus\nVotre satisfaction est notre priorité !",
    catalogue: `Découvrez notre catalogue en ligne :\n💪 Remise en forme\n💆 Instruments de massage\n⚖️ Produits amaigrissants\n🔞 Accessoires adultes (18+)\n\n✨ Livraison à Cotonou en 24-48h !\n📞 ${SITE.phone}`,
  },
};

const QUICK_BUTTONS = ['Horaires', 'Rendez-vous', 'Adresse', 'Tarifs', 'Garantie'];

function detect(msg) {
  const m = msg.toLowerCase();
  const R = RESPONSES.fr;
  if (/hello|bonjour|salut|hi/.test(m)) return R.bonjour;
  if (/heure|horaire|ouvert/.test(m)) return R.horaires;
  if (/prix|tarif|devis|coute|combien/.test(m)) return R.prix;
  if (/rendez|rdv|réserv|conseil/.test(m)) return R.rdv;
  if (/adresse|où|lieu|livraison|livrer/.test(m)) return R.adresse;
  if (/garantie|retour|rembours/.test(m)) return R.garantie;
  if (/marque|brand|produit|catalogue|gamme|catégorie/.test(m)) return R.catalogue;
  return R.default;
}

export default function Chatbot() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const R  = RESPONSES.fr;
  const QB = QUICK_BUTTONS;

  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([{ from: 'bot', text: R.bonjour }]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const [notif, setNotif]   = useState(true);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  // Theme-aware colors — no more hardcoded dark values
  const winBg      = isDark ? '#0f0f0f'                 : '#ffffff';
  const winBorder  = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.1)';
  const msgBotBg   = isDark ? '#1e1e1e'                 : '#f0f0f0';
  const msgBotText = isDark ? '#e8e8e8'                 : '#111111';
  const msgUserText= '#ffffff';
  const inputBg    = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const inputBorder= isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.12)';
  const inputText  = isDark ? '#e8e8e8'                 : '#111111';
  const inputPh    = isDark ? 'rgba(255,255,255,0.35)'  : 'rgba(0,0,0,0.35)';
  const footerBg   = isDark ? '#141414'                 : '#f8f8f8';
  const footerBord = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.08)';
  const dotBg      = isDark ? '#555'                    : '#bbb';
  const quickBg    = isDark ? 'rgba(200,16,46,0.08)'    : 'rgba(200,16,46,0.06)';
  const quickBd    = isDark ? 'rgba(200,16,46,0.2)'     : 'rgba(200,16,46,0.25)';
  const quickText  = isDark ? 'rgba(255,255,255,0.7)'   : '#C8102E';
  const quickHoverBg   = isDark ? 'rgba(200,16,46,0.18)' : 'rgba(200,16,46,0.14)';
  const quickHoverText = '#C8102E';

  useEffect(() => {
    setMsgs([{ from: 'bot', text: RESPONSES.fr.bonjour }]);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);
  useEffect(() => { if (open) { setNotif(false); setTimeout(() => inputRef.current?.focus(), 300); } }, [open]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMsgs(m => [...m, { from: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: detect(msg) }]);
    }, 800 + Math.random() * 600);
  };

  const placeholders  = 'Votre question...';
  const headerStatus  = 'En ligne · Répond rapidement';

  return (
    <>
      {/* Trigger button */}
      <button className="chat-btn" onClick={() => setOpen(o => !o)} aria-label="Chat">
        <span style={{ fontSize: 26 }}>{open ? '✕' : '💬'}</span>
        {!open && notif && <div className="chat-notif">1</div>}
      </button>

      {/* Window */}
      <div
        className={`chat-window ${open ? 'open' : 'closed'}`}
        style={{
          background: winBg,
          border: `1px solid ${winBorder}`,
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.6)'
            : '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header — always red gradient, always readable */}
        <div style={{ background: 'linear-gradient(135deg, #9B0B22, #C8102E)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🛍️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.02em' }}>
              Echo Beauty Store
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
              {headerStatus}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: winBg }}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                maxWidth: '88%',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: "'Outfit', sans-serif",
                background: m.from === 'bot' ? msgBotBg : '#C8102E',
                color:      m.from === 'bot' ? msgBotText : msgUserText,
                alignSelf:  m.from === 'bot' ? 'flex-start' : 'flex-end',
                borderBottomLeftRadius:  m.from === 'bot'  ? 3 : 12,
                borderBottomRightRadius: m.from === 'user' ? 3 : 12,
              }}
            >
              {m.text}
            </motion.div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: msgBotBg, borderRadius: 12, alignSelf: 'flex-start', borderBottomLeftRadius: 3 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 7, height: 7, background: dotBg, borderRadius: '50%', display: 'block', animation: 'bounce 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick replies */}
        {msgs.length <= 2 && (
          <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, background: winBg }}>
            {QB.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{
                  background: quickBg,
                  border: `1px solid ${quickBd}`,
                  color: quickText,
                  fontSize: 12, fontWeight: 600,
                  padding: '6px 12px', borderRadius: 20,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = quickHoverBg; e.currentTarget.style.color = quickHoverText; }}
                onMouseOut={e => { e.currentTarget.style.background = quickBg; e.currentTarget.style.color = quickText; }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderTop: `1px solid ${footerBord}`, background: footerBg, flexShrink: 0 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={placeholders}
            style={{
              flex: 1,
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: inputText,
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: "'Outfit', sans-serif",
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#C8102E'}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />
          {/* Placeholder color via CSS var trick */}
          <style>{`
            .chat-window input::placeholder { color: ${inputPh}; }
            @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
          `}</style>
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? '#C8102E' : (isDark ? 'rgba(200,16,46,0.3)' : 'rgba(200,16,46,0.2)'),
              border: 'none', borderRadius: 8,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              width: 42, height: 42,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, flexShrink: 0,
              transition: 'background 0.2s',
            }}>
            ➤
          </button>
        </div>
      </div>
    </>
  );
}