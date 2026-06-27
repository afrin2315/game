import { useEffect, useState } from 'react'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Input from '../components/Input'
import { usePosts } from '../hooks/usePosts'

const types = ['Update', 'Hiring', 'OpenToWork', 'Mentorship', 'StartupVarsity']

export default function Feed({ user }) {
  const { posts, createPost, toggleLike, addComment, fetchMore, hasMore, loading } = usePosts()
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState(types[0])
  const [commentInputs, setCommentInputs] = useState({})

  useEffect(() => {
    const onScroll = () => {
      if (!hasMore || loading) return
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) fetchMore()
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [fetchMore, hasMore, loading])

  const submitPost = async () => {
    await createPost({ user_id: user.id, content, post_type: postType })
    setContent('')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <textarea className="w-full rounded-lg bg-slate-950 p-2" rows={3} placeholder="Share an update..." value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="mt-2 flex gap-2">
          <select className="rounded-lg bg-slate-900 p-2" value={postType} onChange={(e) => setPostType(e.target.value)}>{types.map((t) => <option key={t}>{t}</option>)}</select>
          <Button onClick={submitPost} disabled={!content.trim()}>Post</Button>
        </div>
      </div>

      {posts.map((post) => {
        const liked = post.likes?.some((l) => l.user_id === user.id)
        return (
          <div key={post.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <Avatar src={post.profiles?.avatar_url} alt={post.profiles?.name} />
              <div>
                <div className="font-semibold">{post.profiles?.name}</div>
                <div className="text-xs text-slate-400">{post.post_type} · {new Date(post.created_at).toLocaleString()}</div>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{post.content}</p>
            <div className="mt-3 flex gap-2 text-sm">
              <button onClick={() => toggleLike(post.id, user.id)}>{liked ? 'Unlike' : 'Like'} ({post.likes_count ?? post.likes?.length ?? 0})</button>
              <span>Comments ({post.comments_count ?? post.comments?.length ?? 0})</span>
            </div>
            <div className="mt-2 space-y-2">
              {(post.comments ?? []).map((comment) => <div key={comment.id} className="rounded bg-slate-900 p-2 text-sm"><strong>{comment.profiles?.name ?? 'Member'}:</strong> {comment.content}</div>)}
              <div className="flex gap-2">
                <Input placeholder="Add comment" value={commentInputs[post.id] ?? ''} onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))} />
                <Button onClick={() => addComment({ postId: post.id, userId: user.id, content: commentInputs[post.id] ?? '' }).then(() => setCommentInputs((prev) => ({ ...prev, [post.id]: '' })))}>Send</Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
