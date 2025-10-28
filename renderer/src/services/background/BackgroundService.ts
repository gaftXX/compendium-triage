import { Office, Project, Regulation } from '../../types/firestore';
import { firestoreOperations } from '../firebase/firestoreOperations';
import { navigationService } from '../navigation/navigationService';

/**
 * Background Service
 * 
 * Centralized service for managing background actions across the app:
 * - Data caching and persistence with real-time updates
 * - Keyboard listeners
 * - Window management
 * - State management across views
 */

interface CacheData<T> {
  data: T[];
  isLoaded: boolean;
  lastFetchTime: number;
  unsubscribe?: () => void;
}

type DataChangeCallback<T> = (newData: T[]) => void;

class BackgroundService {
  private static instance: BackgroundService | null = null;
  
  // Data caches
  private cachedOffices: CacheData<Office> = {
    data: [],
    isLoaded: false,
    lastFetchTime: 0
  };
  
  private cachedProjects: CacheData<Project> = {
    data: [],
    isLoaded: false,
    lastFetchTime: 0
  };
  
  private cachedRegulations: CacheData<Regulation> = {
    data: [],
    isLoaded: false,
    lastFetchTime: 0
  };

  // Window state
  private windowState = {
    isFullWidth: true
  };

  // Keyboard listeners
  private keyboardListeners: Map<string, (event: KeyboardEvent) => void> = new Map();

  // Change callbacks for real-time updates
  private officesChangeCallbacks: DataChangeCallback<Office>[] = [];
  private projectsChangeCallbacks: DataChangeCallback<Project>[] = [];
  private regulationsChangeCallbacks: DataChangeCallback<Regulation>[] = [];

  private constructor() {
    // Initialize global ESC handler on creation
    this.setupGlobalEscapeHandler();
  }

  static getInstance(): BackgroundService {
    if (!this.instance) {
      this.instance = new BackgroundService();
    }
    return this.instance;
  }

