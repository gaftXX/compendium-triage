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
   * Get color engine rules (kept for reference)
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
}
