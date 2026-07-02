const Spinner = ({ size = 20 }) => {
  return (
    <svg
      className="spinner"
      height={size}
      style={{
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
      }}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        fill="none"
        r="10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
        style={{
          opacity: 0.25,
        }}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
};

export default Spinner;
