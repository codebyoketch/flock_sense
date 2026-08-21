// src/theme/index.ts
export const royalFlockTheme = {
  colors: {
    // Core Brand
    burgundy: "#800020",      // Headers, trust, authority
    sunsetOrange: "#FF8C42",  // CTAs, highlights, progress, "Money Button"
    cream: "#FDF6EC",         // Background, cards
    sage: "#9CAF88",          // Accent, sustainability nod, secondary

    // Semantic aliases
    primary: "#800020",
    secondary: "#FF8C42",
    background: "#FDF6EC",
    surface: "#FFFFFF",
    accent: "#9CAF88",

    // Text
    textPrimary: "#2D1B1B",   // Dark brown on cream
    textSecondary: "#6B5B5B", // Muted
    textOnDark: "#FDF6EC",    // Cream text on burgundy

    // Status
    success: "#9CAF88",       // Sage = good
    warning: "#FF8C42",       // Orange = needs attention
    error: "#B00020",         // Dark red
    info: "#004D4D",          // Deep teal for contrast

    // Data Viz – Emissions Breakdown
    feed: "#800020",          // Burgundy
    energy: "#FF8C42",        // Orange
    waste: "#9CAF88",         // Sage
  },

  // CSS-ready strings (web compatible)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    pill: '999px',
  },

  typography: {
    fontFamily: {
      heading: "'Poppins', sans-serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    sizes: {
      h1: '28px',
      h2: '22px',
      h3: '18px',
      body: '16px',
      small: '14px',
      badge: '48px',
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },

  // CSS box-shadow equivalents (web)
  shadows: {
    card: {
      boxShadow: '0 4px 12px rgba(128,0,32,0.08)',
    },
    cta: {
      boxShadow: '0 6px 16px rgba(255,140,66,0.25)',
    },
    elevated: {
      boxShadow: '0 8px 32px rgba(128,0,32,0.12)',
    },
  },

  components: {
    button: {
      primary: {
        bg: "#FF8C42",
        text: "#FFFFFF",
        borderRadius: '16px',
        padding: '16px',
      },
      secondary: {
        bg: "#800020",
        text: "#FDF6EC",
        borderRadius: '16px',
        padding: '16px',
      },
    },
    card: {
      bg: "#FFFFFF",
      borderRadius: '20px',
      padding: '20px',
    },
    badge: {
      scoreA: "#9CAF88",
      scoreB: "#FF8C42",
      scoreC: "#D4A017",
      scoreD: "#C65D07",
      scoreE: "#B00020",
    },
  },
};

export default royalFlockTheme;
