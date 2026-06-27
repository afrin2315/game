import { createClient } from 'npm:@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('VITE_RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const body = await req.json()

  const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${razorpayAuth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Number(body.amount) * 100, currency: 'INR', receipt: crypto.randomUUID() }),
  })

  const order = await orderRes.json()
  if (!orderRes.ok) return new Response(JSON.stringify(order), { status: 400 })

  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  await admin.from('mentorship_sessions').insert({
    mentor_id: body.mentor_id,
    mentee_id: body.mentee_id,
    topic: body.topic,
    scheduled_at: body.scheduled_at,
    amount: Number(body.amount),
    status: 'pending',
    razorpay_order_id: order.id,
  })

  return Response.json({ order_id: order.id, amount: order.amount, currency: order.currency })
})
