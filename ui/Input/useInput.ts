import { useState, useCallback } from 'react';
import { InputProps, InputState } from './Input.types';

export const useInput = ({ 
  value, 
  defaultValue, 
  onChange, 
  onFocus, 
  onBlur, 
  required = false,
  disabled = false 
}: InputProps) => {
  const [state, setState] = useState<InputState>({
    isFocused: false,
    hasValue: Boolean(defaultValue || value),
    isValid: true
  });

  const handleFocus = useCallback(() => {
    if (disabled) return;
    
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.();
  }, [disabled, onFocus]);

  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: false }));
    onBlur?.();
  }, [onBlur]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = event.target.value;
    setState(prev => ({ 
      ...prev, 
      hasValue: Boolean(newValue),
      isValid: !required || Boolean(newValue)
    }));
    
    onChange?.(newValue);
  }, [disabled, onChange, required]);

  const getStyles = () => {
    const baseStyles = {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      backgroundColor: disabled ? '#f5f5f5' : 'white',
      cursor: disabled ? 'not-allowed' : 'text'
    };

    const focusStyles = state.isFocused ? {
      borderColor: '#007bff',
      boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)'
    } : {};

    const errorStyles = !state.isValid ? {
      borderColor: '#dc3545',
      boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.25)'
    } : {};

    return {
      ...baseStyles,
      ...focusStyles,
      ...errorStyles
    };
  };

  return {
    handleFocus,
    handleBlur,
    handleChange,
    isFocused: state.isFocused,
    hasValue: state.hasValue,
    isValid: state.isValid,
    styles: getStyles()
  };
};
