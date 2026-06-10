const normalize = (value) => String(value || 'default').toLowerCase();

const Badge = ({ children, variant }) => {
  const badgeVariant = normalize(variant || children);

  return (
    <span className={`badge badge-${badgeVariant}`}>
      {children}
    </span>
  );
};

export default Badge;
