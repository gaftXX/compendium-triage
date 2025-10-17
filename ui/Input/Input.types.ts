export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export interface InputState {
  isFocused: boolean;
  hasValue: boolean;
  isValid: boolean;
}
