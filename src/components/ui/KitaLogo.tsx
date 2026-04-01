/**
 * Kita brand logo — Three Paths Converging icon.
 * Used on landing page nav, login page, and other brand touchpoints.
 */
export default function KitaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="512" height="512" rx="96" fill="#0F766E" />
      <path d="M100 190 C180 190, 240 230, 380 256" stroke="white" strokeWidth="26" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M110 256 C200 256, 300 256, 390 256" stroke="white" strokeWidth="30" strokeLinecap="round" fill="none" />
      <path d="M100 322 C180 322, 240 282, 380 256" stroke="white" strokeWidth="26" strokeLinecap="round" fill="none" opacity="0.5" />
      <circle cx="390" cy="256" r="16" fill="white" />
    </svg>
  )
}
