import React from 'react';
import { DropdownProps } from './Dropdown.types';
import { useDropdown } from './useDropdown';

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  disabled = false,
  label,
  error,
  onChange,
  className = ''
}) => {
  const { isOpen, handleToggle, handleSelect, handleClose } = useDropdown({
    value,
    onChange,
    disabled
  });

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={className} style={{ position: 'relative', marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: disabled ? '#6c757d' : '#333'
        }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: disabled ? '#f5f5f5' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            fontSize: '14px'
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </button>
        
        {isOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1
              }}
              onClick={handleClose}
            />
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                zIndex: 2,
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: option.disabled ? '#f5f5f5' : 'transparent',
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    color: option.disabled ? '#6c757d' : '#333'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '12px',
          color: '#dc3545'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
