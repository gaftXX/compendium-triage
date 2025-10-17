import React from 'react';
import { FormProps, FormFieldProps } from './Form.types';
import { useForm } from './useForm';

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = ''
}) => {
  const { handleSubmit } = useForm({ onSubmit });

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required = false,
  children
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '4px', 
        fontSize: '14px', 
        fontWeight: '500',
        color: '#333'
      }}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
      </label>
      {children}
    </div>
  );
};
