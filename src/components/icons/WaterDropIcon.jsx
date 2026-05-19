function WaterDropIcon({ className = 'w-16 h-16' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 44C32.8366 44 40 36.8366 40 28C40 19.6 32.8 11.2 28.8 6.8C27.1281 4.93333 24.8719 4.93333 23.2 6.8C19.2 11.2 12 19.6 12 28C12 36.8366 19.1634 44 24 44Z"
        fill="currentColor"
      />
      <path
        d="M24 38C26.7614 38 29 35.7614 29 33C29 30.2386 27 27 24 24C21 27 19 30.2386 19 33C19 35.7614 21.2386 38 24 38Z"
        fill="white"
        fillOpacity="0.3"
      />
    </svg>
  )
}

export default WaterDropIcon
