/**
 * Color Engine System
 * Manages colors for grid rectangles based on various rules and patterns
 * 
 * ENFORCEMENT: All animations must follow color engine rules
 * - Animation rectangles: Light blue (#C8EDFC) only
 * - No white rectangles allowed in animations
 * - Grid lines: #333333
 * - Corners: #666666, Edges: #444444
 */

export interface RectangleColor {
  position: string;
  color: string;
  rule: string;
  intensity: number;
}

export interface ColorRule {
  name: string;
  pattern: (row: number, col: number) => boolean;
  color: string;
  intensity: number;
}

export class ColorEngine {
  private colorRules: ColorRule[] = [];
  private defaultColor: string = '#C8EDFC'; // Light blue for animations
  private gridLineColor: string = '#333333';
  private cornerColor: string = '#666666';
  private edgeColor: string = '#444444';

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default color rules
   */
  private initializeDefaultRules(): void {
    this.colorRules = [
      {
        name: 'animation-default',
        pattern: () => true, // All rectangles get this by default
        color: this.defaultColor,
        intensity: 1.0
      },
      {
        name: 'grid-lines',
        pattern: (row, col) => row === 0 || col === 0,
        color: this.gridLineColor,
        intensity: 1.0
      },
      {
        name: 'corners',
        pattern: (row, col) => (row === 0 && col === 0) || (row === 0 && col > 0) || (row > 0 && col === 0),
        color: this.cornerColor,
        intensity: 1.0
      },
      {
        name: 'edges',
        pattern: (row, col) => row === 1 || col === 1,
        color: this.edgeColor,
        intensity: 0.8
      }
    ];
  }

  /**
   * Get color for a rectangle at given position
   */
  getColor(matrixRow: number, matrixCol: number): RectangleColor {
    // Find the first matching rule
    for (const rule of this.colorRules) {
      if (rule.pattern(matrixRow, matrixCol)) {
        return {
          position: `[${matrixRow},${matrixCol}]`,
          color: rule.color,
          rule: rule.name,
          intensity: rule.intensity
        };
      }
    }

    // Fallback to default
    return {
      position: `[${matrixRow},${matrixCol}]`,
      color: this.defaultColor,
      rule: 'default',
      intensity: 1.0
    };
  }

  /**
   * Add a custom color rule
   */
  addColorRule(rule: ColorRule): void {
    this.colorRules.unshift(rule); // Add to beginning for priority
  }

  /**
   * Remove a color rule by name
   */
  removeColorRule(ruleName: string): void {
    this.colorRules = this.colorRules.filter(rule => rule.name !== ruleName);
  }

  /**
   * Get all color rules
   */
  getColorRules(): ColorRule[] {
    return [...this.colorRules];
  }

  /**
   * Get default colors
   */
  getDefaultColors(): {
    default: string;
    gridLine: string;
    corner: string;
    edge: string;
  } {
    return {
      default: this.defaultColor,
      gridLine: this.gridLineColor,
      corner: this.cornerColor,
      edge: this.edgeColor
    };
  }

  /**
   * Update default colors
   */
  updateDefaultColors(colors: Partial<{
    default: string;
    gridLine: string;
    corner: string;
    edge: string;
  }>): void {
    if (colors.default) this.defaultColor = colors.default;
    if (colors.gridLine) this.gridLineColor = colors.gridLine;
    if (colors.corner) this.cornerColor = colors.corner;
    if (colors.edge) this.edgeColor = colors.edge;
    
    // Reinitialize rules with new colors
    this.initializeDefaultRules();
  }

  /**
   * Generate color palette for a grid
   */
  generateGridColors(rows: number, cols: number): RectangleColor[][] {
    const grid: RectangleColor[][] = [];
    
    for (let row = 0; row < rows; row++) {
      const rowColors: RectangleColor[] = [];
      for (let col = 0; col < cols; col++) {
        rowColors.push(this.getColor(row, col));
      }
      grid.push(rowColors);
    }
    
    return grid;
  }

  /**
   * Check if a color is valid for animations
   */
  isValidAnimationColor(color: string): boolean {
    return color === this.defaultColor; // Only light blue allowed
  }

  /**
   * Get color intensity based on position
   */
  getColorIntensity(matrixRow: number, matrixCol: number): number {
    const color = this.getColor(matrixRow, matrixCol);
    return color.intensity;
  }
}
