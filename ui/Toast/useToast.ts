import { useCallback } from 'react';
import { ToastProps } from './Toast.types';

export const useToast = ({ onClose, duration = 3000 }: ToastProps) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const getToastStyles = (type: string) => {
    const typeStyles = {
      success: { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' },
      error: { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' },
      warning: { backgroundColor: '#fff3cd', color: '#856404', borderColor: '#ffeaa7' },
      info: { backgroundColor: '#d1ecf1', color: '#0c5460', borderColor: '#bee5eb' }
    };

    return {
      padding: '12px 16px',
      borderRadius: '4px',
      border: '1px solid',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '300px',
      maxWidth: '500px',
      ...typeStyles[type as keyof typeof typeStyles]
    };
  };

  return {
    handleClose,
    getToastStyles
  };
};
