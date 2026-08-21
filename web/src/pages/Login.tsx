// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { royalFlockTheme } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { setToken } from '../services/auth';
import { api, ApiRequestError } from '../services/api';

type AuthResponse = { farmer_id: string; token: string; expires_at: string };

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors, spacing, typography } = royalFlockTheme;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) { setError('Enter your phone number.'); return; }
    setLoading(true);
    try {
      const body = await api.post<AuthResponse>('/auth/login', { phone: phone.trim() });
      setToken(body.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Login failed. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.background,
      }}
    >
      {/* ===== LEFT SIDE: BRAND ===== */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${colors.burgundy} 0%, #5A0016 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xxl,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Circles */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 140, 66, 0.1)',
            top: -100,
            right: -100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(156, 175, 136, 0.1)',
            bottom: -50,
            left: -50,
          }}
        />

        <div style={{ maxWidth: 400, color: colors.textOnDark, zIndex: 2 }}>
          <div style={{ fontSize: 64, marginBottom: spacing.md }}>🐔</div>
          <h1
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.sizes.h1,
              color: colors.textOnDark,
              marginBottom: spacing.sm,
            }}
          >
            FlockSense
          </h1>
          <p
            style={{
              fontSize: typography.sizes.body,
              color: 'rgba(253, 246, 236, 0.8)',
              marginBottom: spacing.xl,
            }}
          >
            Your farm's sustainability scorecard — peer-verified, bank-ready.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                fontSize: typography.sizes.body,
                color: 'rgba(253, 246, 236, 0.9)',
              }}
            >
              <span style={{ fontSize: 20 }}>📊</span>
              <span>Measure your carbon footprint</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                fontSize: typography.sizes.body,
                color: 'rgba(253, 246, 236, 0.9)',
              }}
            >
              <span style={{ fontSize: 20 }}>✅</span>
              <span>Peer-verified sustainability</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                fontSize: typography.sizes.body,
                color: 'rgba(253, 246, 236, 0.9)',
              }}
            >
              <span style={{ fontSize: 20 }}>💰</span>
              <span>Access green financing</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE: LOGIN FORM ===== */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <Card style={{ maxWidth: 400, width: '100%', padding: spacing.xl }}>
          <h2
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.sizes.h2,
              color: colors.textPrimary,
              marginBottom: spacing.xs,
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              fontSize: typography.sizes.body,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
            }}
          >
            Login to your FlockSense account
          </p>

          <form onSubmit={handleLogin}>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+254712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            {error && (
              <p style={{ color: colors.error ?? '#B00020', fontSize: typography.sizes.small, marginBottom: spacing.md }}>
                {error}
              </p>
            )}

            <div
              style={{
                textAlign: 'right',
                marginBottom: spacing.lg,
              }}
            >
              <a
                href="#"
                style={{
                  fontSize: typography.sizes.small,
                  color: colors.primary,
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Login
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: spacing.lg,
              fontSize: typography.sizes.body,
              color: colors.textSecondary,
            }}
          >
            Don't have an account?{' '}
            <a
              href="/register"
              style={{
                color: colors.primary,
                fontWeight: typography.weights.bold,
                textDecoration: 'none',
              }}
            >
              Sign Up
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
