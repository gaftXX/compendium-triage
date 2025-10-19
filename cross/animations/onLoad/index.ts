import { OnLoadAnimation, OnLoadAnimationManager } from './Animation';
import { AnimationFrame } from './Animation';
import { ColorEngine } from '../../colorEngine/ColorEngine';

export { OnLoadAnimation, OnLoadAnimationManager, ColorEngine };
export type { AnimationFrame };

/**
 * Animation Trigger Logic
 * Controls when animations should start (app start, reload, etc.)
 */
export class AnimationTrigger {
  private static manager: OnLoadAnimationManager | null = null;
  private static isInitialized: boolean = false;

  /**
   * Initialize animation system
   * Called when app starts or reloads
   */
  static initialize(): OnLoadAnimationManager {
    if (!this.isInitialized) {
      this.manager = new OnLoadAnimationManager();
      this.isInitialized = true;
    }
    return this.manager!;
  }

  /**
   * Start onload animation
   * Triggers when app starts or reloads
   */
  static startOnLoadAnimation(): void {
    const manager = this.initialize();
    manager.startOnLoadAnimation();
  }

  /**
   * Stop onload animation
   */
  static stopOnLoadAnimation(): void {
    if (this.manager) {
      this.manager.stopOnLoadAnimation();
    }
  }

  /**
   * Add animation listener
   */
  static addAnimationListener(listener: (frames: AnimationFrame[]) => void): void {
    const manager = this.initialize();
    manager.addAnimationListener(listener);
  }

  /**
   * Remove animation listener
   */
  static removeAnimationListener(listener: (frames: AnimationFrame[]) => void): void {
    if (this.manager) {
      this.manager.removeAnimationListener(listener);
    }
  }

  /**
   * Get animation status
   */
  static getAnimationStatus() {
    return this.manager ? {
      isInitialized: this.isInitialized,
      isPlaying: this.manager['isPlaying']
    } : {
      isInitialized: false,
      isPlaying: false
    };
  }
}
