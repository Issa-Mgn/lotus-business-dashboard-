import { useEffect, useState } from 'react';
import { Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

const Settings = () => {
  const { admin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.admin || null);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setChangingPassword(true);

    try {
      await profileAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Mot de passe modifié avec succès.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setPasswordMessage(
        error.response?.data?.error || 'Erreur lors du changement de mot de passe.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const displayProfile = profile || admin;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Gérer votre profil et vos préférences</p>
        </div>
      </header>

      <section className="split-layout">
        <div className="surface-panel" style={{ padding: 'var(--spacing-lg)' }}>
          <h2 className="section-title" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <User size={20} />
            Profil administrateur
          </h2>

          {loadingProfile ? (
            <div className="loading-state" style={{ marginTop: 'var(--spacing-lg)', border: 0 }}>
              Chargement...
            </div>
          ) : (
            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <div className="admin-card" style={{ marginBottom: 0 }}>
                <div className="avatar" style={{ width: 56, height: 56, fontSize: 'var(--text-lg)' }}>
                  {displayProfile?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-meta">
                  <p className="admin-email" style={{ fontSize: 'var(--text-base)' }}>
                    {displayProfile?.email}
                  </p>
                  <span className="role-badge">Administrateur</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div className="inline-cell">
                  <Mail size={16} style={{ color: 'var(--color-muted)' }} />
                  <div>
                    <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>Email</p>
                    <p className="strong">{displayProfile?.email || 'Non défini'}</p>
                  </div>
                </div>

                <div className="inline-cell">
                  <Phone size={16} style={{ color: 'var(--color-muted)' }} />
                  <div>
                    <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>Téléphone</p>
                    <p className="strong">{displayProfile?.phone || 'Non défini'}</p>
                  </div>
                </div>

                <div className="inline-cell">
                  <ShieldCheck size={16} style={{ color: 'var(--color-muted)' }} />
                  <div>
                    <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>Rôle</p>
                    <p className="strong">Administrateur</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="surface-panel" style={{ padding: 'var(--spacing-lg)' }}>
          <h2 className="section-title" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <Lock size={20} />
            Changer le mot de passe
          </h2>

          <form className="form" onSubmit={handlePasswordSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
            <label className="field">
              <span className="field-label">Mot de passe actuel</span>
              <input
                className="input"
                name="currentPassword"
                onChange={handlePasswordChange}
                required
                type="password"
                value={passwordForm.currentPassword}
              />
            </label>

            <label className="field">
              <span className="field-label">Nouveau mot de passe</span>
              <input
                className="input"
                name="newPassword"
                onChange={handlePasswordChange}
                required
                type="password"
                value={passwordForm.newPassword}
              />
            </label>

            <label className="field">
              <span className="field-label">Confirmer le nouveau mot de passe</span>
              <input
                className="input"
                name="confirmPassword"
                onChange={handlePasswordChange}
                required
                type="password"
                value={passwordForm.confirmPassword}
              />
            </label>

            {passwordMessage && (
              <p className={`form-message ${passwordMessage.includes('succès') ? '' : 'error'}`}>
                {passwordMessage}
              </p>
            )}

            <button className="primary-button" disabled={changingPassword} type="submit">
              {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Settings;
