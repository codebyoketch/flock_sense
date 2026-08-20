// src/components/Input.tsx
import React, { useState } from 'react';
import { royalFlockTheme } from '../theme/index';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  name?: string;
  disabled?: boolean;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  name,
  disabled = false,
}: InputProps) {
  const { colors, spacing } = royalFlockTheme;
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: spacing.md,
    border: `2px solid ${
      error ? colors.error : isFocused ? colors.primary : colors.cream
    }`,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: disabled ? colors.cream : colors.background,
    color: colors.textPrimary,
    outline: 'none',
    transition: 'border 0.2s ease',
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    display: 'block',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 14,
    color: colors.error,
    marginTop: spacing.xs,
  };

  const containerStyle: React.CSSProperties = {
    marginBottom: spacing.md,
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
        required={required}
        name={name}
        disabled={disabled}
      />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}