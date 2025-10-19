/**
 * Grid Data Mapper System
 * Maps Firestore data to grid rectangles and vice versa
 */

import { FirestoreGridData, FirestoreRectangleData } from './FirestoreGridData';
import { PositionCalculator, GridPosition } from '../positionCalculator/PositionCalculator';

export interface DataMapping {
  firestoreField: string;
  gridProperty: string;
  transform?: (value: any) => any;
}

export interface GridDataMapping {
  collection: string;
  documentId: string;
  mappings: DataMapping[];
  filters?: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in';
    value: any;
  }[];
}

export class GridDataMapper {
  private firestoreGridData: FirestoreGridData;
  private positionCalculator: PositionCalculator;
  private mappings: Map<string, GridDataMapping> = new Map();

  constructor(firestoreGridData: FirestoreGridData) {
    this.firestoreGridData = firestoreGridData;
    this.positionCalculator = new PositionCalculator();
  }

  /**
   * Add a data mapping configuration
   */
  addMapping(key: string, mapping: GridDataMapping): void {
    this.mappings.set(key, mapping);
  }

  /**
   * Map Firestore data to grid rectangles
   */
  async mapFirestoreToGrid(mappingKey: string): Promise<FirestoreRectangleData[]> {
    const mapping = this.mappings.get(mappingKey);
    if (!mapping) {
      throw new Error(`Mapping not found: ${mappingKey}`);
    }

    try {
      // This would integrate with your existing Firebase services
      // const { getFirestoreData } = await import('../../renderer/src/services/firebase/firestore');
      // const firestoreData = await getFirestoreData(mapping.collection, mapping.documentId);
      
      // For now, simulate Firestore data
      const firestoreData = this.generateMockFirestoreData(mapping);
      
      return this.processFirestoreData(firestoreData, mapping);
    } catch (error) {
      console.error('Error mapping Firestore to grid:', error);
      throw error;
    }
  }

  /**
   * Map grid rectangle data back to Firestore format
   */
  mapGridToFirestore(rectangleData: FirestoreRectangleData[], mappingKey: string): any[] {
    const mapping = this.mappings.get(mappingKey);
    if (!mapping) {
      throw new Error(`Mapping not found: ${mappingKey}`);
    }

    return rectangleData.map(rect => {
      const firestoreDoc: any = {
        id: rect.id,
        [mapping.mappings[0].firestoreField]: {
          row: rect.matrixRow,
          col: rect.matrixCol
        }
      };

      // Apply mappings
      mapping.mappings.forEach(map => {
        const value = rect.data[map.gridProperty];
        firestoreDoc[map.firestoreField] = map.transform ? map.transform(value) : value;
      });

      return firestoreDoc;
    });
  }

  /**
   * Get rectangles by data type
   */
  getRectanglesByDataType(dataType: string): FirestoreRectangleData[] {
    return this.firestoreGridData.getAllRectangleData()
      .filter(rect => rect.data?.type === dataType);
  }

  /**
   * Get rectangles by collection
   */
  getRectanglesByCollection(collection: string): FirestoreRectangleData[] {
    return this.firestoreGridData.getAllRectangleData()
      .filter(rect => rect.data?.collection === collection);
  }

  /**
   * Process Firestore data according to mapping
   */
  private processFirestoreData(data: any[], mapping: GridDataMapping): FirestoreRectangleData[] {
    const processedData: FirestoreRectangleData[] = [];

    data.forEach((item, index) => {
      // Apply filters
      if (mapping.filters && !this.passesFilters(item, mapping.filters)) {
        return;
      }

      const rectangleData: FirestoreRectangleData = {
        id: item.id || `${mapping.collection}-${index}`,
        matrixRow: item.position?.row || 1,
        matrixCol: item.position?.col || 1,
        data: this.mapFirestoreFields(item, mapping.mappings),
        color: item.color,
        priority: item.priority || 1,
        lastUpdated: new Date()
      };

      processedData.push(rectangleData);
    });

    return processedData;
  }

  /**
   * Check if item passes filters
   */
  private passesFilters(item: any, filters: any[]): boolean {
    return filters.every(filter => {
      const value = item[filter.field];
      switch (filter.operator) {
        case '==': return value === filter.value;
        case '!=': return value !== filter.value;
        case '>': return value > filter.value;
        case '<': return value < filter.value;
        case '>=': return value >= filter.value;
        case '<=': return value <= filter.value;
        case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
        case 'not-in': return Array.isArray(filter.value) && !filter.value.includes(value);
        default: return true;
      }
    });
  }

  /**
   * Map Firestore fields to grid properties
   */
  private mapFirestoreFields(item: any, mappings: DataMapping[]): any {
    const mappedData: any = {};

    mappings.forEach(mapping => {
      const value = item[mapping.firestoreField];
      mappedData[mapping.gridProperty] = mapping.transform ? mapping.transform(value) : value;
    });

    return mappedData;
  }

  /**
   * Generate mock Firestore data for development
   */
  private generateMockFirestoreData(mapping: GridDataMapping): any[] {
    const mockData = [
      {
        id: 'office-1',
        position: { row: 1, col: 1 },
        name: 'Main Office',
        type: 'office',
        color: '#ff0000',
        priority: 1
      },
      {
        id: 'project-1',
        position: { row: 5, col: 10 },
        name: 'Project Alpha',
        type: 'project',
        color: '#00ff00',
        priority: 2
      },
      {
        id: 'regulation-1',
        position: { row: 10, col: 15 },
        name: 'Building Code',
        type: 'regulation',
        color: '#0000ff',
        priority: 3
      }
    ];

    return mockData;
  }

  /**
   * Get all mappings
   */
  getMappings(): Map<string, GridDataMapping> {
    return new Map(this.mappings);
  }

  /**
   * Remove mapping
   */
  removeMapping(key: string): void {
    this.mappings.delete(key);
  }
}
