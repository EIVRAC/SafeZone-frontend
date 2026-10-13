import Modal from './Modal'

export default function ConfirmDialog({ open, title = 'Are you sure?', message, danger = true, onCancel, onConfirm, busy }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} width={420}>
      <p style={{ marginBottom: 20, color: 'var(--muted)' }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}
