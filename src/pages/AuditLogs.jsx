import { useEffect, useState } from 'react'
import { ScrollText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { auditLogsApi } from '../api/auditLogs'
import { useToast } from '../context/ToastContext'

export default function AuditLogs() {
  const toast = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')

  useEffect(() => {
    setLoading(true)
    auditLogsApi.list({ action })
      .then((r) => setLogs(r.logs || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [action]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHeader
        title="Audit Logs"
        subtitle="Every create, update, and delete action taken across the system"
        actions={
          <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>
        }
      />

      <div className="card">
        {loading ? <Spinner label="Loading audit trail..." /> : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No activity recorded yet" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>Timestamp</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.user_name || 'System'}</td>
                    <td><span className={`badge badge-${log.action === 'delete' ? 'critical' : log.action === 'create' ? 'resolved' : 'progress'}`}>{log.action}</span></td>
                    <td>{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</td>
                    <td className="muted-cell">{log.details}</td>
                    <td className="muted-cell">{log.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
