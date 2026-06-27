import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Feed from './Feed'
import Members from './Members'
import Mentorship from './Mentorship'
import MyProfile from './MyProfile'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const tabs = ['Feed', 'Members', 'Mentorship', 'My Profile']

export default function MainApp() {
  const [tab, setTab] = useState(tabs[0])
  const [unread, setUnread] = useState(0)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel('notification-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, () => setUnread((v) => v + 1))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => setUnread((v) => v + 1))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections' }, () => setUnread((v) => v + 1))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile])

  if (!profile) return <div className="p-6">Complete registration from /join to continue.</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Rooman Alumni Network</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-slate-600 px-3 py-1 text-sm" onClick={() => setUnread(0)}>🔔 {unread}</button>
          {profile.is_admin && <Button className="bg-[#F5A623]" onClick={() => navigate('/admin')}>Admin</Button>}
          <Button className="bg-slate-700 text-slate-100" onClick={() => signOut().then(() => navigate('/join'))}>Sign out</Button>
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => <button key={t} className={`rounded-lg px-3 py-2 text-sm ${tab === t ? 'bg-[#00C9B1] text-[#0B1628]' : 'border border-slate-700'}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Feed' && <Feed user={profile} />}
      {tab === 'Members' && <Members user={profile} />}
      {tab === 'Mentorship' && <Mentorship user={profile} />}
      {tab === 'My Profile' && <MyProfile user={profile} />}
    </div>
  )
}
