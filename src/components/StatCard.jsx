import { ArrowUp, ArrowDown } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, delta, color = 'blue' }) {
  const positive = delta !== undefined && delta >= 0
  return (
    <div className="stat-card">
      <div className={`stat-icon icon-${color}`}><Icon size={20} /></div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {delta !== undefined && (
          <p className={'stat-delta ' + (positive ? 'up' : 'down')}>
            {positive ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            {Math.abs(delta)}% from last week
          </p>
        )}
      </div>
    </div>
  )
}
