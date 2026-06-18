export function TennisBallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="tb-grad" cx="36%" cy="30%" r="70%" fx="36%" fy="30%">
          <stop offset="0%"   stopColor="#f5ff66" />
          <stop offset="42%"  stopColor="#c8e000" />
          <stop offset="100%" stopColor="#7a9000" />
        </radialGradient>
        <clipPath id="tb-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>

      <circle cx="50" cy="50" r="46" fill="url(#tb-grad)" />

      <path
        d="M34 5 C57 17 57 33 34 50 C11 67 11 83 34 95"
        stroke="white" strokeWidth="5" strokeLinecap="round"
        fill="none" clipPath="url(#tb-clip)" opacity="0.88"
      />

      <path
        d="M66 5 C43 17 43 33 66 50 C89 67 89 83 66 95"
        stroke="white" strokeWidth="5" strokeLinecap="round"
        fill="none" clipPath="url(#tb-clip)" opacity="0.88"
      />

      <ellipse
        cx="34" cy="25" rx="16" ry="10"
        fill="white" fillOpacity="0.28"
        transform="rotate(-28 34 25)"
        clipPath="url(#tb-clip)"
      />

      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
    </svg>
  );
}
