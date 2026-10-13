import { ShieldCheck, MapPin, Users, Zap } from 'lucide-react'

const MAP_PINS = [
  { top: '22%', left: '28%', tone: 'critical' },
  { top: '52%', left: '58%', tone: 'high' },
  { top: '32%', left: '74%', tone: 'medium' },
  { top: '68%', left: '22%', tone: 'low' },
  { top: '70%', left: '68%', tone: 'high' },
]

export default function AuthLayout({ children, swapped = false }) {
  return (
    <div className={'auth-screen' + (swapped ? ' is-swapped' : '')}>
      <div className="auth-hero">
        <div className="auth-hero-pattern" />
        <div className="auth-hero-glow auth-hero-glow-a" />
        <div className="auth-hero-glow auth-hero-glow-b" />

        <div className="auth-hero-content">
          <div className="auth-hero-brand">
            <div className="brand-mark brand-mark-lg"><ShieldCheck size={24} strokeWidth={2.2} /></div>
            <span className="auth-hero-brand-name">SAFEZONE</span>
          </div>

          <h1 className="auth-hero-headline">
            Building safer communities,<br />one report at a time.
          </h1>
          <p className="auth-hero-subtext">
            The public infrastructure hazard reporting &amp; management
            system for Talibon, Bohol — see it, report it, get it fixed.
          </p>

          <div className="auth-illustration">
            <div className="auth-map-card">
              <div className="auth-map-card-header">
                <MapPin size={13} /> Live Hazard Map
              </div>
              <div className="auth-map-preview">
                {MAP_PINS.map((pin, i) => (
                  <span
                    key={i}
                    className={`map-pin pin-${pin.tone}`}
                    style={{ top: pin.top, left: pin.left }}
                  />
                ))}
              </div>
            </div>

            <div className="auth-float-card float-a">
              <div className="auth-float-icon"><Users size={15} /></div>
              <div>
                <strong>Staff-coordinated</strong>
                <span>Logged and tracked by your team</span>
              </div>
            </div>

            <div className="auth-float-card float-b">
              <div className="auth-float-icon"><Zap size={15} /></div>
              <div>
                <strong>Faster response</strong>
                <span>Agencies coordinate in real time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-seam" />

      <div className="auth-form-side">
        {children}
      </div>
    </div>
  )
}
