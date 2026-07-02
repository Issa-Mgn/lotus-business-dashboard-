/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Edit2, Plus, RefreshCw, Search, Trash2, X, Smartphone } from 'lucide-react';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { usersAPI, devicesAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    licenseType: 'FREE',
    licenseStatus: 'ACTIVE',
    expirationDate: '',
    maxSimultaneousLogins: 1,
    lastLoginIp: '',
  });

  const [addForm, setAddForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    licenseType: 'FREE',
  });

  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [selectedUserDevices, setSelectedUserDevices] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      const fetchedUsers = response.users || [];
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setMessage('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter((user) => (
      user.email?.toLowerCase().includes(term) ||
      user.phone?.includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.licenseKey?.toLowerCase().includes(term)
    ));

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email || '',
      phone: user.phone || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      licenseType: user.licenseType || 'FREE',
      licenseStatus: user.licenseStatus || 'ACTIVE',
      expirationDate: user.expirationDate ? new Date(user.expirationDate).toISOString().split('T')[0] : '',
      maxSimultaneousLogins: user.maxSimultaneousLogins || 1,
      lastLoginIp: user.lastLoginIp || '',
    });
    setShowEditModal(true);
    setMessage('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      await usersAPI.update(selectedUser.id, editForm);
      setMessage('Utilisateur modifié avec succès');
      setShowEditModal(false);
      await loadUsers();
    } catch (error) {
      console.error('Erreur modification:', error);
      setMessage(error.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    setAddForm({
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      licenseType: 'FREE',
    });
    setShowAddModal(true);
    setMessage('');
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      const response = await usersAPI.createFromAdmin(addForm);
      setMessage(`Utilisateur créé! Un email a été envoyé à ${addForm.email} avec sa clé de licence.`);
      setShowAddModal(false);
      await loadUsers();
    } catch (error) {
      console.error('Erreur création:', error);
      setMessage(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      setMessage('Utilisateur supprimé');
      await loadUsers();
    } catch (error) {
      console.error('Erreur suppression:', error);
      setMessage(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: 'success',
      EXPIRED: 'danger',
      SUSPENDED: 'warning',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getLicenseBadge = (type) => {
    const variants = {
      FREE: 'default',
      PREMIUM: 'success',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const handleViewDevices = async (user) => {
    setSelectedUserDevices(user);
    setShowDevicesModal(true);
    setLoadingDevices(true);
    setDevices([]);

    try {
      const response = await devicesAPI.getUserDevices(user.id);
      setDevices(response.devices || []);
    } catch (error) {
      console.error('Erreur chargement devices:', error);
      setMessage('Impossible de charger les appareils.');
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleResetDevice = async (deviceId) => {
    if (!confirm('Réinitialiser cet appareil ? L\'utilisateur pourra se reconnecter depuis un nouvel appareil.')) {
      return;
    }

    try {
      await devicesAPI.resetDevice(selectedUserDevices.id, deviceId);
      setMessage('Appareil réinitialisé avec succès');
      // Recharger les devices
      const response = await devicesAPI.getUserDevices(selectedUserDevices.id);
      setDevices(response.devices || []);
    } catch (error) {
      console.error('Erreur reset device:', error);
      setMessage(error.response?.data?.error || 'Erreur lors de la réinitialisation');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('Supprimer cet appareil ?')) {
      return;
    }

    try {
      await devicesAPI.adminDeleteDevice(selectedUserDevices.id, deviceId);
      setMessage('Appareil supprimé');
      // Recharger les devices
      const response = await devicesAPI.getUserDevices(selectedUserDevices.id);
      setDevices(response.devices || []);
    } catch (error) {
      console.error('Erreur suppression device:', error);
      setMessage(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">Gestion complète des utilisateurs et licences</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button className="primary-button" onClick={handleAdd}>
            <Plus size={16} />
            Ajouter
          </button>
          <button className="secondary-button" onClick={() => { setSearchTerm(''); loadUsers(); }}>
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </header>

      {message && (
        <div className={`form-message ${message.includes('succès') || message.includes('supprimé') || message.includes('créé') ? '' : 'error'}`} style={{ marginBottom: 'var(--spacing-md)' }}>
          {message}
        </div>
      )}

      <div className="toolbar" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            className="search-input"
            placeholder="Rechercher un utilisateur..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="pill-badge">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Contact</th>
                <th>Clé Licence</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expiration</th>
                <th>Appareils</th>
                <th>Dernière IP</th>
                <th style={{ textAlign: 'center' }}>En ligne</th>
                <th>Dernière connexion</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="Utilisateur">
                    <div className="inline-cell">
                      <div className="avatar">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <p className="strong">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </td>
                  <td data-label="Contact">
                    <div>
                      <p className="mono" style={{ fontSize: 'var(--text-sm)', marginBottom: '2px' }}>{user.email}</p>
                      <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>{user.phone}</p>
                    </div>
                  </td>
                  <td data-label="Clé Licence">
                    <code className="mono" style={{ fontSize: 'var(--text-xs)' }}>
                      {user.licenseKey}
                    </code>
                  </td>
                  <td data-label="Type">{getLicenseBadge(user.licenseType)}</td>
                  <td data-label="Status">{getStatusBadge(user.licenseStatus)}</td>
                  <td data-label="Expiration">
                    <span className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                      {user.expirationDate ? new Date(user.expirationDate).toLocaleDateString('fr-FR') : 'Illimité'}
                    </span>
                  </td>
                  <td data-label="Appareils">
                    <span className="pill-badge">{user.maxSimultaneousLogins === 999 ? '∞' : user.maxSimultaneousLogins}</span>
                  </td>
                  <td data-label="Dernière IP">
                    <code className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                      {user.lastLoginIp || '-'}
                    </code>
                  </td>
                  <td data-label="En ligne" style={{ textAlign: 'center' }}>
                    {user.isOnline ? (
                      <span style={{ color: 'var(--color-success)', fontSize: '20px', lineHeight: 1 }}>●</span>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontSize: '20px', lineHeight: 1 }}>○</span>
                    )}
                  </td>
                  <td data-label="Dernière connexion">
                    <span className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { 
                        dateStyle: 'short', 
                        timeStyle: 'short' 
                      }) : 'Jamais'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'flex-end' }}>
                      <button
                        className="icon-button"
                        onClick={() => handleEdit(user)}
                        title="Modifier"
                        type="button"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => handleViewDevices(user)}
                        title="Voir les appareils"
                        type="button"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <Smartphone size={16} />
                      </button>
                      <button
                        className="danger-action"
                        onClick={() => handleDelete(user.id)}
                        title="Supprimer"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Modifier l'utilisateur</h2>
              <button className="icon-button" onClick={() => setShowEditModal(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <label className="field">
                    <span className="field-label">Prénom</span>
                    <input
                      className="input"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Nom</span>
                    <input
                      className="input"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </label>
                </div>

                <label className="field">
                  <span className="field-label">Email</span>
                  <input
                    className="input"
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Téléphone</span>
                  <input
                    className="input"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <label className="field">
                    <span className="field-label">Type de licence</span>
                    <select
                      className="input"
                      value={editForm.licenseType}
                      onChange={(e) => setEditForm({ ...editForm, licenseType: e.target.value })}
                    >
                      <option value="FREE">FREE</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Status licence</span>
                    <select
                      className="input"
                      value={editForm.licenseStatus}
                      onChange={(e) => setEditForm({ ...editForm, licenseStatus: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <label className="field">
                    <span className="field-label">Date d'expiration</span>
                    <input
                      className="input"
                      type="date"
                      value={editForm.expirationDate}
                      onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                    />
                    <small className="muted">Vide = illimité (FREE)</small>
                  </label>

                  <label className="field">
                    <span className="field-label">Appareils simultanés</span>
                    <input
                      className="input"
                      min="1"
                      type="number"
                      value={editForm.maxSimultaneousLogins}
                      onChange={(e) => setEditForm({ ...editForm, maxSimultaneousLogins: parseInt(e.target.value) })}
                    />
                    <small className="muted">FREE=1, PREMIUM=999</small>
                  </label>
                </div>

                <label className="field">
                  <span className="field-label">Dernière adresse IP</span>
                  <input
                    className="input"
                    placeholder="Ex: 192.168.1.1"
                    value={editForm.lastLoginIp}
                    onChange={(e) => setEditForm({ ...editForm, lastLoginIp: e.target.value })}
                  />
                  <small className="muted">Modifiable pour débloquer l'utilisateur</small>
                </label>

                <div className="modal-actions">
                  <button className="ghost-button" onClick={() => setShowEditModal(false)} type="button" disabled={saving}>
                    Annuler
                  </button>
                  <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? <><Spinner size={16} /> Enregistrement...</> : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajout */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Ajouter un utilisateur</h2>
              <button className="icon-button" onClick={() => setShowAddModal(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div className="form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <label className="field">
                    <span className="field-label">Prénom</span>
                    <input
                      className="input"
                      required
                      value={addForm.firstName}
                      onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Nom</span>
                    <input
                      className="input"
                      required
                      value={addForm.lastName}
                      onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    />
                  </label>
                </div>

                <label className="field">
                  <span className="field-label">Email</span>
                  <input
                    className="input"
                    required
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Téléphone</span>
                  <input
                    className="input"
                    required
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Type de licence</span>
                  <select
                    className="input"
                    value={addForm.licenseType}
                    onChange={(e) => setAddForm({ ...addForm, licenseType: e.target.value })}
                  >
                    <option value="FREE">FREE (illimité, 1 appareil)</option>
                    <option value="PREMIUM">PREMIUM (1 mois, appareils illimités)</option>
                  </select>
                </label>

                <div style={{ 
                  background: 'var(--color-surface-2)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--spacing-md)',
                  marginTop: 'var(--spacing-sm)'
                }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                    ℹ️ L'utilisateur recevra un email avec sa clé de licence pour se connecter à l'application. Aucun mot de passe n'est requis.
                  </p>
                </div>

                <div className="modal-actions">
                  <button className="ghost-button" onClick={() => setShowAddModal(false)} type="button" disabled={saving}>
                    Annuler
                  </button>
                  <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? <><Spinner size={16} /> Création...</> : 'Créer l\'utilisateur'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Devices */}
      {showDevicesModal && (
        <div className="modal-overlay" onClick={() => setShowDevicesModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '4px' }}>Appareils de {selectedUserDevices?.firstName} {selectedUserDevices?.lastName}</h2>
                <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                  {devices.length} appareil{devices.length > 1 ? 's' : ''} enregistré{devices.length > 1 ? 's' : ''}
                </p>
              </div>
              <button className="icon-button" onClick={() => setShowDevicesModal(false)} type="button">
                <X size={20} />
              </button>
            </div>

            {loadingDevices ? (
              <div className="loading-state">Chargement des appareils...</div>
            ) : devices.length === 0 ? (
              <div className="empty-state">
                <Smartphone size={48} style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }} />
                <p>Aucun appareil enregistré</p>
                <p className="muted" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-xs)' }}>
                  Les appareils seront automatiquement enregistrés lors de la connexion
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {devices.map((device) => (
                  <div
                    key={device.id}
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-md)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                          <Smartphone size={18} style={{ color: 'var(--color-primary)' }} />
                          <p className="strong" style={{ margin: 0 }}>
                            {device.deviceName || 'Appareil sans nom'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '28px' }}>
                          <p className="muted" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
                            ID: <code className="mono">{device.deviceId}</code>
                          </p>
                          {device.deviceType && (
                            <p className="muted" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
                              Type: {device.deviceType}
                            </p>
                          )}
                          {device.platform && (
                            <p className="muted" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
                              Platforme: {device.platform}
                            </p>
                          )}
                          <p className="muted" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
                            Dernière utilisation: {new Date(device.lastUsedAt).toLocaleString('fr-FR', { 
                              dateStyle: 'short', 
                              timeStyle: 'short' 
                            })}
                          </p>
                          <p className="muted" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
                            Créé le: {new Date(device.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                        <button
                          className="secondary-button"
                          onClick={() => handleResetDevice(device.deviceId)}
                          title="Réinitialiser l'appareil"
                          type="button"
                          style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                        >
                          Réinitialiser
                        </button>
                        <button
                          className="danger-action"
                          onClick={() => handleDeleteDevice(device.deviceId)}
                          title="Supprimer l'appareil"
                          type="button"
                          style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
