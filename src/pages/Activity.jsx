import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Calendar, User } from 'lucide-react';
import Badge from '../components/Badge';
import { activityAPI } from '../services/api';

const Activity = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const loadActivity = async () => {
    try {
      const [logsResponse, statsResponse] = await Promise.all([
        activityAPI.getAll(),
        activityAPI.getStats(),
      ]);
      setLogs(logsResponse.logs || []);
      setStats(statsResponse.stats || { total: 0, today: 0, thisWeek: 0 });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.type === filter;
  });

  const getActivityBadge = (type) => {
    const badges = {
      USER_CREATED: 'success',
      USER_SUSPENDED: 'warning',
      USER_REACTIVATED: 'success',
      LICENSE_SENT: 'info',
      EMAIL_SENT: 'info',
      ADMIN_CREATED: 'success',
      LOGIN: 'info',
      LOGOUT: 'info',
    };
    return badges[type] || 'info';
  };

  const getActivityLabel = (type) => {
    const labels = {
      USER_CREATED: 'Utilisateur créé',
      USER_SUSPENDED: 'Utilisateur suspendu',
      USER_REACTIVATED: 'Utilisateur réactivé',
      LICENSE_SENT: 'Licence envoyée',
      EMAIL_SENT: 'Email envoyé',
      ADMIN_CREATED: 'Admin créé',
      LOGIN: 'Connexion',
      LOGOUT: 'Déconnexion',
    };
    return labels[type] || type;
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Journal d'activité</h1>
          <p className="page-subtitle">{logs.length} événement{logs.length > 1 ? 's' : ''}</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon">
              <ActivityIcon size={20} />
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <h3 className="stat-value">{stats.total}</h3>
            <p className="stat-label">Total événements</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon">
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <h3 className="stat-value">{stats.today}</h3>
            <p className="stat-label">Aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon">
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <h3 className="stat-value">{stats.thisWeek}</h3>
            <p className="stat-label">Cette semaine</p>
          </div>
        </div>
      </section>

      <div className="toolbar">
        <select className="select" onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="ALL">Tous les types</option>
          <option value="USER_CREATED">Utilisateur créé</option>
          <option value="USER_SUSPENDED">Utilisateur suspendu</option>
          <option value="USER_REACTIVATED">Utilisateur réactivé</option>
          <option value="LICENSE_SENT">Licence envoyée</option>
          <option value="EMAIL_SENT">Email envoyé</option>
          <option value="ADMIN_CREATED">Admin créé</option>
          <option value="LOGIN">Connexion</option>
          <option value="LOGOUT">Déconnexion</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <ActivityIcon size={48} style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }} />
          <p>Aucune activité enregistrée</p>
        </div>
      ) : (
        <div className="list-panel">
          {filteredLogs.map((log) => (
            <div className="list-row" key={log.id} style={{ alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ width: 40, height: 40, flexShrink: 0 }}>
                <ActivityIcon size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: 'var(--spacing-xs)' }}>
                  <span className="strong">{getActivityLabel(log.type)}</span>
                  <Badge variant={getActivityBadge(log.type)}>{log.type}</Badge>
                </div>
                <p className="muted" style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-word' }}>
                  {log.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-xs)' }}>
                  {log.admin && (
                    <span className="muted inline-cell" style={{ fontSize: 'var(--text-xs)' }}>
                      <User size={12} />
                      {log.admin}
                    </span>
                  )}
                  <span className="muted" style={{ fontSize: 'var(--text-xs)' }}>
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </span>
                  {log.ipAddress && (
                    <span className="muted mono" style={{ fontSize: 'var(--text-xs)' }}>
                      {log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activity;
