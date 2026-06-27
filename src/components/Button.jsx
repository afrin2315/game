export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-lg bg-[#00C9B1] px-4 py-2 text-sm font-semibold text-[#0B1628] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
