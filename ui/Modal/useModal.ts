import { useCallback } from 'react';
import { ModalProps } from './Modal.types';

export const useModal = ({ 
  isOpen, 
  onClose, 
  closeOnOverlayClick = true 
}: ModalProps) => {
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const getOverlayStyles = () => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.2s ease'
  });

  const getModalStyles = (size: string) => {
    const sizeMap = {
      small: { width: '400px', maxWidth: '90vw' },
      medium: { width: '600px', maxWidth: '90vw' },
      large: { width: '800px', maxWidth: '90vw' },
      full: { width: '95vw', height: '95vh' }
    };

    return {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxHeight: '90vh',
      overflow: 'auto',
      ...sizeMap[size as keyof typeof sizeMap]
    };
  };

  return {
    handleOverlayClick,
    handleClose,
    getOverlayStyles,
    getModalStyles
  };
};
