import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatFCFA } from '../utils/helpers';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { t } from '../utils/i18n';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const l = lang || 'fr';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      // On passe l'objet product complet pour supporter le panier invité
      await addItem(product, 'full');
      addToast(`${product.name} — ${t('add_to_cart', l)} ✓`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error', 'error');
    } finally { setAdding(false); }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:index*0.06, duration:0.55, ease:[0.16,1,0.3,1] }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      className="product-card"
      style={{
        background:'var(--bg-card)', borderRadius:12, overflow:'hidden',
        border:`1px solid ${hovered?'rgba(200,16,46,0.3)':'var(--border)'}`,
        transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform:hovered?'translateY(-5px)':'translateY(0)',
        boxShadow:hovered?'var(--shadow-md)':'var(--shadow-sm)',
      }}>

      {/* Image */}
      <Link to={`/products/${product.id}`} style={{ display:'block', position:'relative', overflow:'hidden' }}>
        <img src={product.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=70'}
          alt={product.name}
          className="product-img-zoom"
          style={{ width:'100%', height:190, objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />

        {/* Badges */}
        <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:7 }}>
          {product.category === 'JOUETS_ADULTES' && (
            <span style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3, border:'1px solid rgba(255,255,255,0.3)' }}>🔞 18+</span>
          )}
          {product.featured && (
            <span style={{ background:'#C8102E', color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3 }}>★ Top</span>
          )}
          {isOutOfStock && (
            <span style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', color:'#EF4444', fontSize:9, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3, border:'1px solid rgba(239,68,68,0.3)' }}>
              {t('out_of_stock', l)}
            </span>
          )}
        </div>
        <span style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', color:'rgba(255,255,255,0.75)', fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 10px', borderRadius:3 }}>
          {product.category.replace('_', ' ')}
        </span>

        {/* Hover overlay */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', padding:14, opacity:hovered?1:0, transition:'opacity 0.25s' }}>
          <Link to={`/products/${product.id}`} onClick={e => e.stopPropagation()}
            style={{ width:'100%', textAlign:'center', background:'rgba(255,255,255,0.14)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', padding:'10px 0', borderRadius:6, fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none' }}>
            {t('view_product', l)} →
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding:'18px 20px 20px' }}>
        <Link to={`/products/${product.id}`} style={{ textDecoration:'none' }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:'var(--text)', letterSpacing:'-0.01em', marginBottom:3, lineHeight:1.1, transition:'color 0.2s' }}
            onMouseOver={e=>e.target.style.color='var(--red)'} onMouseOut={e=>e.target.style.color='var(--text)'}>
            {product.name}
          </h3>
        </Link>
        <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:14, fontWeight:500 }}>
          {product.subcategory || ''}{product.volume ? ` · ${product.volume}` : ''}
        </p>

        <div style={{ display:'flex', gap:14, marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13 }}>
            <span style={{ color:'var(--red)' }}>📦</span>
            <span style={{ color:product.stock>0?'var(--green)':'#DC2626', fontWeight:600 }}>
              {product.stock>0?`${product.stock} ${t('in_stock', l)}`:t('out_of_stock', l)}
            </span>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:10 }}>
          <div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1 }}>
              {formatFCFA(product.price)}
            </div>
          </div>
          <button onClick={handleAddToCart} disabled={isOutOfStock||adding}
            style={{ padding:'10px 16px', borderRadius:6, fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', cursor:isOutOfStock?'not-allowed':'pointer', border:'none', fontFamily:"'Outfit',sans-serif", transition:'all 0.2s', background:isOutOfStock?'var(--bg-card2)':adding?'rgba(200,16,46,0.5)':'var(--red)', color:isOutOfStock?'var(--text-3)':'#fff', flexShrink:0 }}
            onMouseOver={e=>{ if(!isOutOfStock&&!adding) e.currentTarget.style.background='var(--red-dark)'; }}
            onMouseOut={e=>{ if(!isOutOfStock&&!adding) e.currentTarget.style.background='var(--red)'; }}>
            {adding?'...':isOutOfStock?t('out_of_stock',l):'+ '+t('add_to_cart',l).split(' ')[0]}
          </button>
        </div>
      </div>
    </motion.div>
  );
}