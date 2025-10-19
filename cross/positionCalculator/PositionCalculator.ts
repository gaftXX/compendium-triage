/**
 * Position Calculator System
 * Calculates positions and coordinates for grid rectangles
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
  private readonly windowWidth: number = 1200;
  private readonly windowHeight: number = 704;
  private readonly rectWidth: number = 48;   // ENFORCED: Exact 48px width
  private readonly rectHeight: number = 8;  // ENFORCED: Exact 8px height
  private readonly totalRows: number = 88;   // ENFORCED: Maximum 88 rows
  private readonly totalCols: number = 25;   // ENFORCED: Maximum 25 columns

  /**
   * Get position for a single rectangle by matrix coordinates
   */
  getPosition(matrixRow: number, matrixCol: number): GridPosition {
    // ENFORCED grid boundaries validation
    if (matrixRow < 1 || matrixRow > this.totalRows) {
      throw new Error(`Invalid row: ${matrixRow}. Grid is limited to [1,88]`);
    }
    if (matrixCol < 1 || matrixCol > this.totalCols) {
      throw new Error(`Invalid column: ${matrixCol}. Grid is limited to [1,25]`);
    }

    // ENFORCED exact positioning calculations
    const screenX = (matrixCol - 1) * this.rectWidth;  // EXACT: (col-1) * 48
    const screenY = (this.totalRows - matrixRow) * this.rectHeight;  // EXACT: (88-row) * 8

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
      throw new Error(`Invalid row range: [${startRow},${endRow}]. Grid is limited to [1,88]`);
    }
    if (startCol < 1 || startCol > this.totalCols || endCol < 1 || endCol > this.totalCols) {
      throw new Error(`Invalid column range: [${startCol},${endCol}]. Grid is limited to [1,25]`);
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
      throw new Error(`Invalid row range: [${startRow},${endRow}]. Grid is limited to [1,88]`);
    }
    if (startCol < 1 || startCol > this.totalCols || endCol < 1 || endCol > this.totalCols) {
      throw new Error(`Invalid column range: [${startCol},${endCol}]. Grid is limited to [1,25]`);
    }
    if (startRow > endRow || startCol > endCol) {
      throw new Error(`Invalid bounds: start must be <= end`);
    }

    const rowSpan = endRow - startRow + 1;
    const colSpan = endCol - startCol + 1;
    
    // ENFORCED exact dimensions
    return {
      width: colSpan * this.rectWidth,   // EXACT: colSpan * 48
      height: rowSpan * this.rectHeight, // EXACT: rowSpan * 8
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
      throw new Error(`Invalid row range: [${startRow},${endRow}]. Grid is limited to [1,88]`);
    }
    if (startCol < 1 || startCol > this.totalCols || endCol < 1 || endCol > this.totalCols) {
      throw new Error(`Invalid column range: [${startCol},${endCol}]. Grid is limited to [1,25]`);
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
}
