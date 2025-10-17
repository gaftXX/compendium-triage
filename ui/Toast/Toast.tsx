import React, { useEffect } from 'react';
import { ToastProps } from './Toast.types';
import { useToast } from './useToast';

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right'
}) => {
  const { handleClose, getToastStyles } = useToast({ onClose, duration });

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <div style={getToastStyles(type)}>
      <span>{message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0',
          marginLeft: '12px'
        }}
      >
        ×
      </button>
    </div>
  );
};
