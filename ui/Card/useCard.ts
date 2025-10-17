import { useState } from 'react';
import { CardProps, CardState } from './Card.types';

export const useCard = ({ hover = false, onClick }: CardProps) => {
  const [state, setState] = useState<CardState>({
    isHovered: false
  });

  const handleMouseEnter = () => {
    if (hover) {
      setState(prev => ({ ...prev, isHovered: true }));
    }
  };

  const handleMouseLeave = () => {
    if (hover) {
      setState(prev => ({ ...prev, isHovered: false }));
    }
  };

  const handleClick = () => {
    onClick?.();
  };

  const getStyles = () => {
    const baseStyles = {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      transition: 'all 0.2s ease',
      cursor: onClick ? 'pointer' : 'default'
    };

    const variantStyles = {
      default: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      outlined: {
        border: '1px solid #ddd',
        boxShadow: 'none'
      },
      elevated: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
      }
    };

    const hoverStyles = state.isHovered ? {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    } : {};

    return {
      ...baseStyles,
      ...variantStyles,
      ...hoverStyles
    };
  };

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    isHovered: state.isHovered,
    styles: getStyles()
  };
};
