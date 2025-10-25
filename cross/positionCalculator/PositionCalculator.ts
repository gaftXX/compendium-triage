/**
 * Position Calculator System
 * Calculates positions and coordinates for grid rectangles
 * 
 * ENFORCEMENT: All animations must follow color engine rules
 * - Animation rectangles: Light blue (#C8EDFC) only
 * - No white rectangles allowed in animations
 * - Grid lines: #333333
 * - Corners: #666666, Edges: #444444
 */

export interface GridPosition {
  matrixRow: number;
  matrixCol: number;
  matrixCoords: string;
  screenX: number;
  screenY: number;
  width: number;
  height: number;
}

export interface GridBounds {
  topLeft: GridPosition;
  topRight: GridPosition;
  bottomLeft: GridPosition;
  bottomRight: GridPosition;
}

export class PositionCalculator {
  private readonly windowWidth: number = window.innerWidth;
  private readonly windowHeight: number = window.innerHeight;
  private readonly rectWidth: number = 40;   // ENFORCED: Exact 40px width (matches Cross.tsx)
  private readonly rectHeight: number = 4;  // ENFORCED: Exact 4px height (matches Cross.tsx)
  private readonly totalRows: number = Math.floor(this.windowHeight / this.rectHeight);   // Computed rows to avoid partial rectangles
  private readonly totalCols: number = 31;   // ENFORCED: Maximum 31 columns (matches Cross.tsx)
  
  // ENFORCED: Color engine rules for animations
  private readonly ANIMATION_COLOR = '#C8EDFC'; // Light blue - ONLY allowed animation color
  private readonly GRID_COLOR = '#333333';      // Grid lines
  private readonly CORNER_COLOR = '#666666';    // Corner rectangles
  private readonly EDGE_COLOR = '#444444';     // Edge rectangles

  /**
   * Get position for a single rectangle by matrix coordinates
   */
  getPosition(matrixRow: number, matrixCol: number): GridPosition {
    // ENFORCED grid boundaries validation
    if (matrixRow < 1 || matrixRow > this.totalRows) {
      throw new Error(`Invalid row: ${matrixRow}. Grid is limited to [1,${this.totalRows}]`);
    }
    if (matrixCol < 1 || matrixCol > this.totalCols) {
      throw new Error(`Invalid column: ${matrixCol}. Grid is limited to [1,31]`);
    }

    // ENFORCED exact positioning calculations
    const screenX = (matrixCol - 1) * this.rectWidth;  // EXACT: (col-1) * 40
    const screenY = (this.totalRows - matrixRow) * this.rectHeight;  // EXACT: (rows-row) * 4

    return {
      matrixRow,
      matrixCol,
      matrixCoords: `[${matrixRow},${matrixCol}]`,
      screenX,
      screenY,
      width: this.rectWidth,
      height: this.rectHeight
    };
  }

  /**
   * Get bounds for a multi-rectangle component
   */
  getBounds(startRow: number, startCol: number, endRow: number, endCol: number): GridBounds {
    // ENFORCED boundary validation for multi-rectangle components
    if (startRow < 1 || startRow > this.totalRows || endRow < 1 || endRow > this.totalRows) {
      throw new Error(`Invalid row range: [${startRow},${endRow}]. Grid is limited to [1,${this.totalRows}]`);
    }
    if (startCol < 1 || startCol > this.totalCols || endCol < 1 || endCol > this.totalCols) {
      throw new Error(`Invalid column range: [${startCol},${endCol}]. Grid is limited to [1,31]`);
    }
    if (startRow > endRow || startCol > endCol) {
      throw new Error(`Invalid bounds: start must be <= end`);
    }

    return {
      topLeft: this.getPosition(startRow, startCol),
      topRight: this.getPosition(startRow, endCol),
      bottomLeft: this.getPosition(endRow, startCol),
      bottomRight: this.getPosition(endRow, endCol)
    };
  }

  /**
   * Calculate total width and height for a multi-rectangle component
   */
  getComponentDimensions(startRow: number, startCol: number, endRow: number, endCol: number) {
    // ENFORCED boundary validation
    if (startRow < 1 || startRow > this.totalRows || endRow < 1 || endRow > this.totalRows) {
      throw new Error(`Invalid row range: [${startRow},${endRow}]. Grid is limited to [1,${this.totalRows}]`);
    }
    if (startCol < 1 || startCol > this.totalCols || endCol < 1 || endCol > this.totalCols) {
      throw new Error(`Invalid column range: [${startCol},${endCol}]. Grid is limited to [1,31]`);
    }
    if (startRow > endRow || startCol > endCol) {
      throw new Error(`Invalid bounds: start must be <= end`);
    }

    const rowSpan = endRow - startRow + 1;
    const colSpan = endCol - startCol + 1;
    
    // ENFORCED exact dimensions
    return {
      width: colSpan * this.rectWidth,   // EXACT: colSpan * 40
      height: rowSpan * this.rectHeight, // EXACT: rowSpan * 4
      rowSpan,
      colSpan
    };
  }

