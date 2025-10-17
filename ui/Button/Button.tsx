import React from 'react';
import { ButtonProps } from './Button.types';
import { useButton } from './useButton';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const { handleClick, isLoading, styles } = useButton({
    variant,
    onClick,
    disabled,
    loading
  });

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
      style={styles}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
