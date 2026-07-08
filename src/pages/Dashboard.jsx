/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Clock, Download, KeyRound, Users, Wallet } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { licensesAPI, usersAPI, downloadsAPI } from '../services/api';

const LICENSE_PRICES_FCFA = {
  FREE: 0,
  MONTHLY: Number(import.meta.env.VITE_MONTHLY_PRICE_FCFA || 999),
  ANNUAL: Number(import.meta.env.VITE_ANNUAL_PRICE_FCFA || 10000),
};

const getLicenseDurationDays = (user) => {
  const startDate = new Date(user.activationDate || user.createdAt);
  const endDate = new Date(user.expirationDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
};

const getLicensePrice = (user) => {
  if (!user || user.licenseType === 'FREE') {
    return LICENSE_PRICES_FCFA.FREE;
  }

  if (user.licenseType === 'ANNUAL') {
    return LICENSE_PRICES_FCFA.ANNUAL;
  }

  if (user.licenseType === 'MONTHLY') {
    return LICENSE_PRICES_FCFA.MONTHLY;
  }

  const durationDays = getLicenseDurationDays(user);

  if (durationDays >= 300) {
    return LICENSE_PRICES_FCFA.ANNUAL;
  }

  if (durationDays > 0) {
    return LICENSE_PRICES_FCFA.MONTHLY;
  }

  return LICENSE_PRICES_FCFA.FREE;
};

const formatCurrency = (amount) => (
  new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'XOF',
  }).format(amount)
);

const monthLabel = (date) => (
  new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date)
);

const buildRevenueChart = (users) => {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthLabel(date),
      revenue: 0,
      cumulativeRevenue: 0,
    };
  });

  const monthMap = new Map(months.map((month) => [month.key, month]));

  users.forEach((user) => {
    const price = getLicensePrice(user);
    if (price <= 0) return;

    const date = new Date(user.activationDate || user.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = monthMap.get(key);

    if (month) {
      month.revenue += price;
    }
  });

  let cumulativeRevenue = 0;
  months.forEach((month) => {
    cumulativeRevenue += month.revenue;
    month.cumulativeRevenue = cumulativeRevenue;
  });

  return months;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLicenses: 0,
    activeLicenses: 0,
    expiringSoon: 0,
    totalRevenue: 0,
    totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [expiringLicenses, setExpiringLicenses] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);

  const loadDashboardData = async () => {
    try {
      const usersResponse = await usersAPI.getAll();
      const users = usersResponse.users || [];
      const licensesResponse = licensesAPI.fromUsers(users);
      const licenses = licensesResponse.licenses || [];
      const activeLicenses = licenses.filter((license) => license.status === 'ACTIVE').length;
      const totalRevenue = users.reduce((total, user) => (
        total + getLicensePrice(user)
      ), 0);
      const soon = licenses
        .map((license) => ({
          ...license,
          daysLeft: Math.ceil((new Date(license.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
        }))
        .filter((license) => license.daysLeft <= 7 && license.daysLeft > 0)
        .sort((a, b) => a.daysLeft - b.daysLeft);

      // Charger les statistiques de téléchargements
      let totalDownloads = 0;
      try {
        const downloadCount = await downloadsAPI.getCount();
        totalDownloads = downloadCount.total || 0;
      } catch (error) {
        console.error('Erreur chargement téléchargements:', error);
      }

      setStats({
        totalUsers: users.length,
        totalLicenses: licenses.length,
        activeLicenses,
        expiringSoon: soon.length,
        totalRevenue,
        totalDownloads,
      });

      setRevenueChart(buildRevenueChart(users));
      setRecentUsers(
        [...users]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );
      setExpiringLicenses(soon.slice(0, 5));
    } catch (error) {
      console.error('Erreur lors du chargement des donnees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="page"><div className="loading-state">Chargement...</div></div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vue d'ensemble de la plateforme Lotus Business</p>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard icon={Users} label="Total utilisateurs" value={stats.totalUsers} color="primary" />
        <StatCard icon={KeyRound} label="Licences actives" value={stats.activeLicenses} color="success" />
        <StatCard icon={Download} label="Téléchargements" value={stats.totalDownloads} color="primary" />
        <StatCard icon={Clock} label="Expirent dans 7 jours" value={stats.expiringSoon} color="warning" />
        <StatCard icon={Wallet} label="Revenus totaux" value={formatCurrency(stats.totalRevenue)} color="success" />
      </section>

      <section className="chart-panel">
        <div className="chart-header">
          <div>
            <h2 className="section-title">Variation des revenus</h2>
            <p className="page-subtitle">Courbe cumulative des licences achetees</p>
          </div>
          <Badge variant="success">{formatCurrency(stats.totalRevenue)}</Badge>
        </div>

        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                tickLine={false}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-accent)',
                }}
                cursor={{ stroke: 'var(--color-border-strong)' }}
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === 'cumulativeRevenue' ? 'Total cumule' : 'Revenus',
                ]}
                labelStyle={{ color: 'var(--color-muted)' }}
              />
              <Area
                activeDot={{ r: 6, stroke: 'var(--color-accent)', strokeWidth: 2, fill: 'var(--color-bg)' }}
                dataKey="cumulativeRevenue"
                dot={{ r: 3, stroke: 'var(--color-accent)', strokeWidth: 2, fill: 'var(--color-surface)' }}
                fill="url(#revenueGradient)"
                fillOpacity={1}
                stroke="var(--color-accent)"
                strokeWidth={3}
                type="natural"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-grid">
        <div>
          <h2 className="section-title">Utilisateurs recents</h2>
          <div className="list-panel">
            {recentUsers.length === 0 ? (
              <div className="empty-state" style={{ border: 0 }}>Aucun utilisateur pour le moment</div>
            ) : (
              recentUsers.map((user) => (
                <div className="list-row" key={user.id}>
                  <div className="avatar">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="strong">{user.firstName} {user.lastName}</p>
                    <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>{user.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                    <Badge>{user.licenseType || 'FREE'}</Badge>
                    {user.licenseType === 'PREMIUM' && (
                      <Badge variant="info" style={{ fontSize: 'var(--text-xs)' }}>
                        {user.subscriptionType === 'ANNUAL' ? '10k/an' : '999/mois'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title">Licences à surveiller</h2>
          <div className="list-panel">
            {expiringLicenses.length === 0 ? (
              <div className="empty-state" style={{ border: 0 }}>Aucune licence proche de l'expiration</div>
            ) : (
              expiringLicenses.map((license) => (
                <div className="list-row" key={license.id}>
                  <div className="stat-icon" style={{ width: 36, height: 36 }}>
                    <Clock size={18} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="strong">{license.user?.email || license.key}</p>
                    <p className="muted mono">{license.key}</p>
                  </div>
                  <Badge variant="warning">{license.daysLeft}j</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

