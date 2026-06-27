import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ connections: 0, posts: 0, sessions: 0 })

  useEffect(() => {
    if (!userId) return
    const run = async () => {
      const [{ data: p }, { count: posts }, { count: sessions }, { count: connections }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('mentorship_sessions').select('*', { count: 'exact', head: true }).or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`),
        supabase.from('connections').select('*', { count: 'exact', head: true }).or(`requester_id.eq.${userId},receiver_id.eq.${userId}`).eq('status', 'accepted'),
      ])
      setProfile(p ?? null)
      setStats({ connections: connections ?? 0, posts: posts ?? 0, sessions: sessions ?? 0 })
    }
    run()
  }, [userId])

  const updateProfile = async (values) => {
    const { data, error } = await supabase.from('profiles').update(values).eq('id', userId).select('*').single()
    if (!error) setProfile(data)
    return error
  }

  const uploadAvatar = async (file) => {
    const path = `${userId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
    if (error) return error
    const { data } = supabase.storage.from('profiles').getPublicUrl(path)
    return updateProfile({ avatar_url: data.publicUrl })
  }

  return { profile, stats, updateProfile, uploadAvatar }
}
