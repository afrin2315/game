const MSG91_AUTH_KEY = Deno.env.get('MSG91_AUTH_KEY')
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const APP_URL = Deno.env.get('APP_URL') ?? 'https://yourdomain.com'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { name, email, phone, token } = await req.json()
  const link = `${APP_URL}/join?token=${token}`

  const smsTask = phone && MSG91_AUTH_KEY
    ? fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_id: Deno.env.get('MSG91_FLOW_ID'),
          mobiles: `91${String(phone).replace(/\D/g, '')}`,
          VAR1: name,
          VAR2: link,
        }),
      })
    : Promise.resolve(null)

  const emailTask = email && RESEND_API_KEY
    ? fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Rooman Alumni <invites@rooman.network>',
          to: [email],
          subject: 'Your Rooman Alumni Invite',
          html: `<p>Hi ${name},</p><p>Join the Rooman Alumni Network: <a href="${link}">${link}</a></p>`,
        }),
      })
    : Promise.resolve(null)

  await Promise.all([smsTask, emailTask])
  return Response.json({ ok: true, link })
})