  /**
   * GLOBAL KEYBOARD HANDLERS
   * 
   * RULE: ESC key always navigates back to Cross page
   * RULE: Shift+S from any page navigates to Cross and enters Shift+S mode
   * This works on ANY page automatically
   */
  private setupGlobalEscapeHandler(): void {
    const keyboardHandler = (event: KeyboardEvent) => {
      // ESC: Navigate back to Cross
      if (event.key === 'Escape') {
        console.log('🔙 ESC pressed - Navigating back to Cross');
        navigationService.navigateToCross();
      }
      
      // Shift+S: Navigate to Cross and enter Shift+S mode (only when NOT on Cross page)
      const currentView = navigationService.getCurrentView();
      const isOnCrossPage = currentView === 'cross';
      
      if (event.key === 'S' && event.shiftKey && !event.ctrlKey && !event.metaKey && !isOnCrossPage) {
        console.log('🔙 Shift+S pressed outside Cross - Navigating to Cross and entering Shift+S mode');
        event.preventDefault(); // Prevent normal Shift+S behavior
        navigationService.navigateToCross();
        
        // Trigger Shift+S state after a brief delay to ensure navigation completes
        setTimeout(() => {
          const customEvent = new KeyboardEvent('keydown', {
            key: 'S',
            shiftKey: true,
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(customEvent);
        }, 50);
      }
    };

    window.addEventListener('keydown', keyboardHandler);
  }

  /**
   * OFFICES CACHE
   */
  getCachedOffices(): Office[] {
    return this.cachedOffices.data;
  }

  isOfficesLoaded(): boolean {
    return this.cachedOffices.isLoaded;
  }

  setCachedOffices(data: Office[]): void {
    this.cachedOffices = {
      data,
      isLoaded: true,
      lastFetchTime: Date.now()
    };
    // Notify all callbacks of the data change
    this.officesChangeCallbacks.forEach(callback => callback(data));
  }

  /**
   * PROJECTS CACHE
   */
  getCachedProjects(): Project[] {
    return this.cachedProjects.data;
  }

  isProjectsLoaded(): boolean {
    return this.cachedProjects.isLoaded;
  }

  setCachedProjects(data: Project[]): void {
    this.cachedProjects = {
      data,
      isLoaded: true,
      lastFetchTime: Date.now()
    };
    // Notify all callbacks of the data change
    this.projectsChangeCallbacks.forEach(callback => callback(data));
  }

  /**
   * REGULATIONS CACHE
   */
  getCachedRegulations(): Regulation[] {
    return this.cachedRegulations.data;
  }

  isRegulationsLoaded(): boolean {
    return this.cachedRegulations.isLoaded;
  }

  setCachedRegulations(data: Regulation[]): void {
    this.cachedRegulations = {
      data,
      isLoaded: true,
      lastFetchTime: Date.now()
    };
    // Notify all callbacks of the data change
    this.regulationsChangeCallbacks.forEach(callback => callback(data));
  }

  /**
   * WINDOW STATE
   */
  getWindowState() {
    return { ...this.windowState };
  }

  setWindowFullWidth(isFullWidth: boolean): void {
    this.windowState.isFullWidth = isFullWidth;
  }

  /**
   * WINDOW STATE & RULES
   * 
   * RULE: Cross page is ALWAYS in default window size
   * This rule is enforced for all navigation to the Cross page
   */
  shouldResetWindowSizeForView(view: string): boolean {
    return view === 'cross';
  }

  getWindowSizeForView(view: string): 'default' | 'full' {
    if (view === 'cross') {
      return 'default'; // RULE: Cross is ALWAYS default size
    }
    return 'full'; // Pages open in full width
  }

  /**
   * KEYBOARD LISTENERS
   */
  registerKeyboardListener(id: string, handler: (event: KeyboardEvent) => void): void {
    this.keyboardListeners.set(id, handler);
    this.setupGlobalKeyboardListener();
  }

  unregisterKeyboardListener(id: string): void {
    this.keyboardListeners.delete(id);
    if (this.keyboardListeners.size === 0) {
      this.removeGlobalKeyboardListener();
    }
  }

  private globalKeyboardHandler: ((event: KeyboardEvent) => void) | null = null;

  private setupGlobalKeyboardListener(): void {
    if (this.globalKeyboardHandler) return;

    this.globalKeyboardHandler = (event: KeyboardEvent) => {
      for (const handler of this.keyboardListeners.values()) {
        handler(event);
      }
    };

    window.addEventListener('keydown', this.globalKeyboardHandler);
  }

  private removeGlobalKeyboardListener(): void {
    if (this.globalKeyboardHandler) {
      window.removeEventListener('keydown', this.globalKeyboardHandler);
      this.globalKeyboardHandler = null;
    }
  }

  /**
   * REAL-TIME DATA UPDATES
   */
  
  // Register a callback for offices data changes
  onOfficesChange(callback: DataChangeCallback<Office>): () => void {
    this.officesChangeCallbacks.push(callback);
    return () => {
      const index = this.officesChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.officesChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Register a callback for projects data changes
  onProjectsChange(callback: DataChangeCallback<Project>): () => void {
    this.projectsChangeCallbacks.push(callback);
    return () => {
      const index = this.projectsChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.projectsChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Register a callback for regulations data changes
  onRegulationsChange(callback: DataChangeCallback<Regulation>): () => void {
    this.regulationsChangeCallbacks.push(callback);
    return () => {
      const index = this.regulationsChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.regulationsChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Initialize real-time listeners
  async initializeRealtimeListeners(): Promise<void> {
    // For cost optimization, we can choose between real-time listeners or periodic polling
    const useRealTimeListeners = true; // Set to false for polling-based updates
    
    if (useRealTimeListeners) {
      // Setup offices listener
      if (!this.cachedOffices.unsubscribe) {
        this.cachedOffices.unsubscribe = await this.setupOfficesListener();
      }

      // Setup projects listener
      if (!this.cachedProjects.unsubscribe) {
        this.cachedProjects.unsubscribe = await this.setupProjectsListener();
      }

      // Setup regulations listener
      if (!this.cachedRegulations.unsubscribe) {
        this.cachedRegulations.unsubscribe = await this.setupRegulationsListener();
      }
    } else {
      // Alternative: Periodic polling (more cost-effective for large datasets)
      this.startPeriodicUpdates();
    }
  }

  /**
   * Alternative approach: Periodic updates instead of real-time listeners
   * This is more cost-effective for large datasets
   */
  private startPeriodicUpdates(): void {
    // Update every 30 seconds
    setInterval(async () => {
      await this.refreshAllData();
    }, 30000);
    
    // Initial load
    this.refreshAllData();
  }

  /**
   * Refresh all cached data (for polling approach)
   */
  private async refreshAllData(): Promise<void> {
    try {
      // Only fetch if we have subscribers
      if (this.officesChangeCallbacks.length > 0) {
        const officesResult = await firestoreOperations.queryOffices();
        if (officesResult.success && officesResult.data) {
          this.setCachedOffices(officesResult.data);
        }
      }
      
      if (this.projectsChangeCallbacks.length > 0) {
        const projectsResult = await firestoreOperations.queryProjects();
        if (projectsResult.success && projectsResult.data) {
          this.setCachedProjects(projectsResult.data);
        }
      }
      
      if (this.regulationsChangeCallbacks.length > 0) {
        const regulationsResult = await firestoreOperations.queryRegulations();
        if (regulationsResult.success && regulationsResult.data) {
          this.setCachedRegulations(regulationsResult.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  private async setupOfficesListener(): Promise<() => void> {
    try {
      const unsubscribe = firestoreOperations.subscribeToCollection(
        'offices',
        (snapshot) => {
          // Only process if there are actual changes (not just metadata)
          if (snapshot.metadata.fromCache) {
            console.log('Real-time offices update: from cache, skipping');
            return;
          }
          
          const offices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Office[];
          
          console.log('Real-time offices update:', offices.length, 'offices (from server)');
          this.setCachedOffices(offices);
        },
        {
          filters: [],
          orderBy: [{ field: 'name', direction: 'asc' }],
          includeMetadataChanges: false, // Don't trigger on metadata changes
          onError: (error) => {
            console.error('Offices listener error:', error);
          }
        }
      );
      
      console.log('Real-time listener setup for offices');
      return unsubscribe;
    } catch (error) {
      console.error('Failed to setup offices listener:', error);
      return () => {};
    }
  }

  private async setupProjectsListener(): Promise<() => void> {
    try {
      const unsubscribe = firestoreOperations.subscribeToCollection(
        'projects',
        (snapshot) => {
          const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];
          
          console.log('Real-time projects update:', projects.length, 'projects');
          this.setCachedProjects(projects);
        },
        {
          filters: [],
          orderBy: [{ field: 'projectName', direction: 'asc' }],
          includeMetadataChanges: false
        }
      );
      
      console.log('✅ Real-time listener setup for projects');
      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to setup projects listener:', error);
      return () => {};
    }
  }

  private async setupRegulationsListener(): Promise<() => void> {
    try {
      const unsubscribe = firestoreOperations.subscribeToCollection(
        'regulations',
        (snapshot) => {
          const regulations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Regulation[];
          
          console.log('Real-time regulations update:', regulations.length, 'regulations');
          this.setCachedRegulations(regulations);
        },
        {
          filters: [],
          orderBy: [{ field: 'name', direction: 'asc' }],
          includeMetadataChanges: false
        }
      );
      
      console.log('✅ Real-time listener setup for regulations');
      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to setup regulations listener:', error);
      return () => {};
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.removeGlobalKeyboardListener();
    this.keyboardListeners.clear();
    
    // Unsubscribe from real-time listeners
    this.cachedOffices.unsubscribe?.();
    this.cachedProjects.unsubscribe?.();
    this.cachedRegulations.unsubscribe?.();
  }
}

export const backgroundService = BackgroundService.getInstance();
