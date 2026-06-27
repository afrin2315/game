import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Badge from '../components/Badge'

const cards = [
  { title: 'Community', text: 'Connect with classmates and industry peers.' },
  { title: 'Mentorship', text: 'Book paid mentorship sessions with experts.' },
  { title: 'StartupVarsity', text: 'Find founders, operators, and advisors.' },
  { title: 'Career Marketplace', text: 'Share opportunities and discover talent.' },
]

export default function Landing() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    supabase.from('profiles').select('*', { count: 'exact', head: true }).then(({ count }) => setCount(count ?? 0))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Badge color="gold">Rooman Alumni Network</Badge>
      <h1 className="mt-4 text-4xl font-bold">25 Years · 500,000 Alumni · One Network</h1>
      <p className="mt-3 text-slate-300">Internal network for collaboration, hiring, mentorship, and startup growth.</p>
      <div className="mt-4 text-sm text-[#00C9B1]">Live registered alumni: {count}</div>
      <div className="mt-6 flex gap-3">
        <Link to="/join" className="rounded-lg bg-[#00C9B1] px-4 py-2 font-semibold text-[#0B1628]">Join now</Link>
        <Link to="/app" className="rounded-lg border border-slate-600 px-4 py-2">Go to app</Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <h3 className="font-semibold text-[#F5A623]">{card.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