  /**
   * Get all positions within a rectangular area
   */
  getAreaPositions(startRow: number, startCol: number, endRow: number, endCol: number): GridPosition[] {
    // ENFORCED boundary validation
    if (startRow < 1 || startRow > this.totalRows || endRow < 1 || endRow > this.totalRows) {
      throw new Error(`Invalid row range: [${startRow},${endRow}]. Grid is limited to [1,${this.totalRows}]`);
    }
    if (startCol < 1 || startCol > this.totalCols || endCol < 1 || endCol > this.totalCols) {
      throw new Error(`Invalid column range: [${startCol},${endCol}]. Grid is limited to [1,31]`);
    }
    if (startRow > endRow || startCol > endCol) {
      throw new Error(`Invalid bounds: start must be <= end`);
    }

    const positions: GridPosition[] = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        positions.push(this.getPosition(row, col));
      }
    }
    
    return positions;
  }

  /**
   * Check if coordinates are valid
   */
  isValidPosition(matrixRow: number, matrixCol: number): boolean {
    // ENFORCED grid boundary validation
    return matrixRow >= 1 && matrixRow <= this.totalRows && 
           matrixCol >= 1 && matrixCol <= this.totalCols;
  }

  /**
   * Get grid dimensions
   */
  getGridInfo() {
    return {
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight,
      rectWidth: this.rectWidth,
      rectHeight: this.rectHeight,
      totalRows: this.totalRows,
      totalCols: this.totalCols,
      totalRectangles: this.totalRows * this.totalCols
    };
  }

  /**
   * ENFORCEMENT: Validate animation color follows color engine rules
   * Throws error if animation uses invalid colors
   */
  validateAnimationColor(color: string, animationType: string): void {
    // ENFORCED: Only light blue (#C8EDFC) allowed for animations
    if (color !== this.ANIMATION_COLOR) {
      throw new Error(`Animation color enforcement violation: ${animationType} animation attempted to use color '${color}'. Only light blue (#C8EDFC) is allowed for animations.`);
    }
  }

  /**
   * ENFORCEMENT: Validate animation frame follows color engine rules
   * Throws error if animation frame uses invalid colors
   */
  validateAnimationFrame(frame: { matrixRow: number; matrixCol: number; color: string; opacity: number; timestamp: number }, animationType: string): void {
    // ENFORCED: Only light blue (#C8EDFC) allowed for animations
    if (frame.color !== this.ANIMATION_COLOR) {
      throw new Error(`Animation frame enforcement violation: ${animationType} animation frame at [${frame.matrixRow},${frame.matrixCol}] attempted to use color '${frame.color}'. Only light blue (#C8EDFC) is allowed for animations.`);
    }
    
    // ENFORCED: No white rectangles allowed (additional safety check)
    const normalizedColor = frame.color?.toUpperCase?.() ?? frame.color;
    if (normalizedColor === '#FFFFFF' || normalizedColor === 'WHITE') {
      throw new Error(`Animation frame enforcement violation: ${animationType} animation frame at [${frame.matrixRow},${frame.matrixCol}] attempted to use white color. White rectangles are not allowed in animations.`);
    }
  }

  /**
   * ENFORCEMENT: Validate entire animation follows color engine rules
   * Throws error if any frame uses invalid colors
   */
  validateAnimation(frames: Array<{ matrixRow: number; matrixCol: number; color: string; opacity: number; timestamp: number }>, animationType: string): void {
    frames.forEach((frame, index) => {
      try {
        this.validateAnimationFrame(frame, animationType);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Animation validation failed at frame ${index}: ${errorMessage}`);
      }
    });
  }

  /**
   * ENFORCEMENT: Create animation frame with enforced color
   * Returns animation frame with guaranteed light blue color
   */
  createEnforcedAnimationFrame(matrixRow: number, matrixCol: number, opacity: number, timestamp: number): { matrixRow: number; matrixCol: number; color: string; opacity: number; timestamp: number } {
    return {
      matrixRow,
      matrixCol,
      color: this.ANIMATION_COLOR, // ENFORCED: Light blue only
      opacity,
      timestamp
    };
  }

  /**
   * ENFORCEMENT: Get enforced animation color
   * Returns the only allowed animation color
   */
  getEnforcedAnimationColor(): string {
    return this.ANIMATION_COLOR;
  }

  /**
   * ENFORCEMENT: Check if color is allowed for animations
   */
  isAllowedAnimationColor(color: string): boolean {
    return color === this.ANIMATION_COLOR;
  }

  /**
   * ENFORCEMENT: Get all color engine rules
   */
  getColorEngineRules() {
    return {
      animationColor: this.ANIMATION_COLOR,
      gridColor: this.GRID_COLOR,
      cornerColor: this.CORNER_COLOR,
      edgeColor: this.EDGE_COLOR,
      rules: [
        'Animation rectangles must use light blue (#C8EDFC) only',
        'No white rectangles allowed in animations',
        'Grid lines use #333333',
        'Corner rectangles use #666666',
        'Edge rectangles use #444444'
      ]
    };
  }

  /**
   * ENFORCEMENT: Static method to validate any animation
   * Use this in any animation class to enforce color rules
   */
  static validateAnimationEnforcement(frames: Array<{ matrixRow: number; matrixCol: number; color: string; opacity: number; timestamp: number }>, animationType: string): void {
    const calculator = new PositionCalculator();
    calculator.validateAnimation(frames, animationType);
  }

  /**
   * ENFORCEMENT: Static method to create enforced animation frame
   * Use this in any animation class to create compliant frames
   */
  static createEnforcedFrame(matrixRow: number, matrixCol: number, opacity: number, timestamp: number): { matrixRow: number; matrixCol: number; color: string; opacity: number; timestamp: number } {
    const calculator = new PositionCalculator();
    return calculator.createEnforcedAnimationFrame(matrixRow, matrixCol, opacity, timestamp);
  }

  /**
   * ENFORCEMENT: Static method to get enforced animation color
   * Use this in any animation class to get the only allowed color
   */
  static getEnforcedAnimationColor(): string {
    const calculator = new PositionCalculator();
    return calculator.getEnforcedAnimationColor();
  }
}
