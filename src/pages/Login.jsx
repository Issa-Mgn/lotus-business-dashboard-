import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Erreur de connexion. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="login-page">
      <button
        className="theme-button"
        onClick={toggleTheme}
        style={{ position: 'fixed', right: 24, top: 24 }}
        type="button"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="login-card animate-fade-in">
        <div className="login-logo">
          <img src={logo} alt="Lotus Business" />
        </div>
        <h1 className="login-title">Lotus Business</h1>
        <p className="login-subtitle">Panneau d'administration</p>

        <form className="form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <label className="field">
            <span className="field-label">
              <Mail size={16} />
              Email
            </span>
            <input
              className="input"
              disabled={loading}
              name="email"
              onChange={handleChange}
              placeholder="admin@lotus-business.com"
              required
              type="email"
              value={formData.email}
            />
          </label>

          <label className="field">
            <span className="field-label">
              <Lock size={16} />
              Mot de passe
            </span>
            <input
              className="input"
              disabled={loading}
              name="password"
              onChange={handleChange}
              placeholder="••••••••"
              required
              type="password"
              value={formData.password}
            />
          </label>

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="login-footer">© 2026 Lotus Business</p>
      </div>
    </div>
  );
};

export default Login;
