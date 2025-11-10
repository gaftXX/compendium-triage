const STYLE_ID = 'ai-orchestra-pulse-animation';

const animationCss = `
@keyframes aiOrchestraPulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

.ai-orchestra-pulse-cell {
  animation: aiOrchestraPulse 1.1s ease-in-out infinite;
}
`;

export function ensureAiOrchestraPulseAnimation(): void {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.innerHTML = animationCss;
  document.head.appendChild(styleEl);
}

