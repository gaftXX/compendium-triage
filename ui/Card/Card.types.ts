export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'small' | 'medium' | 'large';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface CardState {
  isHovered: boolean;
}
