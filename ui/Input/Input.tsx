import React from 'react';
import { InputProps } from './Input.types';
import { useInput } from './useInput';

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  label,
  error,
  helperText,
  size = 'medium',
  variant = 'outlined',
  onChange,
  onFocus,
  onBlur,
  className = ''
}) => {
  const { handleFocus, handleBlur, handleChange, styles } = useInput({
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    required,
    disabled
  });

  return (
    <div className={className} style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: disabled ? '#6c757d' : '#333'
        }}>
          {label}
          {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        style={styles}
      />
      
      {(error || helperText) && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '12px',
          color: error ? '#dc3545' : '#6c757d'
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};
