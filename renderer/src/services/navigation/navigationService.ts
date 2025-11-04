/**
 * Navigation Service
 * 
 * Centralized navigation control that can be used by the orchestrator
 * to programmatically navigate between different views in the app.
 */

export type ViewType = 'cross' | 'offices-list' | 'office-detail' | 'projects-list' | 'project-detail' | 'regulations-list' | 'regulatory-detail' | 'map' | 'records-list' | 'bt-view';

export interface NavigationState {
  currentView: ViewType;
  selectedOffice?: string;
  selectedProject?: string;
  selectedRegulation?: string;
  showCross: boolean;
}

export interface NavigationCallbacks {
  onNavigate: (view: ViewType, params?: any) => void;
  onSelectOffice: (officeId: string) => void;
  onSelectProject: (projectId: string) => void;
  onSelectRegulation: (regulationId: string) => void;
  onBack: () => void;
  onRefresh: () => void;
}

class NavigationService {
  private callbacks: NavigationCallbacks | null = null;
  private currentState: NavigationState = {
    currentView: 'cross',
    showCross: true
  };

  /**
   * Register navigation callbacks from the main App component
   */
  registerCallbacks(callbacks: NavigationCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Navigate to a specific view
   */
  navigateTo(view: ViewType, params?: any) {
    console.log(`🧭 NavigationService: Navigating to ${view}`, params);
    
    if (this.callbacks) {
      console.log('📞 Calling navigation callback for:', view);
      this.callbacks.onNavigate(view, params);
    } else {
      console.warn('No navigation callbacks registered!');
    }
    
    this.currentState.currentView = view;
    this.currentState.showCross = view === 'cross';
    console.log('Updated navigation state:', this.currentState);
  }

  /**
   * Navigate to Cross UI
   */
  navigateToCross() {
    this.navigateTo('cross');
  }

  /**
   * Navigate to Offices List
   */
  navigateToOffices() {
    this.navigateTo('offices-list');
  }

  /**
   * Navigate to Projects List
   */
  navigateToProjects() {
    this.navigateTo('projects-list');
  }

  /**
   * Navigate to Regulatory List
   */
  navigateToRegulatory() {
    this.navigateTo('regulations-list');
  }

  /**
   * Navigate to Map
   */
  navigateToMap() {
    this.navigateTo('map');
  }

  /**
   * Navigate to Records List
   */
  navigateToRecords() {
    this.navigateTo('records-list');
  }

  /**
   * Navigate to Records List with specific office
   */
  navigateToRecordsWithOffice(officeId: string) {
    this.currentState.selectedOffice = officeId;
    this.navigateTo('records-list', { officeId });
  }

  /**
   * Navigate to specific office detail
   */
  navigateToOfficeDetail(officeId: string) {
    this.currentState.selectedOffice = officeId;
    this.navigateTo('office-detail', { officeId });
  }

  /**
   * Navigate to specific project detail
   */
  navigateToProjectDetail(projectId: string) {
    this.currentState.selectedProject = projectId;
    this.navigateTo('project-detail', { projectId });
  }

  /**
   * Navigate to specific regulatory detail
   */
  navigateToRegulatoryDetail(regulationId: string) {
    this.currentState.selectedRegulation = regulationId;
    this.navigateTo('regulatory-detail', { regulationId });
  }

  /**
   * Navigate to BT View with specific office
   */
  navigateToBTView(officeId: string) {
    this.currentState.selectedOffice = officeId;
    this.navigateTo('bt-view', { officeId });
  }

  /**
   * Navigate back to previous view
   */
  navigateBack() {
    console.log('NavigationService: Navigating back');
    
    if (this.callbacks) {
      this.callbacks.onBack();
    }
  }

  /**
   * Refresh current view
   */
  refreshCurrentView() {
    console.log('NavigationService: Refreshing current view');
    
    if (this.callbacks) {
      this.callbacks.onRefresh();
    }
  }

  /**
   * Get current view
   */
  getCurrentView(): ViewType {
    return this.currentState.currentView;
  }

  /**
   * Get current navigation state
   */
  getCurrentState(): NavigationState {
    return { ...this.currentState };
  }

  /**
   * Update navigation state
   */
  updateState(updates: Partial<NavigationState>) {
    this.currentState = { ...this.currentState, ...updates };
  }
}

// Export singleton instance
export const navigationService = new NavigationService();
