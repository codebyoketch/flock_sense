// src/components/AppShell.tsx
// Sidebar layout shell with sticky topbar and mobile bottom dock.
import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, BookOpenCheck, Compass, FileText,
  Leaf, Menu, Network, ShieldCheck, Sparkles,
  UserRound, X, ClipboardCheck, Home,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { clearToken } from '../services/auth';
import '../theme/shell.css';
import '../theme/primitives.css';

const navigation = [
  { label: 'Overview',        href: '/dashboard',        icon: Compass },
  { label: 'My Footprint',    href: '/footprint',        icon: BarChart3 },
  { label: 'Calculator',      href: '/calculator',       icon: Sparkles },
  { label: 'Recommendations', href: '/recommendations',  icon: Leaf },
  { label: 'Benchmark',       href: '/benchmark',        icon: Network },
  { label: 'Verification',    href: '/verifications',    icon: ClipboardCheck },
  { label: 'Reports',         href: '/reports',          icon: FileText },
  { label: 'Credential',      href: '/credential',       icon: ShieldCheck },
  { label: 'Holdings',        href: '/holdings',         icon: Home },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifications, farmer } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingCount = verifications.length;

  async function handleSignOut() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clearing the local credential still signs the user out if the API is unreachable.
    }
    clearToken();
    navigate('/');
  }

  function NavLink({ href, label, icon: Icon, onClick }: {
    href: string; label: string;
    icon: typeof Compass; onClick?: () => void;
  }) {
    const active = location.pathname === href;
    return (
      <Link
        to={href}
        className={`shell-nav-link ${active ? 'active' : ''}`}
        onClick={onClick}
      >
        <Icon className="shell-nav-icon" />
        {label}
        {label === 'Verification' && pendingCount > 0 && (
          <span className="shell-nav-badge">{pendingCount}</span>
        )}
      </Link>
    );
  }

  return (
    <div className="shell-root">
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="shell-sidebar">
        <Link to="/dashboard" className="shell-logo">
          <span className="shell-logo-emoji">🐑</span>
          <span className="shell-logo-text">FlockSense</span>
        </Link>

        <p className="shell-nav-label">Farm workspace</p>
        <nav className="shell-nav">
          {navigation.map(({ label, href, icon }) => (
            <NavLink key={href} href={href} label={label} icon={icon} />
          ))}
        </nav>

        <div className="shell-sync-widget">
          <div className="shell-sync-row">
            <span>🌿</span>
            {farmer?.cooperative_name ?? 'Cooperative'}
          </div>
          <p className="shell-sync-sub">
            {farmer?.name ? `Signed in as ${farmer.name}` : 'Loading…'}
          </p>
          <button
            onClick={handleSignOut}
            style={{
              marginTop: 10, width: '100%', background: 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: 8, padding: '7px 12px',
              fontSize: 12, fontWeight: 700, color: 'rgba(253,246,236,0.8)',
              cursor: 'pointer', textAlign: 'left', display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <div className="shell-content">
        {/* Topbar */}
        <header className="shell-topbar">
          <div className="shell-topbar-left">
            {/* Hamburger (mobile only) */}
            <button
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'none',
                width: 40, height: 40, borderRadius: 12,
                border: '1px solid rgba(156,175,136,0.3)',
                background: '#fff', cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
              }}
              className="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
            <span className="shell-topbar-mobile-logo">🐑</span>

            <div>
              <p className="shell-topbar-eyebrow">
                {farmer?.name ?? 'Your Farm'}{' '}
                <span style={{ margin: '0 6px', color: '#9CAF88' }}>/</span>
                {farmer?.location ?? '—'}
              </p>
              <p className="shell-topbar-sub">
                {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} reporting period
              </p>
            </div>
          </div>

          <div className="shell-topbar-right">
            <Link
              to="/verifications"
              className="shell-topbar-icon-btn"
              aria-label="Pending verifications"
            >
              <Bell size={18} />
              {pendingCount > 0 && <span className="shell-notif-dot" />}
            </Link>
            <Link to="/profile" className="shell-avatar-btn" aria-label="Profile">
              <UserRound size={18} />
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="shell-main">{children}</main>
      </div>

      {/* ── MOBILE BOTTOM DOCK ── */}
      <nav className="shell-mobile-dock" aria-label="Mobile navigation">
        {navigation.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={`shell-dock-link ${location.pathname === href ? 'active' : ''}`}
          >
            <Icon className="shell-dock-icon" />
            <span>{label.replace('My ', '')}</span>
          </Link>
        ))}
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {drawerOpen && (
        <div className="shell-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="shell-drawer" onClick={e => e.stopPropagation()}>
            <button className="shell-drawer-close" onClick={() => setDrawerOpen(false)}>
              <X size={20} />
            </button>
            <div className="shell-drawer-logo">
              <span style={{ fontSize: 24 }}>🐑</span>
              <strong style={{ fontSize: 18 }}>FlockSense</strong>
            </div>
            <nav className="shell-drawer-nav">
              {navigation.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`shell-drawer-link ${location.pathname === href ? 'active' : ''}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="shell-drawer-footer">
              <BookOpenCheck size={16} style={{ marginBottom: 4 }} />
              <br />
              Designed to keep working when the signal drops.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
