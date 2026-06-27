import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useConnections(currentUserId) {
  const [members, setMembers] = useState([])
  const [filters, setFilters] = useState({ q: '', domain: '', city: '', batch_year: '' })

  const search = useCallback(async () => {
    let query = supabase
      .from('profiles')
      .select('id,name,role,company,batch_year,domain,city,is_mentor')
      .neq('id', currentUserId)
      .order('created_at', { ascending: false })

    if (filters.q) query = query.or(`name.ilike.%${filters.q}%,company.ilike.%${filters.q}%,role.ilike.%${filters.q}%`)
    if (filters.domain) query = query.eq('domain', filters.domain)
    if (filters.city) query = query.eq('city', filters.city)
    if (filters.batch_year) query = query.eq('batch_year', Number(filters.batch_year))

    const { data } = await query.limit(60)
    setMembers(data ?? [])
  }, [filters, currentUserId])

  useEffect(() => { if (currentUserId) search() }, [search, currentUserId])

  const connect = async (receiverId) => {
    const { error } = await supabase.from('connections').upsert({ requester_id: currentUserId, receiver_id: receiverId, status: 'pending' }, { onConflict: 'requester_id,receiver_id' })
    return error
  }

  return { members, filters, setFilters, search, connect }
}
