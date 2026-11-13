function BrandMark({ size = 32, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="36" height="36" rx="12" fill="var(--primary, #2563EB)" />
      <path
        d="M11 12.5h18M20 12.5v16M15 28.5h10"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29" cy="27.5" r="3" fill="var(--accent-cyan, #67E8F9)" />
    </svg>
  );
}

export default BrandMark;
