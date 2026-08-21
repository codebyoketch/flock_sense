// src/pages/Landing.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import '../theme/landing.css';

const features = [
  {
    title: 'Livestock Monitoring',
    description:
      'Track your herd health, weight gain and movement in real time with smart IoT sensors and automatic log entries.',
  },
  {
    title: 'Sustainability Scoring',
    description:
      'Get a personalised A–E grade across feed, energy, waste and water and see exactly where to improve.',
  },
  {
    title: 'Verified Holdings',
    description:
      'Submit holdings for expert verification and build a credible, auditable record for buyers and certifiers.',
  },
  {
    title: 'Actionable Insights',
    description:
      'AI-powered recommendations that translate your data into concrete steps with projected CO₂e savings.',
  },
];

const stats = [
  { value: '2,400+', label: 'Farmers Onboarded' },
  { value: '18%',    label: 'Avg. Emissions Reduced' },
  { value: '94%',    label: 'Verification Rate' },
  { value: '£12M',   label: 'Carbon Credits Unlocked' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Redirect authenticated users straight to the dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/holdings', { replace: true });
    }
  }, [navigate]);

  // Toggle scrolled class for sticky nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">

      {/* ── NAV ── */}
      <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <div className="nav-logo">
          <span className="nav-logo-text">FlockSense</span>
        </div>

        {/* Links + buttons */}
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#stats"    className="nav-link">Impact</a>
          <button
            id="nav-login-btn"
            className="btn btn-outline"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <button
            id="nav-register-btn"
            className="btn btn-primary-nav"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-badge-text">Sustainable Livestock Management</span>
        </div>

        <h1 className="hero-h1">
          Know Your Flock.<br />
          <span className="hero-h1-accent">Grow Your Impact.</span>
        </h1>

        <p className="hero-subtitle">
          FlockSense turns your farm's daily data into a sustainability story;
          tracking emissions, verifying holdings and surfacing the insights that
          help you farm smarter and greener.
        </p>

        {/* CTA row */}
        <div className="hero-cta-row">
          <button
            id="hero-register-btn"
            className="btn btn-hero-primary"
            onClick={() => navigate('/register')}
          >
            Start for Free →
          </button>
          <button
            id="hero-login-btn"
            className="btn btn-hero-secondary"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>

        <p className="hero-trust">
          No credit card required | GDPR compliant | Free forever for small herds
        </p>
      </section>

      {/* ── STATS STRIP ── */}
      <section id="stats" className="stats-section">
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <h2 className="features-heading">Everything your farm needs</h2>
        <p className="features-subheading">
          Built for modern livestock farmers who care about both yields and the planet.
        </p>

        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section className="cta-banner">
        <h2 className="cta-banner-heading">Ready to sense your flock?</h2>
        <p className="cta-banner-subtext">
          Join thousands of farmers already using FlockSense to reduce emissions
          and increase profitability.
        </p>
        <button
          id="footer-register-btn"
          className="btn btn-cta-footer"
          onClick={() => navigate('/register')}
        >
          Create Free Account →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        © {new Date().getFullYear()} FlockSense - Built with for sustainable farming
      </footer>
    </div>
  );
}
