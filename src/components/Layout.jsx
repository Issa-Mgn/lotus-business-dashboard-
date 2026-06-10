import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import logo from '../assets/logo.jpeg';

const Layout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', border: 0, borderRadius: 0 }}>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <button
          className="icon-button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="topbar-logo">
          <img src={logo} alt="Lotus Business" />
          <span>Lotus Business</span>
        </div>
        <span aria-hidden="true" style={{ width: 36 }} />
      </div>

      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
