import { useState } from 'react';
import { ButtonProps, ButtonState } from './Button.types';

export const useButton = ({ variant = 'primary', onClick, disabled = false, loading = false }: ButtonProps) => {
  const [state, setState] = useState<ButtonState>({
    isLoading: loading,
    isPressed: false
  });

  const handleClick = async () => {
    if (disabled || state.isLoading) return;
    
    setState(prev => ({ ...prev, isPressed: true }));
    
    try {
      if (onClick) {
        await onClick();
      }
    } finally {
      setState(prev => ({ ...prev, isPressed: false }));
    }
  };

  const getStyles = () => {
    const baseStyles = {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: disabled || state.isLoading ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.6 : 1
    };

    const variantStyles = {
      primary: {
        backgroundColor: '#007bff',
        color: 'white',
        '&:hover': {
          backgroundColor: '#0056b3'
        }
      },
      secondary: {
        backgroundColor: '#6c757d',
        color: 'white',
        '&:hover': {
          backgroundColor: '#545b62'
        }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#007bff',
        border: '1px solid #007bff',
        '&:hover': {
          backgroundColor: '#f8f9fa'
        }
      },
      danger: {
        backgroundColor: '#dc3545',
        color: 'white',
        '&:hover': {
          backgroundColor: '#c82333'
        }
      }
    };

    return {
      ...baseStyles,
      ...variantStyles[variant]
    };
  };

  return {
    handleClick,
    isLoading: state.isLoading,
    isPressed: state.isPressed,
    styles: getStyles()
  };
};
