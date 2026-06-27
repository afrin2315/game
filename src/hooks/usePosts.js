import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 10

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(async (reset = false) => {
    if (loading) return
    setLoading(true)
    const start = reset ? 0 : offset
    const end = start + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(id,name,avatar_url,role,company), likes(user_id), comments(id,content,user_id,created_at,profiles!comments_user_id_fkey(name))')
      .order('created_at', { ascending: false })
      .range(start, end)

    if (!error) {
      setPosts((prev) => (reset ? (data ?? []) : [...prev, ...(data ?? [])]))
      setOffset(start + PAGE_SIZE)
      setHasMore((data?.length ?? 0) === PAGE_SIZE)
    }
    setLoading(false)
  }, [offset, loading])

  useEffect(() => { fetchPage(true) }, [])

  useEffect(() => {
    const channel = supabase
      .channel('feed-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPage(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchPage(true))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPage])

  const createPost = async (payload) => {
    const { error } = await supabase.from('posts').insert(payload)
    if (!error) fetchPage(true)
    return error
  }

  const toggleLike = async (postId, userId) => {
    const existing = posts.find((post) => post.id === postId)?.likes?.some((like) => like.user_id === userId)
    if (existing) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId)
      await supabase.rpc('decrement_post_like', { post_uuid: postId })
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: userId })
      await supabase.rpc('increment_post_like', { post_uuid: postId })
    }
    fetchPage(true)
  }

  const addComment = async ({ postId, userId, content }) => {
    if (!content?.trim()) return null
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, content })
    if (!error) {
      await supabase.rpc('increment_post_comment', { post_uuid: postId })
      fetchPage(true)
    }
    return error
  }

  return { posts, loading, hasMore, fetchMore: () => fetchPage(false), createPost, toggleLike, addComment, refresh: () => fetchPage(true) }
}
