// src/theme/index.ts
export const royalFlockTheme = {
  colors: {
    primary: '#2D6A4F',
    secondary: '#52B788',
    sage: '#95D5B2',
    cream: '#F8F9FA',
    background: '#FAFAF5',
    surface: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    error: '#DC2626',
    info: '#3B82F6',
    textOnDark: '#FFFFFF',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif',
    },
    sizes: {
      h1: '32px',
      h2: '24px',
      h3: '20px',
      body: '16px',
      small: '14px',
    },
    weights: {
      medium: 500,
      bold: 700,
    },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    card: {
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    elevated: {
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    },
    cta: {
      boxShadow: '0 4px 20px rgba(82, 183, 136, 0.3)',
    },
  },
};
