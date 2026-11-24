/** A cut crystal, drawn like the Lucide icons next to it. */
export function CrystalIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2 18 7.5v9L12 22l-6-5.5v-9Z" />
      <path d="m6 7.5 6 3.5 6-3.5" />
      <path d="M12 11v11" />
    </svg>
  )
}
