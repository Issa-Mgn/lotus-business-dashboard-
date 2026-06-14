/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Image, Plus, Send, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import { infosAPI } from '../services/api';

const initialForm = {
  title: '',
  content: '',
  imageUrl: '',
  published: true,
};

const Infos = () => {
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const loadInfos = async () => {
    try {
      const response = await infosAPI.getAll();
      setInfos(response.infos || []);
    } catch (error) {
      console.error('Erreur chargement infos:', error);
      setMessage("Impossible de charger les infos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfos();
  }, []);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await infosAPI.create(formData);
      setInfos((current) => [response.info, ...current]);
      setFormData(initialForm);
      setMessage('Info publiée avec succès.');
    } catch (error) {
      console.error('Erreur publication info:', error);
      setMessage(error.response?.data?.error || "Impossible de publier l'info.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (info) => {
    try {
      const response = await infosAPI.update(info.id, { published: !info.published });
      setInfos((current) => current.map((item) => (item.id === info.id ? response.info : item)));
    } catch (error) {
      console.error('Erreur statut info:', error);
      alert("Impossible de modifier le statut de l'info.");
    }
  };

  const handleDelete = async (infoId) => {
    if (!confirm('Supprimer cette info ?')) {
      return;
    }

    try {
      await infosAPI.remove(infoId);
      setInfos((current) => current.filter((info) => info.id !== infoId));
    } catch (error) {
      console.error('Erreur suppression info:', error);
      alert("Impossible de supprimer l'info.");
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Infos</h1>
          <p className="page-subtitle">Publier des annonces visibles par les utilisateurs Lotus Business.</p>
        </div>
      </header>

      <section className="split-layout info-layout">
        <form className="surface-panel info-form-panel" onSubmit={handleSubmit}>
          <h2 className="section-title">
            <span className="inline-cell"><Plus size={20} /> Nouvelle info</span>
          </h2>

          <div className="form">
            <label className="field">
              <span className="field-label">Titre</span>
              <input className="input" name="title" onChange={handleChange} required value={formData.title} />
            </label>

            <label className="field">
              <span className="field-label">Message</span>
              <textarea
                className="input textarea"
                name="content"
                onChange={handleChange}
                required
                rows="7"
                value={formData.content}
              />
            </label>

            <label className="field">
              <span className="field-label">Image optionnelle</span>
              <input
                className="input"
                name="imageUrl"
                onChange={handleChange}
                placeholder="https://..."
                type="url"
                value={formData.imageUrl}
              />
            </label>

            <label className="check-row">
              <input checked={formData.published} name="published" onChange={handleChange} type="checkbox" />
              <span>Publier immédiatement</span>
            </label>

            {message && <p className="form-message">{message}</p>}

            <button className="primary-button" disabled={saving} type="submit">
              <span className="inline-cell">
                <Send size={16} />
                {saving ? 'Publication...' : 'Publier'}
              </span>
            </button>
          </div>
        </form>

        <div className="info-list">
          {loading ? (
            <div className="loading-state">Chargement...</div>
          ) : infos.length === 0 ? (
            <div className="empty-state">
              <p>Aucune info publiée.</p>
            </div>
          ) : (
            infos.map((info) => (
              <article className="info-item" key={info.id}>
                {info.imageUrl ? (
                  <img className="info-image" src={info.imageUrl} alt="" />
                ) : (
                  <div className="info-image-placeholder">
                    <Image size={22} />
                  </div>
                )}

                <div className="info-content">
                  <div className="info-title-row">
                    <h2>{info.title}</h2>
                    <Badge>{info.published ? 'ACTIVE' : 'DRAFT'}</Badge>
                  </div>
                  <p>{info.content}</p>
                  <span className="muted">
                    {new Date(info.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="info-actions">
                  <button className="ghost-button" onClick={() => handleTogglePublished(info)} type="button">
                    {info.published ? 'Masquer' : 'Publier'}
                  </button>
                  <button className="danger-action" onClick={() => handleDelete(info.id)} type="button" title="Supprimer">
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

export default Infos;
