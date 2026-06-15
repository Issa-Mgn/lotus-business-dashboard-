import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  Newspaper,
  Settings,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.jpeg';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/users', icon: Users, label: 'Utilisateurs' },
  { path: '/licenses', icon: KeyRound, label: 'Licences' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/activity', icon: Activity, label: 'Activité' },
  { path: '/admins', icon: ShieldCheck, label: 'Administrateurs' },
  { path: '/infos', icon: Newspaper, label: 'Infos' },
  { path: '/settings', icon: Settings, label: 'Paramètres' },
];

const Sidebar = ({ open = false, onNavigate }) => {
  const location = useLocation();
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path, exact = false) => (
    exact ? location.pathname === path : location.pathname.startsWith(path)
  );

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logo} alt="Lotus Business" />
        </div>
        <h1 className="sidebar-title">Lotus Business</h1>
        <p className="sidebar-kicker">Admin Panel</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);

          return (
            <Link
              className={`nav-item ${active ? 'active' : ''}`}
              key={item.path}
              onClick={onNavigate}
              title={item.label}
              to={item.path}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-card">
          <div className="avatar">{admin?.email?.charAt(0).toUpperCase()}</div>
          <div className="admin-meta">
            <p className="admin-email">{admin?.email}</p>
            <span className="role-badge">Admin</span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button
            className="theme-button"
            onClick={toggleTheme}
            title={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="logout-button" onClick={logout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
