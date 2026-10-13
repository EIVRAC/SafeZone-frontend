import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <Icon size={36} strokeWidth={1.5} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}
