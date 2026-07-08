/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Calendar, Copy, Download, KeyRound, Mail, Search, Send, X } from 'lucide-react';
import Badge from '../components/Badge';
import Table from '../components/Table';
import { licensesAPI } from '../services/api';

const Licenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [sendingLicense, setSendingLicense] = useState(false);
  const [sendMessage, setSendMessage] = useState('');

  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = !query
        || license.key.toLowerCase().includes(query)
        || license.user?.email?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'ALL' || license.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || license.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [licenses, searchTerm, statusFilter, typeFilter]);

  const loadLicenses = async () => {
    try {
      const response = await licensesAPI.getAll();
      setLicenses(response.licenses || []);
    } catch (error) {
      console.error('Erreur lors du chargement des licences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  const copyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
    } catch (error) {
      console.error('Erreur copie clé:', error);
    }
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    setSelectedUserId('');
    setSendMessage('');
  };

  const handleSendLicenseEmail = async (event) => {
    event.preventDefault();
    setSendingLicense(true);
    setSendMessage('');

    try {
      await licensesAPI.sendLicenseEmail(selectedUserId);
      setSendMessage('Licence renvoyée par mail avec succès.');
    } catch (error) {
      console.error('Erreur renvoi licence:', error);
      setSendMessage(error.response?.data?.detail || error.response?.data?.error || "Impossible de renvoyer la licence.");
    } finally {
      setSendingLicense(false);
    }
  };

  const exportCsv = () => {
    const header = ['Clé', 'Email', 'Type', 'Statut', 'Création', 'Expiration'];
    const rows = filteredLicenses.map((license) => [
      license.key,
      license.user?.email || '',
      license.type,
      license.status,
      new Date(license.createdAt).toLocaleDateString('fr-FR'),
      new Date(license.endDate).toLocaleDateString('fr-FR'),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lotus-licenses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'Clé de licence',
      field: 'key',
      render: (row) => (
        <div className="inline-cell">
          <KeyRound size={16} />
          <span className="mono">{row.key}</span>
          <button className="icon-button" onClick={() => copyKey(row.key)} title="Copier la clé" type="button">
            <Copy size={16} />
          </button>
        </div>
      ),
    },
    {
      header: 'Utilisateur',
      field: 'user',
      render: (row) => row.user ? (
        <div>
          <div className="strong">{row.user.firstName} {row.user.lastName}</div>
          <div className="muted" style={{ fontSize: 'var(--text-sm)' }}>{row.user.email}</div>
        </div>
      ) : <span className="muted">Non assignée</span>,
    },
    {
      header: 'Type',
      field: 'type',
      render: (row) => <Badge>{row.type}</Badge>,
    },
    {
      header: 'Abonnement',
      field: 'subscriptionType',
      render: (row) => row.type === 'PREMIUM' ? (
        <Badge variant="info">
          {row.user?.subscriptionType === 'ANNUAL' ? 'Annuel (10k/an)' : 'Mensuel (999/mois)'}
        </Badge>
      ) : <span className="muted">-</span>,
    },
    {
      header: 'Statut',
      field: 'status',
      render: (row) => <Badge>{row.status}</Badge>,
    },
    {
      header: 'Création',
      field: 'createdAt',
      render: (row) => (
        <div className="inline-cell">
          <Calendar size={14} />
          <span>{new Date(row.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    {
      header: 'Expiration',
      field: 'endDate',
      render: (row) => {
        const endDate = new Date(row.endDate);
        const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

        return (
          <div className="inline-cell">
            <Calendar size={14} />
            <span>{endDate.toLocaleDateString('fr-FR')}</span>
            {isExpiringSoon && <Badge variant="warning">{daysLeft}j</Badge>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Licences</h1>
          <p className="page-subtitle">{filteredLicenses.length} licence{filteredLicenses.length > 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <button className="ghost-button" onClick={() => setShowSendModal(true)} type="button">
            <span className="inline-cell"><Mail size={16} /> Renvoyer une licence</span>
          </button>
          <button className="primary-button" onClick={exportCsv} type="button">
            <span className="inline-cell"><Download size={16} /> Export CSV</span>
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par clé ou email..."
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
        <Table columns={columns} data={filteredLicenses} emptyMessage="Aucune licence trouvée" />
      )}

      {showSendModal && (
        <div className="modal-overlay" onClick={closeSendModal} role="presentation">
          <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="send-license-title">
            <div className="modal-header">
              <div>
                <h2 className="section-title" id="send-license-title">Renvoyer une licence</h2>
                <p className="page-subtitle">Choisir l’utilisateur qui doit recevoir à nouveau sa clé de connexion.</p>
              </div>
              <button className="icon-button" onClick={closeSendModal} type="button" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form className="form" onSubmit={handleSendLicenseEmail}>
              <label className="field">
                <span className="field-label">Utilisateur</span>
                <select
                  className="select"
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  required
                  value={selectedUserId}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {licenses.map((license) => (
                    <option key={license.id} value={license.id}>
                      {license.user?.firstName} {license.user?.lastName} - {license.user?.email}
                    </option>
                  ))}
                </select>
              </label>

              {sendMessage && <p className="form-message">{sendMessage}</p>}

              <div className="modal-actions">
                <button className="ghost-button" onClick={closeSendModal} type="button">Annuler</button>
                <button className="primary-button" disabled={sendingLicense || !selectedUserId} type="submit">
                  <span className="inline-cell">
                    <Send size={16} />
                    {sendingLicense ? 'Envoi...' : 'Confirmer'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Licenses;
