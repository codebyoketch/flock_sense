// src/components/Card.tsx
import React from 'react';
import { royalFlockTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: keyof typeof royalFlockTheme.spacing;
}

export default function Card({
  children,
  style,
  className = '',
  onClick,
  hoverable = false,
  padding = 'lg',
}: CardProps) {
  const { colors, borderRadius, spacing, shadows } = royalFlockTheme;
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[padding],
    boxShadow: shadows.card.boxShadow,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    transform: isHovered && hoverable ? 'translateY(-4px)' : 'none',
    boxShadow: isHovered && hoverable ? shadows.elevated?.boxShadow || shadows.card.boxShadow : shadows.card.boxShadow,
    ...style,
  };

  return (
    <div
      className={`fade-in ${className}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}