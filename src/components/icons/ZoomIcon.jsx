function ZoomIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      className={`${className} shrink-0`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeWidth={2.5}
        d="M16.5 16.5L21 21"
      />
      <path
        strokeLinecap="round"
        strokeWidth={2.5}
        d="M11 8v6M8 11h6"
      />
    </svg>
  )
}

export default ZoomIcon
