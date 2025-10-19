/**
 * Office Actions Handler
 * 
 * Handles all office-related operations for the AI Orchestrator.
 * These actions work with the Firestore operations from Phase 2.
 */

import { 
  createOffice, 
  updateOffice, 
  deleteOffice, 
  getOffice,
  queryOffices
} from '../../renderer/src/services/firebase/dataService';
import { Office, CreateOfficeData, UpdateOfficeData } from '../../renderer/src/types/firestore';

export interface OfficeActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Create a new architecture office
 */
export async function createOfficeAction(params: {
  name: string;
  city: string;
  country: string;
  description?: string;
  founded?: number;
  specialization?: string;
  website?: string;
  contact?: string;
}): Promise<OfficeActionResult> {
  try {
    // Validate required parameters
    if (!params.name || !params.city || !params.country) {
      return {
        success: false,
        error: 'Missing required parameters: name, city, and country are required'
      };
    }

    // Prepare office data
    const officeData: CreateOfficeData = {
      name: params.name,
      city: params.city,
      country: params.country,
      description: params.description || '',
      founded: params.founded || null,
      specialization: params.specialization || '',
      website: params.website || '',
      contact: params.contact || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create office using Firestore operations
    const office = await createOffice(officeData);

    return {
      success: true,
      data: office,
      message: `Successfully created office: ${office.name} (${office.id})`
    };
  } catch (error) {
    console.error('Error creating office:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update an existing architecture office
 */
export async function updateOfficeAction(params: {
  officeId: string;
  name?: string;
  city?: string;
  country?: string;
  description?: string;
  founded?: number;
  specialization?: string;
  website?: string;
  contact?: string;
}): Promise<OfficeActionResult> {
  try {
    // Validate required parameters
    if (!params.officeId) {
      return {
        success: false,
        error: 'Missing required parameter: officeId is required'
      };
    }

    // Prepare update data (only include provided fields)
    const updateData: UpdateOfficeData = {
      updatedAt: new Date()
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.city !== undefined) updateData.city = params.city;
    if (params.country !== undefined) updateData.country = params.country;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.founded !== undefined) updateData.founded = params.founded;
    if (params.specialization !== undefined) updateData.specialization = params.specialization;
    if (params.website !== undefined) updateData.website = params.website;
    if (params.contact !== undefined) updateData.contact = params.contact;

    // Update office using Firestore operations
    const office = await updateOffice(params.officeId, updateData);

    return {
      success: true,
      data: office,
      message: `Successfully updated office: ${office.name} (${office.id})`
    };
  } catch (error) {
    console.error('Error updating office:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete an architecture office
 */
export async function deleteOfficeAction(params: {
  officeId: string;
}): Promise<OfficeActionResult> {
  try {
    // Validate required parameters
    if (!params.officeId) {
      return {
        success: false,
        error: 'Missing required parameter: officeId is required'
      };
    }

    // Delete office using Firestore operations
    await deleteOffice(params.officeId);

    return {
      success: true,
      message: `Successfully deleted office: ${params.officeId}`
    };
  } catch (error) {
    console.error('Error deleting office:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get detailed information about a specific office
 */
export async function getOfficeAction(params: {
  officeId: string;
  includeRelationships?: boolean;
}): Promise<OfficeActionResult> {
  try {
    // Validate required parameters
    if (!params.officeId) {
      return {
        success: false,
        error: 'Missing required parameter: officeId is required'
      };
    }

    // Get office using Firestore operations
    const office = await getOffice(params.officeId);

    if (!office) {
      return {
        success: false,
        error: `Office not found: ${params.officeId}`
      };
    }

    return {
      success: true,
      data: office,
      message: `Retrieved office: ${office.name} (${office.id})`
    };
  } catch (error) {
    console.error('Error getting office:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Search and filter architecture offices
 */
export async function searchOfficesAction(params: {
  query?: string;
  city?: string;
  country?: string;
  specialization?: string;
  founded?: number;
  limit?: number;
}): Promise<OfficeActionResult> {
  try {
    // Prepare search filters
    const filters: any = {};
    
    if (params.city) filters.city = params.city;
    if (params.country) filters.country = params.country;
    if (params.specialization) filters.specialization = params.specialization;
    if (params.founded) filters.founded = params.founded;

    // Search offices using Firestore operations
    const offices = await queryOffices({
      filters,
      limit: params.limit || 50
    });

    return {
      success: true,
      data: offices,
      message: `Found ${offices.length} offices matching criteria`
    };
  } catch (error) {
    console.error('Error searching offices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Action handler mapping for registry
 */
export const officeActions = {
  createOffice: createOfficeAction,
  updateOffice: updateOfficeAction,
  deleteOffice: deleteOfficeAction,
  getOffice: getOfficeAction,
  searchOffices: searchOfficesAction
};
