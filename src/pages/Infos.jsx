/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from 'react';
import { Image, Plus, Send, Trash2, Upload, X } from 'lucide-react';
import Badge from '../components/Badge';
import { infosAPI } from '../services/api';

const initialForm = {
  title: '',
  content: '',
  imageBase64: '',
  published: true,
};

const getExcerpt = (value, maxLength = 150) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const compressImage = (file, maxWidth = 1280, quality = 0.82) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onerror = () => reject(new Error("Impossible de lire l'image."));
  reader.onload = () => {
    const image = new window.Image();

    image.onerror = () => reject(new Error("Impossible de préparer l'image."));
    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
});

const Infos = () => {
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Veuillez sélectionner une image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('L\'image ne doit pas dépasser 5MB.');
      return;
    }

    try {
      const base64String = await compressImage(file);
      setFormData((current) => ({
        ...current,
        imageBase64: base64String,
      }));
      setImagePreview(base64String);
      setMessage('');
    } catch (error) {
      console.error('Erreur préparation image:', error);
      setMessage(error.message || "Impossible de préparer l'image.");
    }
  };

  const removeImage = () => {
    setFormData((current) => ({
      ...current,
      imageBase64: '',
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await infosAPI.create(formData);
      setInfos((current) => [response.info, ...current]);
      setFormData(initialForm);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (!confirm('Supprimer cette info ? L\'image sera également supprimée de ImageKit.')) {
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
          <p className="page-subtitle">Publier des articles courts avec une image principale optionnelle.</p>
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

            <div className="field">
              <span className="field-label">Image principale</span>
              
              {imagePreview ? (
                <div className="image-preview-container">
                  <img className="image-preview" src={imagePreview} alt="Aperçu" />
                  <button
                    className="image-remove-button"
                    onClick={removeImage}
                    type="button"
                    title="Supprimer l'image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label 
                  className="image-upload-zone"
                  htmlFor="image-upload"
                >
                  <Upload size={28} />
                  <strong>Ajouter la première image de l'article</strong>
                  <span>JPG, PNG ou WEBP. Compression automatique avant envoi.</span>
                </label>
              )}
              
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            <label className="check-row">
              <input checked={formData.published} name="published" onChange={handleChange} type="checkbox" />
              <span>Publier immédiatement</span>
            </label>

            {message && <p className={`form-message ${message.includes('succès') ? '' : 'error'}`}>{message}</p>}

            <div className="article-preview">
              <div className="article-preview-media">
                {imagePreview ? <img src={imagePreview} alt="" /> : <Image size={24} />}
              </div>
              <div className="article-preview-body">
                <p className="article-preview-kicker">Aperçu article</p>
                <h3>{formData.title || 'Titre de votre publication'}</h3>
                <p>{getExcerpt(formData.content) || "Les premières lignes du message apparaîtront ici."}</p>
                <span>lotus-business.app</span>
              </div>
            </div>

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
                {info.thumbnailUrl || info.imageUrl ? (
                  <img className="info-image" src={info.thumbnailUrl || info.imageUrl} alt={info.title} loading="lazy" />
                ) : (
                  <div className="info-image-placeholder">
                    <Image size={22} />
                  </div>
                )}

                <div className="info-content">
                  <div className="info-title-row">
                    <h2>{info.title}</h2>
                    <Badge variant={info.published ? 'success' : 'warning'}>{info.published ? 'ACTIVE' : 'DRAFT'}</Badge>
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
