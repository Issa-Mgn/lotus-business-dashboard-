const StatCard = ({ icon: Icon, label, value, tone = 'default' }) => (
  <article className="stat-card">
    <div className="stat-card-header">
      <div className={`stat-icon tone-${tone}`}>
        <Icon size={24} strokeWidth={2} />
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <p className="stat-label">{label}</p>
  </article>
);

export default StatCard;
