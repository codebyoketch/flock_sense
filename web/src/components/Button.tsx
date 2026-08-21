// src/components/Button.tsx
import React, { useState } from 'react';
import { royalFlockTheme } from '../theme/index';

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
  const { colors, spacing } = royalFlockTheme;
  const [isHovered, setIsHovered] = useState(false);

  // Size styles
  const sizeStyles = {
    small: { padding: `${spacing.sm} ${spacing.md}`, fontSize: 14 },
    medium: { padding: `${spacing.md} ${spacing.lg}`, fontSize: 16 },
    large: { padding: `${spacing.md} ${spacing.xl}`, fontSize: 18 },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: colors.secondary,
      color: '#FFFFFF',
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.primary,
      color: '#FFFFFF',
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
    borderRadius: 8,
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
    // Remove the duplicate boxShadow - only keep this one
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
