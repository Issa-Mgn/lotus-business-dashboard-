/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Ban, Calendar, Download, Search } from 'lucide-react';
import Badge from '../components/Badge';
import Table from '../components/Table';
import { usersAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = !query
        || user.email.toLowerCase().includes(query)
        || user.firstName.toLowerCase().includes(query)
        || user.lastName.toLowerCase().includes(query)
        || user.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || user.licenseStatus === statusFilter;
      const matchesType = typeFilter === 'ALL' || user.licenseType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter, users]);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSuspendUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
      return;
    }

    try {
      await usersAPI.suspend(userId);
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suspension:', error);
      alert("Erreur lors de la suspension de l'utilisateur");
    }
  };

  const exportCsv = () => {
    const header = ['Nom', 'Email', 'Téléphone', 'Type licence', 'Statut', 'Expiration'];
    const rows = filteredUsers.map((user) => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.phone,
      user.licenseType,
      user.licenseStatus,
      new Date(user.expirationDate).toLocaleDateString('fr-FR'),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lotus-users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'Utilisateur',
      field: 'user',
      render: (row) => (
        <div className="inline-cell">
          <div className="avatar">{row.firstName?.charAt(0)}{row.lastName?.charAt(0)}</div>
          <div>
            <div className="strong">{row.firstName} {row.lastName}</div>
            <div className="muted" style={{ fontSize: 'var(--text-sm)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { header: 'Téléphone', field: 'phone' },
    {
      header: 'Licence',
      field: 'licenseType',
      render: (row) => <Badge>{row.licenseType || 'FREE'}</Badge>,
    },
    {
      header: 'Statut',
      field: 'licenseStatus',
      render: (row) => <Badge>{row.licenseStatus || 'N/A'}</Badge>,
    },
    {
      header: 'Expiration',
      field: 'expirationDate',
      render: (row) => {
        const endDate = new Date(row.expirationDate);
        const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

        return (
          <div className="inline-cell">
            <Calendar size={14} />
            <span>{endDate.toLocaleDateString('fr-FR')}</span>
            {daysLeft > 0 && daysLeft <= 7 && <Badge variant="warning">{daysLeft}j</Badge>}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      field: 'actions',
      align: 'center',
      width: '96px',
      render: (row) => (
        <button
          className="danger-action"
          onClick={(e) => {
            e.stopPropagation();
            handleSuspendUser(row.id);
          }}
          title="Suspendre l'utilisateur"
        >
          <Ban size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</p>
        </div>
        <button className="primary-button" onClick={exportCsv} type="button">
          <span className="inline-cell"><Download size={16} /> Export CSV</span>
        </button>
      </header>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            type="text"
            value={searchTerm}
          />
        </div>
        <select className="select" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select className="select" onChange={(e) => setTypeFilter(e.target.value)} value={typeFilter}>
          <option value="ALL">Tous les types</option>
          <option value="FREE">Free</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : (
        <Table columns={columns} data={filteredUsers} emptyMessage="Aucun utilisateur trouvé" />
      )}
    </div>
  );
};

export default Users;
