import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import { StatusBadge, SeverityBadge } from '../components/StatusBadge'
import { reportsApi } from '../api/reports'
import { useToast } from '../context/ToastContext'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../constants'

const SEVERITY_COLOR = { critical: '#e0243c', high: '#f5a623', medium: '#eab308', low: '#17b26a' }

function ReportPopup({ report: r }) {
  return (
    <>
      <strong>{r.title}</strong><br />
      {r.category_name} · {r.address || r.location_name || 'Location not provided'}<br />
      {r.location_is_approximate && (
        <div style={{ marginTop: 4, color: '#b45309', fontSize: 12 }}>
          Approximate location (managed barangay/location reference)
        </div>
      )}
      <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
        <StatusBadge status={r.status} />
        <SeverityBadge severity={r.severity} />
      </div>
    </>
  )
}

export default function MapsHeatmap() {
  const toast = useToast()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [severity, setSeverity] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAllReports() {
      setLoading(true)
      try {
        // Do not use with_coords here: that filter hides older reports whose
        // exact GPS coordinates are missing. The API supplies map_lat/map_lng
        // from the report GPS first, then a managed location as a fallback.
        const firstPage = await reportsApi.list({ page: 1, per_page: 500, severity })
        const all = [...(firstPage.reports || [])]
        const total = Number(firstPage.total || all.length)
        const pages = Math.ceil(total / 500)

        for (let page = 2; page <= pages; page += 1) {
          const result = await reportsApi.list({ page, per_page: 500, severity })
          all.push(...(result.reports || []))
        }

        if (!cancelled) setReports(all.map((report) => {
          const mapLat = report.map_lat ?? report.lat
          const mapLng = report.map_lng ?? report.lng
          return {
            ...report,
            map_lat: mapLat === '' || mapLat == null ? null : Number(mapLat),
            map_lng: mapLng === '' || mapLng == null ? null : Number(mapLng),
          }
        }))
      } catch (e) {
        if (!cancelled) toast.error(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAllReports()
    return () => { cancelled = true }
  }, [severity]) // eslint-disable-line react-hooks/exhaustive-deps

  const plottedReports = reports.filter((r) =>
    Number.isFinite(r.map_lat) && Number.isFinite(r.map_lng) &&
    r.map_lat >= -90 && r.map_lat <= 90 && r.map_lng >= -180 && r.map_lng <= 180
  )
  const approximateReports = plottedReports.filter((r) => r.location_is_approximate)
  const unplottedCount = reports.length - plottedReports.length

  // Group markers that would visually overlap at the map's default zoom.
  // Five decimal places only groups points within roughly a metre, which is
  // too strict for Leaflet markers that overlap on screen. Use a 75 m radius
  // while keeping each group anchored to an actual report coordinate.
  const markerGroups = []
  const markerGroupRadiusMeters = 75
  const distanceMeters = (lat1, lng1, lat2, lng2) => {
    const toRadians = (value) => (value * Math.PI) / 180
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  for (const report of plottedReports) {
    const existingGroup = markerGroups.find((group) =>
      distanceMeters(group.lat, group.lng, report.map_lat, report.map_lng) <= markerGroupRadiusMeters
    )
    if (existingGroup) {
      existingGroup.reports.push(report)
    } else {
      markerGroups.push({
        key: `report-${report.id ?? markerGroups.length}-${report.map_lat}-${report.map_lng}`,
        lat: report.map_lat,
        lng: report.map_lng,
        reports: [report],
      })
    }
  }

  const makeGroupIcon = (count, reportsAtPoint) => {
    const order = { critical: 4, high: 3, medium: 2, low: 1 }
    const mostSevere = reportsAtPoint.reduce((best, item) =>
      (order[item.severity] || 0) > (order[best] || 0) ? item.severity : best, 'low')
    const color = SEVERITY_COLOR[mostSevere] || '#2f6fed'
    return L.divIcon({
      className: 'safezone-map-marker-group',
      html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;">${count}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  const center = [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]
  const talibonBounds = L.latLngBounds(
    [10.05, 124.20],
    [10.25, 124.45],
  )

  return (
    <>
      <PageHeader
        title="Maps & Heatmap"
        subtitle="Geographic view of reported hazards specifically in Talibon, Bohol, Philippines"
        actions={
          <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        }
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24 }}><Spinner label="Loading map data..." /></div>
        ) : (
          <MapContainer center={center} zoom={DEFAULT_MAP_ZOOM} minZoom={12} maxZoom={17} maxBounds={talibonBounds} maxBoundsViscosity={1.0} style={{ height: 560, width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markerGroups.map((group) => group.reports.length === 1 ? (
              <CircleMarker
                key={group.key}
                center={[group.lat, group.lng]}
                radius={9}
                pathOptions={{ color: SEVERITY_COLOR[group.reports[0].severity] || '#2f6fed', fillColor: SEVERITY_COLOR[group.reports[0].severity] || '#2f6fed', fillOpacity: 0.75, weight: 2 }}
              >
                <Popup>
                  <ReportPopup report={group.reports[0]} />
                </Popup>
              </CircleMarker>
            ) : (
              <Marker
                key={group.key}
                position={[group.lat, group.lng]}
                icon={makeGroupIcon(group.reports.length, group.reports)}
              >
                <Popup minWidth={240}>
                  <strong>{group.reports.length} reports at this location</strong>
                  <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
                    {group.reports.map((r) => (
                      <div key={r.id} style={{ borderTop: '1px solid #d0d5dd', paddingTop: 8 }}>
                        <ReportPopup report={r} />
                      </div>
                    ))}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '12px 0', color: 'var(--text-muted, #667085)', fontSize: 13 }}>
        <span><strong>{reports.length}</strong> reports matching this filter</span>
        <span><strong>{plottedReports.length}</strong> shown on map</span>
        {approximateReports.length > 0 && <span><strong>{approximateReports.length}</strong> approximate locations</span>}
        {unplottedCount > 0 && <span><strong>{unplottedCount}</strong> cannot be mapped (no report GPS or managed location coordinates)</span>}
      </div>

      <div className="legend-row">
        {Object.entries(SEVERITY_COLOR).map(([sev, color]) => (
          <span key={sev} className="legend-chip"><span className="dot" style={{ background: color }} /> {sev}</span>
        ))}
      </div>
    </>
  )
}
