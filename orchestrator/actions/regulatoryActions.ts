/**
 * Regulatory Actions Handler
 * 
 * Handles all regulatory/zoning-related operations for the AI Orchestrator.
 * These actions work with the Firestore operations from Phase 2.
 */

import { 
  createRegulation, 
  updateRegulation, 
  deleteRegulation, 
  getRegulation,
  queryRegulations
} from '../../renderer/src/services/firebase/dataService';
import { RegulatoryRecord, CreateRegulatoryData, UpdateRegulatoryData } from '../../renderer/src/types/firestore';

export interface RegulatoryActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Create a new regulatory or zoning record
 */
export async function createRegulatoryRecordAction(params: {
  name: string;
  type: string;
  jurisdiction: string;
  description?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  status?: string;
  requirements?: string;
  penalties?: string;
}): Promise<RegulatoryActionResult> {
  try {
    // Validate required parameters
    if (!params.name || !params.type || !params.jurisdiction) {
      return {
        success: false,
        error: 'Missing required parameters: name, type, and jurisdiction are required'
      };
    }

    // Prepare regulatory data
    const regulatoryData: CreateRegulatoryData = {
      name: params.name,
      type: params.type,
      jurisdiction: params.jurisdiction,
      description: params.description || '',
      effectiveDate: params.effectiveDate || null,
      expiryDate: params.expiryDate || null,
      status: params.status || 'active',
      requirements: params.requirements || '',
      penalties: params.penalties || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create regulatory record using Firestore operations
    const record = await createRegulation(regulatoryData);

    return {
      success: true,
      data: record,
      message: `Successfully created regulatory record: ${record.name} (${record.id})`
    };
  } catch (error) {
    console.error('Error creating regulatory record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update an existing regulatory or zoning record
 */
export async function updateRegulatoryRecordAction(params: {
  recordId: string;
  name?: string;
  type?: string;
  jurisdiction?: string;
  description?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  status?: string;
  requirements?: string;
  penalties?: string;
}): Promise<RegulatoryActionResult> {
  try {
    // Validate required parameters
    if (!params.recordId) {
      return {
        success: false,
        error: 'Missing required parameter: recordId is required'
      };
    }

    // Prepare update data (only include provided fields)
    const updateData: UpdateRegulatoryData = {
      updatedAt: new Date()
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.type !== undefined) updateData.type = params.type;
    if (params.jurisdiction !== undefined) updateData.jurisdiction = params.jurisdiction;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.effectiveDate !== undefined) updateData.effectiveDate = params.effectiveDate;
    if (params.expiryDate !== undefined) updateData.expiryDate = params.expiryDate;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.requirements !== undefined) updateData.requirements = params.requirements;
    if (params.penalties !== undefined) updateData.penalties = params.penalties;

    // Update regulatory record using Firestore operations
    const record = await updateRegulation(params.recordId, updateData);

    return {
      success: true,
      data: record,
      message: `Successfully updated regulatory record: ${record.name} (${record.id})`
    };
  } catch (error) {
    console.error('Error updating regulatory record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete a regulatory or zoning record
 */
export async function deleteRegulatoryRecordAction(params: {
  recordId: string;
}): Promise<RegulatoryActionResult> {
  try {
    // Validate required parameters
    if (!params.recordId) {
      return {
        success: false,
        error: 'Missing required parameter: recordId is required'
      };
    }

    // Delete regulatory record using Firestore operations
    await deleteRegulation(params.recordId);

    return {
      success: true,
      message: `Successfully deleted regulatory record: ${params.recordId}`
    };
  } catch (error) {
    console.error('Error deleting regulatory record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get detailed information about a specific regulatory record
 */
export async function getRegulatoryRecordAction(params: {
  recordId: string;
  includeRelationships?: boolean;
}): Promise<RegulatoryActionResult> {
  try {
    // Validate required parameters
    if (!params.recordId) {
      return {
        success: false,
        error: 'Missing required parameter: recordId is required'
      };
    }

    // Get regulatory record using Firestore operations
    const record = await getRegulation(params.recordId);

    if (!record) {
      return {
        success: false,
        error: `Regulatory record not found: ${params.recordId}`
      };
    }

    return {
      success: true,
      data: record,
      message: `Retrieved regulatory record: ${record.name} (${record.id})`
    };
  } catch (error) {
    console.error('Error getting regulatory record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Search and filter regulatory records
 */
export async function searchRegulatoryRecordsAction(params: {
  query?: string;
  type?: string;
  jurisdiction?: string;
  status?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  limit?: number;
}): Promise<RegulatoryActionResult> {
  try {
    // Prepare search filters
    const filters: any = {};
    
    if (params.type) filters.type = params.type;
    if (params.jurisdiction) filters.jurisdiction = params.jurisdiction;
    if (params.status) filters.status = params.status;
    if (params.effectiveDate) filters.effectiveDate = params.effectiveDate;
    if (params.expiryDate) filters.expiryDate = params.expiryDate;

    // Search regulatory records using Firestore operations
    const records = await queryRegulations({
      filters,
      limit: params.limit || 50
    });

    return {
      success: true,
      data: records,
      message: `Found ${records.length} regulatory records matching criteria`
    };
  } catch (error) {
    console.error('Error searching regulatory records:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Action handler mapping for registry
 */
export const regulatoryActions = {
  createRegulatoryRecord: createRegulatoryRecordAction,
  updateRegulatoryRecord: updateRegulatoryRecordAction,
  deleteRegulatoryRecord: deleteRegulatoryRecordAction,
  getRegulatoryRecord: getRegulatoryRecordAction,
  searchRegulatoryRecords: searchRegulatoryRecordsAction
};
