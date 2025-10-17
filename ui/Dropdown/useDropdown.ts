import { useState, useCallback } from 'react';
import { DropdownProps } from './Dropdown.types';

export const useDropdown = ({ value, onChange, disabled = false }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  }, [disabled]);

  const handleSelect = useCallback((selectedValue: string) => {
    onChange?.(selectedValue);
    setIsOpen(false);
  }, [onChange]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    handleToggle,
    handleSelect,
    handleClose
  };
};
