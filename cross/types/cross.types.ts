// Cross UI Types

export interface CrossState {
  isActive: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isTyping: boolean;
  inputValue: string;
}

export interface CrossAnimationState {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
}

export interface CrossProps {
  className?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}
