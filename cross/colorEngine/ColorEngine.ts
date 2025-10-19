/**
 * Color Engine System
 * Determines colors for grid rectangles based on various factors
 */

export interface ColorRule {
  id: string;
  name: string;
  condition: (position: any) => boolean;
  color: string;
  priority: number;
}

export interface RectangleColor {
  position: string;
  color: string;
  rule: string;
  intensity: number;
}

export class ColorEngine {
  private colorRules: ColorRule[] = [];
  private defaultColor: string = '#000000';

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default color rules
   */
  private initializeDefaultRules() {
    // Grid lines rule
    this.addRule({
      id: 'grid-lines',
      name: 'Grid Lines',
      condition: () => true, // All rectangles get grid lines
      color: '#333333',
      priority: 1
    });

    // Onload animation rectangles rule - light blue
    this.addRule({
      id: 'onload-animation',
      name: 'OnLoad Animation Rectangles',
      condition: (pos) => this.isOnLoadAnimationRect(pos),
      color: '#C8EDFC', // Light blue
      priority: 0 // Highest priority - should override all other rules
    });

    // Corner rectangles rule
    this.addRule({
      id: 'corners',
      name: 'Corner Rectangles',
      condition: (pos) => this.isCorner(pos),
      color: '#666666',
      priority: 3
    });

    // Edge rectangles rule
    this.addRule({
      id: 'edges',
      name: 'Edge Rectangles',
      condition: (pos) => this.isEdge(pos),
      color: '#444444',
      priority: 4
    });
  }

  /**
   * Add a new color rule
   */
  addRule(rule: ColorRule) {
    this.colorRules.push(rule);
    this.colorRules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a color rule
   */
  removeRule(ruleId: string) {
    this.colorRules = this.colorRules.filter(rule => rule.id !== ruleId);
  }

  /**
   * Get color for a specific rectangle position
   */
  getColor(matrixRow: number, matrixCol: number): RectangleColor {
    const position = { matrixRow, matrixCol };
    
    // Find the highest priority rule that matches
    for (const rule of this.colorRules) {
      if (rule.condition(position)) {
        return {
          position: `[${matrixRow},${matrixCol}]`,
          color: rule.color,
          rule: rule.name,
          intensity: 1.0
        };
      }
    }

    return {
      position: `[${matrixRow},${matrixCol}]`,
      color: this.defaultColor,
      rule: 'default',
      intensity: 1.0
    };
  }

  /**
   * Get colors for multiple rectangles
   */
  getColors(positions: Array<{matrixRow: number, matrixCol: number}>): RectangleColor[] {
    return positions.map(pos => this.getColor(pos.matrixRow, pos.matrixCol));
  }

  /**
   * Check if position is a corner
   */
  private isCorner(position: {matrixRow: number, matrixCol: number}): boolean {
    const { matrixRow, matrixCol } = position;
    return (
      (matrixRow === 1 && matrixCol === 1) || // Bottom-left
      (matrixRow === 1 && matrixCol === 25) || // Bottom-right
      (matrixRow === 88 && matrixCol === 1) || // Top-left
      (matrixRow === 88 && matrixCol === 25)   // Top-right
    );
  }

  /**
   * Check if position is on an edge
   */
  private isEdge(position: {matrixRow: number, matrixCol: number}): boolean {
    const { matrixRow, matrixCol } = position;
    return (
      matrixRow === 1 || matrixRow === 88 || // Top or bottom edge
      matrixCol === 1 || matrixCol === 25     // Left or right edge
    );
  }

  /**
   * Check if position is part of onload animation area
   * Column 13, rows 66 to 22
   */
  private isOnLoadAnimationRect(position: {matrixRow: number, matrixCol: number}): boolean {
    const { matrixRow, matrixCol } = position;
    return (
      matrixCol === 13 && // Column 13
      matrixRow >= 22 && matrixRow <= 66 // Rows 22 to 66
    );
  }

  /**
   * Set default color
   */
  setDefaultColor(color: string) {
    this.defaultColor = color;
  }

  /**
   * Get all active rules
   */
  getRules(): ColorRule[] {
    return [...this.colorRules];
  }

  /**
   * Clear all rules except defaults
   */
  clearCustomRules() {
    this.colorRules = this.colorRules.filter(rule => 
      ['grid-lines', 'onload-animation', 'corners', 'edges'].includes(rule.id)
    );
  }
}
