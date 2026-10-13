export default function Spinner({ full = false, label = 'Loading...' }) {
  return (
    <div className={full ? 'spinner-full' : 'spinner-inline'}>
      <div className="spinner" />
      {label && <span>{label}</span>}
    </div>
  )
}
