import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const years = Array.from({ length: 25 }, (_, i) => 2000 + i)
const courses = ['BCA', 'MCA', 'B.Tech', 'M.Tech', 'MBA', 'Other']
const domains = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Operations', 'Founder', 'Other']
const cities = ['Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai', 'Delhi', 'Pune', 'Remote', 'Other']

export default function Register() {
  const { signInWithOtp, verifyOtp, session, loadProfile } = useAuth()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const token = search.get('token')
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', batch_year: '', course: courses[0],
    company: '', role: '', domain: domains[0], city: cities[0], bio: '',
    is_mentor: false, is_open_to_work: false, is_startup_varsity: false, mentor_rate: '',
  })

  useEffect(() => {
    if (!token) return
    supabase.from('invites').select('name,email,phone').eq('token', token).maybeSingle()
      .then(({ data }) => {
        if (data) setForm((prev) => ({ ...prev, ...data }))
      })
  }, [token])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const requestOtp = async () => {
    setLoading(true)
    await signInWithOtp(form.phone)
    setLoading(false)
  }

  const confirmOtp = async () => {
    setLoading(true)
    const { error } = await verifyOtp(form.phone, otp)
    setLoading(false)
    if (!error) setStep(2)
  }

  const submit = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    const payload = { ...form, batch_year: Number(form.batch_year), mentor_rate: form.is_mentor ? Number(form.mentor_rate || 0) : null, id: session.user.id }
    const { error } = await supabase.from('profiles').upsert(payload)
    if (!error && token) {
      await supabase.from('invites').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('token', token)
    }
    await loadProfile(session.user.id)
    setLoading(false)
    navigate('/app')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="text-2xl font-semibold">Registration</h2>
      {step === 1 && (
        <div className="mt-4 grid gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <Input placeholder="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
          <Input placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          <Input placeholder="Phone (+91...)" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          <select className="rounded-lg bg-slate-900 p-2" value={form.batch_year} onChange={(e) => update('batch_year', e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select>
          <select className="rounded-lg bg-slate-900 p-2" value={form.course} onChange={(e) => update('course', e.target.value)}>{courses.map((c) => <option key={c}>{c}</option>)}</select>
          <div className="flex gap-2">
            <Button onClick={requestOtp} disabled={loading}>Send OTP</Button>
            <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button onClick={confirmOtp} disabled={loading || otp.length < 6}>Verify OTP</Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="mt-4 grid gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <Input placeholder="Company" value={form.company} onChange={(e) => update('company', e.target.value)} />
          <Input placeholder="Job Title" value={form.role} onChange={(e) => update('role', e.target.value)} />
          <select className="rounded-lg bg-slate-900 p-2" value={form.domain} onChange={(e) => update('domain', e.target.value)}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
          <select className="rounded-lg bg-slate-900 p-2" value={form.city} onChange={(e) => update('city', e.target.value)}>{cities.map((c) => <option key={c}>{c}</option>)}</select>
          <textarea className="rounded-lg bg-slate-900 p-2" rows={4} placeholder="Bio" value={form.bio} onChange={(e) => update('bio', e.target.value)} />
          <label><input type="checkbox" checked={form.is_mentor} onChange={(e) => update('is_mentor', e.target.checked)} /> I'm open to mentoring</label>
          <label><input type="checkbox" checked={form.is_open_to_work} onChange={(e) => update('is_open_to_work', e.target.checked)} /> Open to work</label>
          <label><input type="checkbox" checked={form.is_startup_varsity} onChange={(e) => update('is_startup_varsity', e.target.checked)} /> Interested in StartupVarsity</label>
          {form.is_mentor && <Input type="number" placeholder="Hourly Rate (₹)" value={form.mentor_rate} onChange={(e) => update('mentor_rate', e.target.value)} />}
          <Button onClick={submit} disabled={loading}>Complete Registration</Button>
        </div>
      )}
    </div>
  )
}
