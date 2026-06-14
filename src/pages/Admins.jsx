/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import Table from '../components/Table';
import { adminsAPI } from '../services/api';

const getAdminDisplayName = (admin) => {
  const emailName = admin.email?.split('@')[0] || 'admin';

  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  const loadAdmins = async () => {
    try {
      setLoadError('');
      const adminsResponse = await adminsAPI.getAll();
      setAdmins(adminsResponse.admins || []);
    } catch (error) {
      console.error('Erreur lors du chargement des admins:', error);
      setLoadError(
        error.response?.status === 404
          ? "La route admins n'est pas encore disponible sur l'API utilisee par le dashboard."
          : "Impossible de recuperer la liste des administrateurs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await adminsAPI.create(formData);
      setAdmins((current) => [response.admin, ...current]);
      setFormData({ email: '', phone: '', password: '' });
      setMessage('Admin cree avec succes.');
    } catch (error) {
      console.error('Erreur creation admin:', error);
      setMessage(error.response?.data?.error || "Erreur lors de la creation de l'admin.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Nom',
      field: 'name',
      render: (row) => (
        <div className="inline-cell">
          <div className="avatar">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="strong">{getAdminDisplayName(row)}</div>
            <div className="muted" style={{ fontSize: 'var(--text-sm)' }}>Administrateur</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      field: 'email',
    },
    {
      header: 'Telephone',
      field: 'phone',
      render: (row) => row.phone || '-',
    },
    {
      header: 'Date creation',
      field: 'createdAt',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-'),
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Administrateurs</h1>
          <p className="page-subtitle">{admins.length} administrateur{admins.length > 1 ? 's' : ''}</p>
        </div>
      </header>

      <section className="split-layout">
        <form className="surface-panel" onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
          <h2 className="section-title" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <UserPlus size={20} />
            Creer un admin
          </h2>

          <div className="form" style={{ marginTop: 'var(--spacing-lg)' }}>
            <label className="field">
              <span className="field-label">Email</span>
              <input className="input" name="email" onChange={handleChange} required type="email" value={formData.email} />
            </label>
            <label className="field">
              <span className="field-label">Telephone</span>
              <input className="input" name="phone" onChange={handleChange} required type="tel" value={formData.phone} />
            </label>
            <label className="field">
              <span className="field-label">Mot de passe</span>
              <input className="input" name="password" onChange={handleChange} required type="password" value={formData.password} />
            </label>

            {message && <p className="muted">{message}</p>}

            <button className="primary-button" disabled={saving} type="submit">
              {saving ? 'Creation...' : 'Creer'}
            </button>
          </div>
        </form>

        <div>
          {loading ? (
            <div className="loading-state">Chargement...</div>
          ) : loadError ? (
            <div className="empty-state">
              <p>{loadError}</p>
            </div>
          ) : (
            <Table columns={columns} data={admins} emptyMessage="Aucun administrateur trouve" />
          )}
        </div>
      </section>
    </div>
  );
};

export default Admins;
