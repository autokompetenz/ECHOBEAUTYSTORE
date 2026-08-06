import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useLangStore } from './store/index';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Chatbot from './components/Chatbot';
import ClientBottomNav, { useClientBottomNavPadding } from './components/ClientBottomNav';

// Pages
import Home         from './pages/Home';
import Catalog      from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart         from './pages/Cart';
import Track        from './pages/Track';
import OrderConfirm from './pages/OrderConfirm';
import Orders       from './pages/Orders';
import Dashboard    from './pages/Dashboard';
import Profile      from './pages/Profile';
import Login        from './pages/Login';
import Reviews      from './pages/Reviews';
import Legal        from './pages/Legal';

// Admin
import AdminLayout      from './pages/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminClients     from './pages/admin/AdminClients';

function RequireAdminAuth({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function MainLayout({ children }) {
  const paddingBottom = useClientBottomNavPadding();
  return (
    <>
      <Navbar />
      <div style={paddingBottom ? { paddingBottom } : undefined}>{children}</div>
      <ClientBottomNav />
      <Chatbot />
    </>
  );
}

export default function App() {
  const { lang } = useLangStore();

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public — no auth required */}
        <Route path="/"         element={<MainLayout><Home /></MainLayout>} />
        <Route path="/catalog"  element={<MainLayout><Catalog /></MainLayout>} />
        <Route path="/products/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
        <Route path="/cart"     element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/track"    element={<MainLayout><Track /></MainLayout>} />
        <Route path="/track/:orderNumber" element={<MainLayout><Track /></MainLayout>} />
        <Route path="/order-confirm/:orderNumber" element={<MainLayout><OrderConfirm /></MainLayout>} />
        <Route path="/avis"     element={<MainLayout><Reviews /></MainLayout>} />

        {/* Legal */}
        <Route path="/mentions-legales"          element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/politique-confidentialite"  element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/politique-de-vente"          element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/cgv"                         element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/cookies"                     element={<MainLayout><Legal /></MainLayout>} />

        {/* Admin login (only entry point for auth) */}
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />

        {/* Protected — admin only */}
        <Route path="/orders"   element={<MainLayout><Orders /></MainLayout>} />
        <Route path="/dashboard"element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/profile"  element={<MainLayout><Profile /></MainLayout>} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index             element={<AdminDashboard />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products"       element={<AdminProducts />} />
          <Route path="products/new"   element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="clients"    element={<AdminClients />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <MainLayout>
            <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', background:'var(--bg)' }}>
              <div>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:120, fontWeight:900, color:'#C8102E', lineHeight:1, letterSpacing:'-0.05em' }}>404</p>
                <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:32, fontWeight:700, color:'var(--text)', marginBottom:32 }}>Page introuvable</h1>
                <a href="/" className="btn-primary" style={{ fontSize:14, padding:'16px 40px' }}>← Accueil</a>
              </div>
            </div>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
