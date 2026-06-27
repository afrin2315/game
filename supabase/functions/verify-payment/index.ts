import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const body = await req.json()
  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const { error } = await admin
    .from('mentorship_sessions')
    .update({
      status: 'confirmed',
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_order_id: body.razorpay_order_id,
    })
    .eq('razorpay_order_id', body.razorpay_order_id)
    .eq('mentee_id', body.mentee_id)

  if (error) return new Response(JSON.stringify(error), { status: 400 })
  return Response.json({ ok: true })
})
