/**
 * Grid Data Sync System
 * Handles real-time synchronization between Firestore and grid rectangles
 */

import { FirestoreGridData, FirestoreRectangleData } from './FirestoreGridData';
import { PositionCalculator } from '../positionCalculator/PositionCalculator';

export interface SyncConfig {
  enableRealtime: boolean;
  syncInterval: number; // milliseconds
  batchSize: number;
  retryAttempts: number;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingUpdates: number;
  errors: string[];
}

export class GridDataSync {
  private firestoreGridData: FirestoreGridData;
  private positionCalculator: PositionCalculator;
  private syncConfig: SyncConfig;
  private syncStatus: SyncStatus;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor(firestoreGridData: FirestoreGridData, config: SyncConfig) {
    this.firestoreGridData = firestoreGridData;
    this.positionCalculator = new PositionCalculator();
    this.syncConfig = config;
    this.syncStatus = {
      isConnected: false,
      lastSync: null,
      pendingUpdates: 0,
      errors: []
    };
  }

  /**
   * Start real-time synchronization
   */
  async startSync(): Promise<void> {
    try {
      // Initial load
      await this.firestoreGridData.loadFromFirestore();
      this.updateSyncStatus({ isConnected: true, lastSync: new Date() });

      // Set up real-time sync if enabled
      if (this.syncConfig.enableRealtime) {
        this.setupRealtimeSync();
      }

      // Set up interval sync
      this.setupIntervalSync();
      
    } catch (error) {
      this.handleSyncError('Failed to start sync', error);
    }
  }

  /**
   * Stop synchronization
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.updateSyncStatus({ isConnected: false });
  }

  /**
   * Set up real-time Firestore listeners
   */
  private setupRealtimeSync(): void {
    // This would integrate with your existing Firebase real-time listeners
    // For now, we'll simulate real-time updates
    console.log('Setting up real-time Firestore sync...');
  }

  /**
   * Set up interval-based sync
   */
  private setupIntervalSync(): void {
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncData();
      } catch (error) {
        this.handleSyncError('Interval sync failed', error);
      }
    }, this.syncConfig.syncInterval);
  }

  /**
   * Sync data from Firestore
   */
  async syncData(): Promise<void> {
    try {
      await this.firestoreGridData.loadFromFirestore();
      this.updateSyncStatus({ 
        lastSync: new Date(),
        pendingUpdates: 0,
        errors: []
      });
    } catch (error) {
      this.handleSyncError('Data sync failed', error);
    }
  }

  /**
   * Update rectangle data and sync to Firestore
   */
  async updateRectangle(matrixRow: number, matrixCol: number, data: any): Promise<void> {
    try {
      const rectangleData: FirestoreRectangleData = {
        id: `rect-${matrixRow}-${matrixCol}`,
        matrixRow,
        matrixCol,
        data,
        priority: 1,
        lastUpdated: new Date()
      };

      this.firestoreGridData.addRectangleData(rectangleData);
      
      // Here you would sync to Firestore
      // await this.syncToFirestore(rectangleData);
      
      this.updateSyncStatus({ pendingUpdates: this.syncStatus.pendingUpdates + 1 });
    } catch (error) {
      this.handleSyncError('Failed to update rectangle', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove sync status listener
   */
  removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Update sync status and notify listeners
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  /**
   * Handle sync errors
   */
  private handleSyncError(message: string, error: any): void {
    const errorMessage = `${message}: ${error.message || error}`;
    this.updateSyncStatus({
      errors: [...this.syncStatus.errors, errorMessage]
    });
    console.error(errorMessage, error);
  }

  /**
   * Get configuration
   */
  getConfig(): SyncConfig {
    return { ...this.syncConfig };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...newConfig };
  }
}
