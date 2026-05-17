// AtomAlign logo mark — geometric "A" with upward arrow
const AtomLogo = ({ size = 40, color = '#1B2E5A' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left chevron leg of the A */}
    <path
      d="M10 85 L35 20 L50 50 L30 85 Z"
      fill={color}
    />
    {/* Inner negative-space cut of left leg */}
    <path
      d="M22 85 L42 38 L50 55 L36 85 Z"
      fill="white"
    />
    {/* Right leg - upward arrow diagonal */}
    <path
      d="M50 50 L65 20 L90 20 L90 35 L72 35 L56 75 Z"
      fill={color}
    />
    {/* Arrow head pointing up-right */}
    <path
      d="M70 10 L100 10 L100 40 L88 28 L65 50 L55 40 L78 18 Z"
      fill={color}
    />
  </svg>
);

export default AtomLogo;
