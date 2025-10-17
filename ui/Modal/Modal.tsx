import React from 'react';
import { ModalProps } from './Modal.types';
import { useModal } from './useModal';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = ''
}) => {
  const { handleOverlayClick, handleClose, getOverlayStyles, getModalStyles } = useModal({
    isOpen,
    onClose,
    closeOnOverlayClick
  });

  if (!isOpen) return null;

  return (
    <div 
      className={className}
      style={getOverlayStyles()}
      onClick={handleOverlayClick}
    >
      <div style={getModalStyles(size)}>
        {(title || showCloseButton) && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #eee'
          }}>
            {title && (
              <h2 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#333'
              }}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};
