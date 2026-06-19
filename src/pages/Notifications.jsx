/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Bell, Plus, Send, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import { notificationsAPI } from '../services/api';

const initialForm = {
  type: 'NEW_USER',
  title: '',
  message: '',
  userId: '', // Optionnel - si vide, notif globale
};

const notificationTypes = [
  { value: 'LICENSE_EXPIRED', label: 'Licence expirée' },
  { value: 'LICENSE_EXPIRING_SOON', label: 'Licence expire bientôt' },
  { value: 'NEW_USER', label: 'Nouvel utilisateur' },
  { value: 'USER_SUSPENDED', label: 'Utilisateur suspendu' },
  { value: 'USER_UPGRADED', label: 'Utilisateur upgradé' },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setMessage('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setMessage('');

    try {
      const response = await notificationsAPI.create({
        ...formData,
        userId: formData.userId || null, // Notification globale si userId vide
      });
      setNotifications((current) => [response.notification, ...current]);
      setFormData(initialForm);
      setMessage('Notification envoyée avec succès.');
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      setMessage(error.response?.data?.error || 'Impossible d\'envoyer la notification.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Supprimer cette notification ?')) {
      return;
    }

    try {
      await notificationsAPI.remove(notificationId);
      setNotifications((current) => current.filter((notif) => notif.id !== notificationId));
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      alert('Impossible de supprimer la notification.');
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      LICENSE_EXPIRED: { label: 'Expiré', variant: 'danger' },
      LICENSE_EXPIRING_SOON: { label: 'Expire bientôt', variant: 'warning' },
      NEW_USER: { label: 'Nouveau', variant: 'success' },
      USER_SUSPENDED: { label: 'Suspendu', variant: 'danger' },
      USER_UPGRADED: { label: 'Upgradé', variant: 'success' },
    };

    const config = typeConfig[type] || { label: type, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Envoyer des notifications push aux utilisateurs de l'app mobile.</p>
        </div>
      </header>

      <section className="split-layout info-layout">
        <form className="surface-panel info-form-panel" onSubmit={handleSubmit}>
          <h2 className="section-title">
            <span className="inline-cell">
              <Plus size={20} /> Nouvelle notification
            </span>
          </h2>

          <div className="form">
            <label className="field">
              <span className="field-label">Type</span>
              <select className="input" name="type" onChange={handleChange} required value={formData.type}>
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Titre</span>
              <input className="input" name="title" onChange={handleChange} required value={formData.title} />
            </label>

            <label className="field">
              <span className="field-label">Message</span>
              <textarea
                className="input textarea"
                name="message"
                onChange={handleChange}
                placeholder="Message de la notification..."
                required
                rows="5"
                value={formData.message}
              />
            </label>

            <label className="field">
              <span className="field-label">
                User ID (optionnel)
                <span className="muted" style={{ fontSize: 'var(--text-xs)', display: 'block', marginTop: '4px' }}>
                  Laissez vide pour envoyer à tous les utilisateurs
                </span>
              </span>
              <input
                className="input"
                name="userId"
                onChange={handleChange}
                placeholder="ID de l'utilisateur ciblé (optionnel)"
                value={formData.userId}
              />
            </label>

            {message && <p className={`form-message ${message.includes('succès') ? '' : 'error'}`}>{message}</p>}

            <button className="primary-button" disabled={sending} type="submit">
              <span className="inline-cell">
                <Send size={16} />
                {sending ? 'Envoi...' : 'Envoyer'}
              </span>
            </button>
          </div>
        </form>

        <div className="info-list">
          {loading ? (
            <div className="loading-state">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }} />
              <p>Aucune notification envoyée.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <article className="info-item" key={notif.id} style={{ border: notif.isRead ? '1px solid var(--color-border)' : '2px solid var(--color-accent)' }}>
                <div className="info-image-placeholder" style={{ background: notif.isRead ? 'var(--color-border)' : 'var(--color-accent)' }}>
                  <Bell size={22} style={{ color: notif.isRead ? 'var(--color-muted)' : 'white' }} />
                </div>

                <div className="info-content">
                  <div className="info-title-row">
                    <h2>{notif.title}</h2>
                    {getTypeBadge(notif.type)}
                  </div>
                  <p>{notif.message}</p>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginTop: 'var(--spacing-xs)' }}>
                    <span className="muted">{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                    {notif.userId && (
                      <Badge variant="default" style={{ fontSize: 'var(--text-xs)' }}>
                        User ID: {notif.userId.substring(0, 8)}...
                      </Badge>
                    )}
                    {!notif.userId && (
                      <Badge variant="accent" style={{ fontSize: 'var(--text-xs)' }}>
                        Notification globale
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="info-actions">
                  <button className="danger-action" onClick={() => handleDelete(notif.id)} type="button" title="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Notifications;
