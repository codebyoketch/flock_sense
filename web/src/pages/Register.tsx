// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { royalFlockTheme } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    animalType: 'poultry',
    herdSize: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { colors, spacing, typography } = royalFlockTheme;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name) newErrors.name = 'Full name is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!form.herdSize) newErrors.herdSize = 'Herd size is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      <Card style={{ maxWidth: 520, width: '100%', padding: spacing.xl }}>
        <h2
          style={{
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.sizes.h2,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          🐔 Create Account
        </h2>
        <p
          style={{
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
          }}
        >
          Join FlockSense and start tracking your sustainability
        </p>

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <Input
              label="Full Name"
              placeholder="Mary Wanjiku"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="0712345678"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />
          </div>

          <Input
            label="Email (Optional)"
            type="email"
            placeholder="mary@farm.com"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Farm Name"
            placeholder="Green Acres Farm"
            name="farmName"
            value={form.farmName}
            onChange={handleChange}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <div style={{ marginBottom: spacing.md }}>
              <label
                style={{
                  fontSize: typography.sizes.small,
                  fontWeight: typography.weights.medium,
                  color: colors.textPrimary,
                  display: 'block',
                  marginBottom: spacing.xs,
                }}
              >
                Animal Type *
              </label>
              <select
                name="animalType"
                value={form.animalType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.cream}`,
                  borderRadius: 8,
                  fontSize: typography.sizes.body,
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  outline: 'none',
                }}
              >
                <option value="poultry">🐔 Poultry</option>
                <option value="dairy">🐄 Dairy</option>
                <option value="goats">🐐 Goats</option>
                <option value="sheep">🐑 Sheep</option>
                <option value="cattle">🐂 Cattle</option>
              </select>
            </div>

            <Input
              label="Herd Size"
              type="number"
              placeholder="50"
              name="herdSize"
              value={form.herdSize}
              onChange={handleChange}
              error={errors.herdSize}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create Account →
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
          Already have an account?{' '}
          <a
            href="/login"
            style={{
              color: colors.primary,
              fontWeight: typography.weights.bold,
              textDecoration: 'none',
            }}
          >
            Login
          </a>
        </div>
      </Card>
    </div>
  );
}