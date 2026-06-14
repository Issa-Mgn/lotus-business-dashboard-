import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">404 — Page introuvable</h1>
          <p className="page-subtitle">Désolé, la page demandée est introuvable.</p>
        </div>
      </header>

      <section className="surface-panel" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🔎</div>
        <h2 style={{ marginTop: 0 }}>On dirait que cette page n'existe pas</h2>
        <p style={{ color: 'var(--muted)', maxWidth: 600, margin: '8px auto' }}>
          L'URL demandée est introuvable ou a été déplacée. Revenez au tableau de bord pour continuer.
        </p>

        <div style={{ marginTop: 20 }}>
          <Link to="/" className="primary-button">Retour au tableau de bord</Link>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
