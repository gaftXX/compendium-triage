export interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: FormData) => void;
  className?: string;
}

export interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}
