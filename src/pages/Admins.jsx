/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Mail, Send, ShieldCheck, UserPlus } from 'lucide-react';
import Table from '../components/Table';
import { adminsAPI, usersAPI } from '../services/api';

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
  const [users, setUsers] = useState([]);
  const [licenseEmailUserId, setLicenseEmailUserId] = useState('');
  const [licenseEmailStatus, setLicenseEmailStatus] = useState('');
  const [sendingLicenseEmail, setSendingLicenseEmail] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const loadAdmins = async () => {
    try {
      setLoadError('');
      const [adminsResponse, usersResponse] = await Promise.all([
        adminsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setAdmins(adminsResponse.admins || []);
      setUsers(usersResponse.users || []);
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

  const handleSendLicenseEmail = async (event) => {
    event.preventDefault();
    setSendingLicenseEmail(true);
    setLicenseEmailStatus('');

    try {
      await adminsAPI.sendLicenseEmail(licenseEmailUserId);
      setLicenseEmailStatus('Mail de licence envoyé avec succès.');
    } catch (error) {
      console.error('Erreur envoi mail licence:', error);
      setLicenseEmailStatus(error.response?.data?.detail || error.response?.data?.error || "Impossible d'envoyer le mail de licence.");
    } finally {
      setSendingLicenseEmail(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleUserChange = (e) => {
    setUserFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMessage('');

    try {
      const response = await usersAPI.register(userFormData);
      setUsers((current) => [response.user, ...current]);
      setLicenseEmailUserId(response.user.id);
      setUserFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
      setUserMessage('Utilisateur créé avec succès. Le mail de licence a été envoyé.');
    } catch (error) {
      console.error('Erreur creation utilisateur:', error);
      setUserMessage(error.response?.data?.error || "Erreur lors de la création de l'utilisateur.");
    } finally {
      setCreatingUser(false);
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

      <section className="email-panel">
        <div className="email-panel-header">
          <div>
            <h2 className="section-title">Renvoyer un mail de licence</h2>
            <p className="page-subtitle">Choisir un utilisateur et lui renvoyer le mail standard avec sa clé.</p>
          </div>
          <div className="stat-icon">
            <Mail size={20} />
          </div>
        </div>

        <form className="email-form" onSubmit={handleSendLicenseEmail}>
          <div className="email-grid">
            <label className="field">
              <span className="field-label">Utilisateur</span>
              <select
                className="select"
                onChange={(event) => setLicenseEmailUserId(event.target.value)}
                required
                value={licenseEmailUserId}
              >
                <option value="">Selectionner un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="email-actions">
            {licenseEmailStatus && <p className="muted">{licenseEmailStatus}</p>}
            <button className="primary-button" disabled={sendingLicenseEmail || users.length === 0} type="submit">
              <span className="inline-cell">
                <Send size={16} />
                {sendingLicenseEmail ? 'Envoi...' : 'Renvoyer le mail'}
              </span>
            </button>
          </div>
        </form>
      </section>

      <section className="split-layout" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <form className="surface-panel" onSubmit={handleCreateUser} style={{ padding: 'var(--spacing-lg)' }}>
          <h2 className="section-title" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <UserPlus size={20} />
            Ajouter un utilisateur
          </h2>

          <div className="form" style={{ marginTop: 'var(--spacing-lg)' }}>
            <label className="field">
              <span className="field-label">Prénom</span>
              <input className="input" name="firstName" onChange={handleUserChange} required value={userFormData.firstName} />
            </label>
            <label className="field">
              <span className="field-label">Nom</span>
              <input className="input" name="lastName" onChange={handleUserChange} required value={userFormData.lastName} />
            </label>
            <label className="field">
              <span className="field-label">Email</span>
              <input className="input" name="email" onChange={handleUserChange} required type="email" value={userFormData.email} />
            </label>
            <label className="field">
              <span className="field-label">Téléphone</span>
              <input className="input" name="phone" onChange={handleUserChange} required type="tel" value={userFormData.phone} />
            </label>

            {userMessage && <p className="muted">{userMessage}</p>}

            <button className="primary-button" disabled={creatingUser} type="submit">
              {creatingUser ? 'Création...' : "Créer l'utilisateur"}
            </button>
          </div>
        </form>

        <div className="surface-panel" style={{ padding: 'var(--spacing-lg)' }}>
          <h2 className="section-title">Inscription depuis le tableau de bord</h2>
          <p className="page-subtitle">
            Cette action crée le compte, génère automatiquement la clé de licence FREE et envoie le mail de licence au nouvel utilisateur.
          </p>
        </div>
      </section>

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
