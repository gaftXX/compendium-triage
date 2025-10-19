/**
 * Simple UI Navigation Actions
 * 
 * Simplified UI actions that focus only on navigation without complex data operations
 */

import { navigationService } from '../../renderer/src/services/navigation/navigationService';

export interface SimpleUIActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Navigate to Cross UI
 */
export async function navigateToCross(): Promise<SimpleUIActionResult> {
  try {
    navigationService.navigateToCross();
    return {
      success: true,
      message: 'Navigated to Cross UI',
      data: { view: 'cross' }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to navigate to Cross UI: ${error}`
    };
  }
}

/**
 * Navigate to Offices List
 */
export async function navigateToOffices(): Promise<SimpleUIActionResult> {
  try {
    navigationService.navigateToOffices();
    return {
      success: true,
      message: 'Navigated to Offices List',
      data: { view: 'offices-list' }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to navigate to Offices List: ${error}`
    };
  }
}

/**
 * Navigate to Projects List
 */
export async function navigateToProjects(): Promise<SimpleUIActionResult> {
  try {
    navigationService.navigateToProjects();
    return {
      success: true,
      message: 'Navigated to Projects List',
      data: { view: 'projects-list' }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to navigate to Projects List: ${error}`
    };
  }
}

/**
 * Navigate to Regulatory List
 */
export async function navigateToRegulatory(): Promise<SimpleUIActionResult> {
  try {
    navigationService.navigateToRegulatory();
    return {
      success: true,
      message: 'Navigated to Regulatory List',
      data: { view: 'regulatory-list' }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to navigate to Regulatory List: ${error}`
    };
  }
}

/**
 * Navigate back
 */
export async function navigateBack(): Promise<SimpleUIActionResult> {
  try {
    navigationService.navigateBack();
    return {
      success: true,
      message: 'Navigated back',
      data: { action: 'back' }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to navigate back: ${error}`
    };
  }
}

/**
 * Get current state
 */
export async function getCurrentState(): Promise<SimpleUIActionResult> {
  try {
    const state = navigationService.getCurrentState();
    return {
      success: true,
      message: 'Current state retrieved',
      data: state
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get current state: ${error}`
    };
  }
}

// Export all actions as a single object
export const simpleUIActions = {
  navigateToCross,
  navigateToOffices,
  navigateToProjects,
  navigateToRegulatory,
  navigateBack,
  getCurrentState
};
