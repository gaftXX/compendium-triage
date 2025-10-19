/**
 * Firestore Grid Data System
 * Manages Firestore data that determines rectangle properties and positions
 */

import { PositionCalculator, GridPosition } from '../positionCalculator/PositionCalculator';
import { ColorEngine, RectangleColor } from '../colorEngine/ColorEngine';

export interface FirestoreRectangleData {
  id: string;
  matrixRow: number;
  matrixCol: number;
  data: any;
  color?: string;
  priority: number;
  lastUpdated: Date;
}

export interface FirestoreGridConfig {
  collectionName: string;
  documentId: string;
  fieldMappings: {
    positionField: string;
    colorField: string;
    dataField: string;
    priorityField: string;
  };
}

export class FirestoreGridData {
  private positionCalculator: PositionCalculator;
  private colorEngine: ColorEngine;
  private gridData: Map<string, FirestoreRectangleData> = new Map();
  private config: FirestoreGridConfig;

  constructor(config: FirestoreGridConfig) {
    this.positionCalculator = new PositionCalculator();
    this.colorEngine = new ColorEngine();
    this.config = config;
  }

  /**
   * Load rectangle data from Firestore
   */
  async loadFromFirestore(): Promise<void> {
    try {
      // This would integrate with your existing Firebase services
      // const { getFirestoreData } = await import('../../renderer/src/services/firebase/firestore');
      // const data = await getFirestoreData(this.config.collectionName, this.config.documentId);
      
      // For now, simulate Firestore data
      const mockData = this.generateMockData();
      this.processFirestoreData(mockData);
    } catch (error) {
      console.error('Error loading Firestore grid data:', error);
      throw error;
    }
  }

  /**
   * Process Firestore data into grid format
   */
  private processFirestoreData(data: any[]): void {
    this.gridData.clear();
    
    data.forEach((item, index) => {
      const rectangleData: FirestoreRectangleData = {
        id: item.id || `firestore-${index}`,
        matrixRow: item[this.config.fieldMappings.positionField]?.row || 1,
        matrixCol: item[this.config.fieldMappings.positionField]?.col || 1,
        data: item[this.config.fieldMappings.dataField] || item,
        color: item[this.config.fieldMappings.colorField],
        priority: item[this.config.fieldMappings.priorityField] || 1,
        lastUpdated: new Date()
      };
      
      this.gridData.set(rectangleData.id, rectangleData);
    });
  }

  /**
   * Get rectangle data by position
   */
  getRectangleData(matrixRow: number, matrixCol: number): FirestoreRectangleData | null {
    for (const [id, data] of this.gridData) {
      if (data.matrixRow === matrixRow && data.matrixCol === matrixCol) {
        return data;
      }
    }
    return null;
  }

  /**
   * Get all rectangle data
   */
  getAllRectangleData(): FirestoreRectangleData[] {
    return Array.from(this.gridData.values());
  }

  /**
   * Get rectangle color based on Firestore data
   */
  getRectangleColor(matrixRow: number, matrixCol: number): RectangleColor {
    const data = this.getRectangleData(matrixRow, matrixCol);
    
    if (data && data.color) {
      return {
        position: `[${matrixRow},${matrixCol}]`,
        color: data.color,
        rule: 'firestore-data',
        intensity: 1.0
      };
    }
    
    // Fall back to color engine
    return this.colorEngine.getColor(matrixRow, matrixCol);
  }

  /**
   * Get rectangles that should be colored based on Firestore data
   */
  getColoredRectangles(): Array<{position: GridPosition, color: RectangleColor}> {
    const coloredRectangles: Array<{position: GridPosition, color: RectangleColor}> = [];
    
    for (const data of this.gridData.values()) {
      const position = this.positionCalculator.getPosition(data.matrixRow, data.matrixCol);
      const color = this.getRectangleColor(data.matrixRow, data.matrixCol);
      
      coloredRectangles.push({ position, color });
    }
    
    return coloredRectangles;
  }

  /**
   * Update rectangle data
   */
  updateRectangleData(id: string, updates: Partial<FirestoreRectangleData>): void {
    const existing = this.gridData.get(id);
    if (existing) {
      this.gridData.set(id, {
        ...existing,
        ...updates,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Add new rectangle data
   */
  addRectangleData(data: FirestoreRectangleData): void {
    this.gridData.set(data.id, data);
  }

  /**
   * Remove rectangle data
   */
  removeRectangleData(id: string): void {
    this.gridData.delete(id);
  }

  /**
   * Get rectangles by priority
   */
  getRectanglesByPriority(priority: number): FirestoreRectangleData[] {
    return Array.from(this.gridData.values())
      .filter(data => data.priority === priority)
      .sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());
  }

  /**
   * Generate mock data for development
   */
  private generateMockData(): any[] {
    return [
      {
        id: 'office-1',
        position: { row: 1, col: 1 },
        color: '#ff0000',
        data: { type: 'office', name: 'Main Office' },
        priority: 1
      },
      {
        id: 'project-1',
        position: { row: 5, col: 10 },
        color: '#00ff00',
        data: { type: 'project', name: 'Project Alpha' },
        priority: 2
      },
      {
        id: 'regulation-1',
        position: { row: 10, col: 15 },
        color: '#0000ff',
        data: { type: 'regulation', name: 'Building Code' },
        priority: 3
      }
    ];
  }

  /**
   * Get configuration
   */
  getConfig(): FirestoreGridConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FirestoreGridConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
