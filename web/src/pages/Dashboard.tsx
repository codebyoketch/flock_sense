// src/pages/Dashboard.tsx - WITHOUT useNavigate
import React, { useState, useEffect } from 'react';
import { royalFlockTheme } from '../theme/index';
import Card from '../components/Card';
import Button from '../components/Button';

interface DashboardData {
  farmerName: string;
  score: {
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    co2e: number;
    rank: number;
    breakdown: {
      feed: number;
      energy: number;
      waste: number;
      water: number;
    };
  };
  recommendations: Array<{
    icon: string;
    title: string;
    description: string;
    savings: string;
  }>;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const { colors, spacing, typography } = royalFlockTheme;

  useEffect(() => {
    console.log('Dashboard useEffect running');
    // Simulate API call
    setTimeout(() => {
      console.log('Setting data...');
      setData({
        farmerName: 'Mary Wanjiku',
        score: {
          grade: 'B',
          co2e: 32.5,
          rank: 7,
          breakdown: {
            feed: 45,
            energy: 25,
            waste: 20,
            water: 10,
          },
        },
        recommendations: [
          {
            icon: '💡',
            title: 'Switch to LED bulbs',
            description: 'Replace all bulbs with energy-efficient LEDs',
            savings: '$15/month',
          },
          {
            icon: '🌱',
            title: 'Compost manure',
            description: 'Turn waste into valuable compost',
            savings: '$22/month',
          },
          {
            icon: '☀️',
            title: 'Solar water heating',
            description: 'Install solar panels for water heating',
            savings: '$30/month',
          },
        ],
      });
      setLoading(false);
    }, 1500);
  }, []);

  console.log('Dashboard rendering, loading:', loading, 'data:', data);

  const gradeColors = {
    A: colors.sage,
    B: colors.secondary,
    C: '#D4A017',
    D: '#C65D07',
    E: colors.error,
  };

  const gradeEmojis = {
    A: '🌟',
    B: '👍',
    C: '📊',
    D: '⚠️',
    E: '🚨',
  };

  const breakdownEmojis = {
    feed: '🌾',
    energy: '⚡',
    waste: '🗑️',
    water: '💧',
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background,
          gap: spacing.md,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `4px solid ${colors.cream}`,
            borderTopColor: colors.primary,
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: colors.textSecondary, fontSize: typography.sizes.body }}>
          Loading your farm data...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background,
        }}
      >
        <Card>
          <p>No data available. Please log your farm data.</p>
        </Card>
      </div>
    );
  }

  const { farmerName, score, recommendations } = data;
  const gradeColor = gradeColors[score.grade];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: spacing.xl,
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xl,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.sizes.h1,
              color: colors.textPrimary,
            }}
          >
            👋 Welcome back, {farmerName}
          </h1>
          <p
            style={{
              fontSize: typography.sizes.body,
              color: colors.textSecondary,
            }}
          >
            Here's your farm's sustainability overview
          </p>
        </div>
        <Button size="small" variant="outline">
          Logout
        </Button>
      </div>

      {/* ===== SCORE & BREAKDOWN GRID ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        {/* Score Card */}
        <Card>
          <h3
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.sizes.h3,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Sustainability Score
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.lg,
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                backgroundColor: gradeColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: 28 }}>{gradeEmojis[score.grade]}</span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {score.grade}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.textPrimary,
                }}
              >
                {score.co2e} kg CO₂e
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                per animal
              </p>
              <div
                style={{
                  backgroundColor: colors.cream,
                  padding: '4px 14px',
                  borderRadius: 16,
                  display: 'inline-block',
                  marginTop: spacing.sm,
                  fontSize: 13,
                  fontWeight: 500,
                  color: colors.textPrimary,
                }}
              >
                #{score.rank} in your cooperative
              </div>
            </div>
          </div>
        </Card>

        {/* Breakdown Card */}
        <Card>
          <h3
            style={{
              fontFamily: typography.fontFamily.heading,
              fontSize: typography.sizes.h3,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Emissions Breakdown
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
            }}
          >
            {Object.entries(score.breakdown).map(([key, value]) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              const emoji =
                breakdownEmojis[key as keyof typeof breakdownEmojis] || '📊';
              return (
                <div key={key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 14, color: colors.textSecondary }}>
                      {emoji} {label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {value}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      backgroundColor: colors.cream,
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${value}%`,
                        backgroundColor: gradeColor,
                        borderRadius: 4,
                        transition: 'width 1.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        {[
          { icon: '📋', label: 'Log Data', color: colors.primary },
          { icon: '✅', label: 'Verify', color: colors.secondary },
          { icon: '📊', label: 'Score', color: colors.sage },
          { icon: '🏷️', label: 'Get Badge', color: colors.info },
        ].map((item) => (
          <button
            key={item.label}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cream}`,
              borderRadius: 12,
              padding: spacing.md,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing.sm,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = item.color;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.cream;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span
              style={{
                fontSize: 14,
                color: colors.textPrimary,
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ===== RECOMMENDATIONS ===== */}
      <div>
        <h2
          style={{
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.sizes.h2,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          💡 Top Recommendations
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: spacing.lg,
          }}
        >
          {recommendations.map((rec, index) => (
            <Card key={index} hoverable>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  marginBottom: spacing.sm,
                }}
              >
                <span style={{ fontSize: 32 }}>{rec.icon}</span>
                <h4
                  style={{
                    fontFamily: typography.fontFamily.heading,
                    fontSize: typography.sizes.h3,
                    color: colors.textPrimary,
                  }}
                >
                  {rec.title}
                </h4>
              </div>
              <p
                style={{
                  fontSize: typography.sizes.body,
                  color: colors.textSecondary,
                  marginBottom: spacing.md,
                }}
              >
                {rec.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.primary,
                  }}
                >
                  💰 {rec.savings}
                </span>
                <Button size="small">Take Action</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
