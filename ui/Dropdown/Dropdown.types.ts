export interface DropdownProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
  className?: string;
}
