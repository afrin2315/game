import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import { supabase } from '../lib/supabase'
import { createOrder, loadRazorpayScript, verifyPayment } from '../lib/razorpay'

export default function Mentorship({ user }) {
  const [mentors, setMentors] = useState([])
  const [selected, setSelected] = useState(null)
  const [topic, setTopic] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('id,name,role,domain,mentor_rate').eq('is_mentor', true).then(({ data }) => setMentors(data ?? []))
  }, [])

  const startCheckout = async () => {
    if (!selected) return
    const loaded = await loadRazorpayScript()
    if (!loaded) return

    const order = await createOrder({ amount: selected.mentor_rate ?? 0, mentor_id: selected.id, mentee_id: user.id, topic, scheduled_at: scheduledAt })
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'Rooman Alumni Network',
      handler: async (response) => {
        await verifyPayment({
          mentor_id: selected.id,
          mentee_id: user.id,
          topic,
          scheduled_at: scheduledAt,
          amount: order.amount,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
        setSelected(null)
      },
    }
    new window.Razorpay(options).open()
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {mentors.map((mentor) => (
        <div key={mentor.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <h3 className="font-semibold">{mentor.name}</h3>
          <p className="text-sm text-slate-300">{mentor.role} · {mentor.domain}</p>
          <p className="text-xs text-[#F5A623]">⭐ 4.8 · ₹{mentor.mentor_rate ?? 0}/hr</p>
          <Button className="mt-3" onClick={() => setSelected(mentor)}>Book Session</Button>
        </div>
      ))}

      <Modal open={Boolean(selected)} title={`Book with ${selected?.name ?? ''}`} onClose={() => setSelected(null)} onConfirm={startCheckout} confirmText="Pay & Confirm">
        <Input placeholder="Session topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input className="mt-2" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      </Modal>
    </div>
  )
}
