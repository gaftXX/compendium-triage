import { ColorEngine } from '../../colorEngine/ColorEngine';

export interface AnimationFrame {
  matrixRow: number;
  matrixCol: number;
  color: string;
  opacity: number;
  timestamp: number;
}

export class OnLoadAnimation {
  private static colorEngine = new ColorEngine();

  static createOnLoadAnimation(): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    
    const coordinates: [number, number][] = [
      [13, 66], [13, 65], [13, 64], [13, 63], [13, 62], [13, 61], [13, 60], [13, 59], [13, 58], [13, 57],
      [13, 56], [13, 55], [13, 54], [13, 53], [13, 52], [13, 51], [13, 50], [13, 49], [13, 48], [13, 47],
      [13, 46], [13, 45], [13, 44], [13, 43], [13, 42], [13, 41], [13, 40], [13, 39], [13, 38], [13, 37],
      [13, 36], [13, 35], [13, 34], [13, 33], [13, 32], [13, 31], [13, 30], [13, 29], [13, 28], [13, 27],
      [13, 26], [13, 25], [13, 24], [13, 23], [13, 22]
    ];
    
    for (let wave = 0; wave < 4; wave++) {
      const waveStart = wave * 1800; // Faster waves (was 4500)
      
      coordinates.forEach(([col, row], i) => {
        const colorInfo = this.colorEngine.getColor(row, col);
        console.log(`Animation color for [${row},${col}]:`, colorInfo.color, 'Rule:', colorInfo.rule);
        frames.push({
          matrixRow: row,
          matrixCol: col,
          color: colorInfo.color, // Color from Color Engine
          opacity: 1,
          timestamp: waveStart + (i * 20) // Faster switching (was 50ms)
        });
      });
      
      coordinates.slice().reverse().forEach(([col, row], i) => {
        const colorInfo = this.colorEngine.getColor(row, col);
        console.log(`Animation color for [${row},${col}]:`, colorInfo.color, 'Rule:', colorInfo.rule);
        frames.push({
          matrixRow: row,
          matrixCol: col,
          color: colorInfo.color, // Color from Color Engine
          opacity: 1,
          timestamp: waveStart + 900 + (i * 20) // Faster switching (was 2250ms, 50ms)
        });
      });
    }

    return frames;
  }
}

export class OnLoadAnimationManager {
  private colorEngine = new ColorEngine();
  private isPlaying = false;
  private animationFrames = OnLoadAnimation.createOnLoadAnimation();
  private listeners: Array<(frames: AnimationFrame[]) => void> = [];
  private animationId: number | null = null;

  constructor() {}

  startOnLoadAnimation(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.animate();
    }
  }

  stopOnLoadAnimation(): void {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = (): void => {
    if (!this.isPlaying) return;
    const currentTime = performance.now();
    const currentFrame = this.animationFrames.find(frame => 
      frame.timestamp <= currentTime && frame.timestamp > currentTime - 50
    );
    const framesToSend = currentFrame ? [currentFrame] : [];
    this.listeners.forEach(listener => listener(framesToSend));
    this.animationId = requestAnimationFrame(this.animate);
  };

  addAnimationListener(listener: (frames: AnimationFrame[]) => void): void {
    this.listeners.push(listener);
  }

  removeAnimationListener(listener: (frames: AnimationFrame[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  getColorEngine(): ColorEngine {
    return this.colorEngine;
  }
}
