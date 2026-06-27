import Button from '../components/Button'
import Input from '../components/Input'
import { useConnections } from '../hooks/useConnections'

export default function Members({ user }) {
  const { members, filters, setFilters, search, connect } = useConnections(user.id)

  return (
    <div>
      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <Input placeholder="Search name/company/role" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
        <Input placeholder="Domain" value={filters.domain} onChange={(e) => setFilters((f) => ({ ...f, domain: e.target.value }))} />
        <Input placeholder="Batch Year" value={filters.batch_year} onChange={(e) => setFilters((f) => ({ ...f, batch_year: e.target.value }))} />
        <Input placeholder="City" value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} />
      </div>
      <Button onClick={search}>Apply Filters</Button>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-slate-300">{member.role} at {member.company}</p>
            <p className="text-xs text-slate-400">{member.domain} · {member.city} · Batch {member.batch_year}</p>
            <Button className="mt-3" onClick={() => connect(member.id)}>Connect</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
