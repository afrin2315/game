import { useState } from 'react'
import Papa from 'papaparse'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')

  const parseFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setRows(result.data),
    })
  }

  const sendInvites = async () => {
    setStatus('Sending...')
    for (const row of rows) {
      const { data, error } = await supabase.from('invites').insert({ name: row.name, email: row.email, phone: row.phone }).select('token').single()
      if (!error && data?.token) {
        await supabase.functions.invoke('send-invite', { body: { ...row, token: data.token } })
      }
    }
    setStatus(`Done. Processed ${rows.length} invites.`)
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold">Admin Invites</h2>
      <p className="text-sm text-slate-300">Upload CSV with columns: name, email, phone</p>
      <input className="mt-4" type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])} />
      <div className="mt-3 text-sm">Parsed rows: {rows.length}</div>
      <Button className="mt-3" onClick={sendInvites} disabled={!rows.length}>Insert + Send Invites</Button>
      {status && <div className="mt-3 text-sm text-[#00C9B1]">{status}</div>}
    </div>
  )
}
