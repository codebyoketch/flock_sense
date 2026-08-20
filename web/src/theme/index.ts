// src/theme/index.ts
export const royalFlockTheme = {
  colors: {
    // Core Brand Colors
    burgundy: "#800020",
    sunsetOrange: "#FF8C42",
    cream: "#FDF6EC",
    sage: "#9CAF88",
    
    // Semantic Colors
    primary: "#800020",
    secondary: "#FF8C42",
    background: "#FDF6EC",
    surface: "#FFFFFF",
    accent: "#9CAF88",
    
    // Text Colors
    textPrimary: "#2D1B1B",
    textSecondary: "#6B5B5B",
    textOnDark: "#FDF6EC",
    
    // Status Colors
    success: "#9CAF88",
    warning: "#FF8C42",
    error: "#B00020",
    info: "#004D4D",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
  },

  typography: {
    fontFamily: {
      heading: "'Poppins', sans-serif",
      body: "'Inter', sans-serif",
    },
    sizes: {
      h1: 28,
      h2: 22,
      h3: 18,
      body: 16,
      small: 14,
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },

  shadows: {
    card: {
      boxShadow: "0 4px 12px rgba(128, 0, 32, 0.08)",
    },
    cta: {
      boxShadow: "0 6px 16px rgba(255, 140, 66, 0.2)",
    },
  },
};

export default royalFlockTheme;