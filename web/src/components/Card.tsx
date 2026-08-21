// src/components/Card.tsx
import React from 'react';
import { royalFlockTheme } from '../theme/index';

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
  const { colors, spacing } = royalFlockTheme;
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing[padding] || spacing.lg,
    border: `1px solid ${colors.cream}`,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    transform: isHovered && hoverable ? 'translateY(-4px)' : 'none',
    // Use a single boxShadow property
    boxShadow: isHovered && hoverable 
      ? '0 8px 32px rgba(0,0,0,0.10)' 
      : '0 2px 12px rgba(0,0,0,0.06)',
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
