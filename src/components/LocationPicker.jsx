import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../constants'

// Fix default marker icons (Vite doesn't resolve Leaflet's default asset paths)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

export default function LocationPicker({ lat, lng, onChange, height = 260 }) {
  const [center] = useState([lat || DEFAULT_MAP_CENTER.lat, lng || DEFAULT_MAP_CENTER.lng])

  return (
    <div className="location-picker" style={{ height }}>
      <MapContainer center={center} zoom={DEFAULT_MAP_ZOOM} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onPick={onChange} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>
      <p className="map-hint">Click on the map to drop a pin at the hazard's exact location.</p>
    </div>
  )
}
