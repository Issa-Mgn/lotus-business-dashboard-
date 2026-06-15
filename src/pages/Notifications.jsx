import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import { notificationsAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((current) =>
        current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Supprimer cette notification ?')) return;

    try {
      await notificationsAPI.delete(notificationId);
      setNotifications((current) => current.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type) => {
    return Bell;
  };

  const getNotificationBadge = (type) => {
    const badges = {
      INFO: 'info',
      SUCCESS: 'success',
      WARNING: 'warning',
      ERROR: 'danger',
    };
    return badges[type] || 'info';
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune notification non lue'}
          </p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="ghost-button" onClick={handleMarkAllAsRead} type="button">
              <span className="inline-cell">
                <CheckCheck size={16} />
                Tout marquer comme lu
              </span>
            </button>
          )}
        </div>
      </header>

      <div className="toolbar">
        <select className="select" onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="ALL">Toutes les notifications</option>
          <option value="UNREAD">Non lues</option>
          <option value="READ">Lues</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <BellOff size={48} style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }} />
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="list-panel">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);

            return (
              <div
                className="list-row"
                key={notification.id}
                style={{
                  background: notification.isRead ? 'transparent' : 'var(--color-surface-2)',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  className="stat-icon"
                  style={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    background: notification.isRead ? 'var(--color-surface-2)' : 'var(--color-accent)',
                    color: notification.isRead ? 'var(--color-muted)' : 'var(--color-bg)',
                  }}
                >
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: 'var(--spacing-xs)' }}>
                    <span className="strong">{notification.title}</span>
                    <Badge variant={getNotificationBadge(notification.type)}>{notification.type}</Badge>
                  </div>
                  <p className="muted" style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-word' }}>
                    {notification.message}
                  </p>
                  <p className="muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-xs)' }}>
                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexShrink: 0 }}>
                  {!notification.isRead && (
                    <button
                      className="icon-button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Marquer comme lu"
                      type="button"
                    >
                      <CheckCheck size={18} />
                    </button>
                  )}
                  <button
                    className="danger-action"
                    onClick={() => handleDelete(notification.id)}
                    title="Supprimer"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
