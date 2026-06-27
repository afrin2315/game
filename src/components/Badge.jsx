export default function Badge({ children, color = 'teal' }) {
  const variants = {
    teal: 'bg-[#00C9B1]/20 text-[#00C9B1]',
    gold: 'bg-[#F5A623]/20 text-[#F5A623]',
    navy: 'bg-[#0B1628] text-slate-100 border border-slate-700',
  }
  return <span className={`rounded-full px-2 py-1 text-xs ${variants[color]}`}>{children}</span>
}
