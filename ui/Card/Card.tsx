import React from 'react';
import { CardProps } from './Card.types';
import { useCard } from './useCard';

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'medium',
  hover = false,
  onClick,
  className = ''
}) => {
  const { handleMouseEnter, handleMouseLeave, handleClick, styles } = useCard({
    hover,
    onClick
  });

  return (
    <div
      className={className}
      style={styles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: '12px' }}>
          {title && (
            <h3 style={{ 
              margin: '0 0 4px 0', 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#333'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: '#666'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};
