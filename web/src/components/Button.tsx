// src/components/Button.tsx
import React, { useState } from 'react';
import { royalFlockTheme } from '../theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  onClick,
  children,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const { colors, borderRadius, spacing, shadows } = royalFlockTheme;
  const [isHovered, setIsHovered] = useState(false);

  // Size styles
  const sizeStyles = {
    small: { padding: `${spacing.sm}px ${spacing.md}px`, fontSize: 14 },
    medium: { padding: `${spacing.md}px ${spacing.lg}px`, fontSize: 16 },
    large: { padding: `${spacing.md}px ${spacing.xl}px`, fontSize: 18 },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: colors.secondary,
      color: colors.textOnDark,
      border: 'none',
      boxShadow: shadows.cta.boxShadow,
    },
    secondary: {
      backgroundColor: colors.primary,
      color: colors.textOnDark,
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
  };

  const isDisabled = disabled || loading;

  const buttonStyle: React.CSSProperties = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: borderRadius.md,
    fontWeight: 600,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    opacity: isDisabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    transform: isHovered && !isDisabled ? 'translateY(-2px)' : 'none',
    boxShadow: isHovered && !isDisabled && variant === 'primary' 
      ? '0 8px 24px rgba(255, 140, 66, 0.3)' 
      : variantStyles[variant].boxShadow || 'none',
  };

  return (
    <button
      type={type}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading ? (
        <>
          <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>
            ⟳
          </span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}