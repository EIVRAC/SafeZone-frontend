import { FileSpreadsheet, FileText, Users, Building2, MapPin, Shapes } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { exportUrl } from '../api/auditLogs'

const EXPORTS = [
  { type: 'reports', label: 'Hazard Reports', desc: 'All hazard reports with status, severity, category and location.', icon: FileText },
  { type: 'categories', label: 'Categories', desc: 'Hazard categories and report counts per category.', icon: Shapes },
  { type: 'locations', label: 'Locations', desc: 'Tracked locations and districts.', icon: MapPin },
  { type: 'agencies', label: 'Agencies', desc: 'Response agencies and assigned report counts.', icon: Building2 },
  { type: 'users', label: 'Users', desc: 'Registered users and their roles.', icon: Users },
]

export default function ExportData() {
  return (
    <>
      <PageHeader title="Export Data" subtitle="Download system data as CSV for offline analysis or reporting" />

      <div className="grid-cards">
        {EXPORTS.map(({ type, label, desc, icon: Icon }) => (
          <div key={type} className="mini-card export-card">
            <div className="mini-card-top">
              <div className="stat-icon icon-blue"><Icon size={18} /></div>
              <h3>{label}</h3>
            </div>
            <p>{desc}</p>
            <a className="btn btn-outline btn-block" href={exportUrl(type)} target="_blank" rel="noreferrer">
              <FileSpreadsheet size={15} /> Download CSV
            </a>
          </div>
        ))}
      </div>
    </>
  )
}
