import { useCallback } from 'react';
import { FormProps } from './Form.types';

export const useForm = ({ onSubmit }: FormProps) => {
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    onSubmit(formData);
  }, [onSubmit]);

  return {
    handleSubmit
  };
};
