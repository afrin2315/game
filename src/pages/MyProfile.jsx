import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import { useProfile } from '../hooks/useProfile'

export default function MyProfile({ user }) {
  const { profile, stats, updateProfile, uploadAvatar } = useProfile(user.id)
  const [form, setForm] = useState({})

  if (!profile) return <div>Loading profile...</div>

  const save = () => updateProfile(form)

  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <h3 className="text-xl font-semibold">My Profile</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <Input defaultValue={profile.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input defaultValue={profile.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Input defaultValue={profile.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
        <Input defaultValue={profile.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
      </div>
      <textarea className="w-full rounded-lg bg-slate-950 p-2" rows={4} defaultValue={profile.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
      <div className="flex gap-4 text-sm text-slate-300">
        <span>Connections: {stats.connections}</span>
        <span>Posts: {stats.posts}</span>
        <span>Sessions: {stats.sessions}</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={save}>Save Profile</Button>
        <Button className="bg-slate-700 text-slate-100" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/profile/${user.id}`)}>Share Profile</Button>
      </div>
    </div>
  )
}
