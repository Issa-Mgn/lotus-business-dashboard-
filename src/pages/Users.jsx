/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Ban, Calendar, CheckCircle2, Download, Plus, Search, X, Mail } from 'lucide-react';
import Badge from '../components/Badge';
import Table from '../components/Table';
import { usersAPI, adminsAPI, licensesAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState({ recipientId: null, recipientEmail: '', subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState('');

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

  const handleReactivateUser = async (user) => {
    if (!confirm('Réactiver cet utilisateur ?')) {
      return;
    }

    try {
      await usersAPI.reactivateLicense(user.id, user.licenseType || 'FREE');
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      alert("Erreur lors de la réactivation de l'utilisateur");
    }
  };

  const handleUserChange = (event) => {
    setUserFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateMessage('');
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreatingUser(true);
    setCreateMessage('');

    try {
      await usersAPI.register(userFormData);
      await loadUsers();
      closeCreateModal();
    } catch (error) {
      console.error('Erreur creation utilisateur:', error);
      setCreateMessage(error.response?.data?.error || "Erreur lors de la création de l'utilisateur.");
    } finally {
      setCreatingUser(false);
    }
  };

  const openComposeModal = (user) => {
    setEmailModalData({ recipientId: user.id, recipientEmail: user.email, subject: '', message: '' });
    setEmailStatusMessage('');
    setShowEmailModal(true);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailModalData((current) => ({ ...current, [name]: value }));
  };

  const handleSendLicense = async (userId) => {
    if (!confirm('Envoyer le rappel de licence à cet utilisateur ?')) return;
    try {
      await licensesAPI.sendLicenseEmail(userId);
      alert('Email de licence envoyé');
      await loadUsers();
    } catch (error) {
      console.error('Erreur envoi email licence:', error);
      const serverDetail = error.response?.data?.detail || error.response?.data;
      const msg = error.response?.data?.error || (serverDetail ? JSON.stringify(serverDetail) : error.message);
      alert(msg);
    }
  };

  const handleSendCustomEmail = async (event) => {
    event.preventDefault();
    setSendingEmail(true);
    setEmailStatusMessage('');

    try {
      const payload = {
        recipientType: 'user',
        recipientId: emailModalData.recipientId,
        email: emailModalData.recipientEmail,
        subject: emailModalData.subject,
        message: emailModalData.message,
      };

      await adminsAPI.sendEmail(payload);
      setEmailStatusMessage('Email envoyé avec succès.');
      setShowEmailModal(false);
    } catch (error) {
      console.error('Erreur envoi email manuel:', error);
      const serverDetail = error.response?.data?.detail || error.response?.data;
      const msg = error.response?.data?.error || (serverDetail ? JSON.stringify(serverDetail) : error.message);
      setEmailStatusMessage(msg);
    } finally {
      setSendingEmail(false);
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
      width: '120px',
        render: (row) => {
          const isSuspended = row.licenseStatus === 'SUSPENDED';

          return (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <button
                className="icon-button"
                onClick={(e) => { e.stopPropagation(); handleSendLicense(row.id); }}
                title="Envoyer rappel licence"
                type="button"
              >
                <Calendar size={16} />
              </button>

              <button
                className="icon-button"
                onClick={(e) => { e.stopPropagation(); openComposeModal(row); }}
                title="Envoyer un email"
                type="button"
              >
                <Mail size={16} />
              </button>

              <button
                className={isSuspended ? 'icon-button' : 'danger-action'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSuspended) {
                    handleReactivateUser(row);
                    return;
                  }
                  handleSuspendUser(row.id);
                }}
                title={isSuspended ? "Réactiver l'utilisateur" : "Suspendre l'utilisateur"}
                type="button"
              >
                {isSuspended ? <CheckCircle2 size={18} /> : <Ban size={18} />}
              </button>
            </div>
          );
        },
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setShowCreateModal(true)} title="Ajouter un utilisateur" type="button">
            <Plus size={20} />
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

      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)} role="presentation">
          <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h2 className="section-title">Envoyer un email</h2>
                <p className="page-subtitle">Envoyer un message personnalisé à l'utilisateur sélectionné.</p>
              </div>
              <button className="icon-button" onClick={() => setShowEmailModal(false)} type="button" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form className="form" onSubmit={handleSendCustomEmail}>
              <label className="field">
                <span className="field-label">Destinataire</span>
                <input className="input" name="recipientEmail" value={emailModalData.recipientEmail} onChange={handleEmailChange} required type="email" />
              </label>

              <label className="field">
                <span className="field-label">Sujet</span>
                <input className="input" name="subject" value={emailModalData.subject} onChange={handleEmailChange} required />
              </label>

              <label className="field">
                <span className="field-label">Message</span>
                <textarea className="input" name="message" value={emailModalData.message} onChange={handleEmailChange} rows={8} required />
              </label>

              {emailStatusMessage && <p className="form-message">{emailStatusMessage}</p>}

              <div className="modal-actions">
                <button className="ghost-button" onClick={() => setShowEmailModal(false)} type="button">Annuler</button>
                <button className="primary-button" disabled={sendingEmail} type="submit">{sendingEmail ? 'Envoi...' : 'Envoyer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal} role="presentation">
          <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="create-user-title">
            <div className="modal-header">
              <div>
                <h2 className="section-title" id="create-user-title">Ajouter un utilisateur</h2>
                <p className="page-subtitle">Créer un compte comme une inscription normale. La clé de licence sera envoyée par mail.</p>
              </div>
              <button className="icon-button" onClick={closeCreateModal} type="button" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form className="form" onSubmit={handleCreateUser}>
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

              {createMessage && <p className="form-message error">{createMessage}</p>}

              <div className="modal-actions">
                <button className="ghost-button" onClick={closeCreateModal} type="button">Annuler</button>
                <button className="primary-button" disabled={creatingUser} type="submit">
                  {creatingUser ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
