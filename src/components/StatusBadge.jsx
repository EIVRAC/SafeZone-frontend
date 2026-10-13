const STATUS_STYLES = {
  pending: 'badge-pending',
  in_progress: 'badge-progress',
  under_review: 'badge-review',
  resolved: 'badge-resolved',
  rejected: 'badge-rejected',
}

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  under_review: 'Under Review',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

export function StatusBadge({ status }) {
  return <span className={'badge ' + (STATUS_STYLES[status] || 'badge-pending')}>{STATUS_LABELS[status] || status}</span>
}

const SEVERITY_STYLES = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

export function SeverityBadge({ severity }) {
  return <span className={'badge ' + (SEVERITY_STYLES[severity] || 'badge-medium')}>{severity?.charAt(0).toUpperCase() + severity?.slice(1)}</span>
}

export function RoleBadge({ role }) {
  const styles = { admin: 'badge-critical', staff: 'badge-progress', citizen: 'badge-review' }
  return <span className={'badge ' + (styles[role] || 'badge-pending')}>{role?.charAt(0).toUpperCase() + role?.slice(1)}</span>
}
