import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { supabase } from '../lib/supabase'

export default function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', id).maybeSingle().then(({ data }) => setProfile(data))
  }, [id])

  if (!profile) return <div className="p-6">Profile not found.</div>

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
        <div className="flex items-center gap-3">
          <Avatar src={profile.avatar_url} alt={profile.name} size={56} />
          <div>
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            <p className="text-slate-300">{profile.role} at {profile.company}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-300">{profile.bio}</p>
      </div>
    </div>
  )
}
