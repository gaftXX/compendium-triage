/**
 * Relationship Actions Handler
 * 
 * Handles all relationship operations for the AI Orchestrator.
 * These actions manage connections between offices, projects, and regulatory records.
 */

import { 
  createRelationship, 
  deleteRelationship, 
  getRelationshipsByEntity,
  getRelationshipById 
} from '../../renderer/src/services/firebase/firestoreOperations';
import { Relationship, CreateRelationshipData } from '../../renderer/src/types/firestore';

export interface RelationshipActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Link an office to a project
 */
export async function linkOfficeToProjectAction(params: {
  officeId: string;
  projectId: string;
  role?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}): Promise<RelationshipActionResult> {
  try {
    // Validate required parameters
    if (!params.officeId || !params.projectId) {
      return {
        success: false,
        error: 'Missing required parameters: officeId and projectId are required'
      };
    }

    // Prepare relationship data
    const relationshipData: CreateRelationshipData = {
      fromEntityType: 'office',
      fromEntityId: params.officeId,
      toEntityType: 'project',
      toEntityId: params.projectId,
      relationshipType: 'office_project',
      metadata: {
        role: params.role || '',
        startDate: params.startDate || null,
        endDate: params.endDate || null,
        notes: params.notes || ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create relationship using Firestore operations
    const relationship = await createRelationship(relationshipData);

    return {
      success: true,
      data: relationship,
      message: `Successfully linked office ${params.officeId} to project ${params.projectId}`
    };
  } catch (error) {
    console.error('Error linking office to project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Link an office to a regulatory record
 */
export async function linkOfficeToRegulatoryAction(params: {
  officeId: string;
  recordId: string;
  complianceStatus?: string;
  lastReview?: Date;
  notes?: string;
}): Promise<RelationshipActionResult> {
  try {
    // Validate required parameters
    if (!params.officeId || !params.recordId) {
      return {
        success: false,
        error: 'Missing required parameters: officeId and recordId are required'
      };
    }

    // Prepare relationship data
    const relationshipData: CreateRelationshipData = {
      fromEntityType: 'office',
      fromEntityId: params.officeId,
      toEntityType: 'regulatory',
      toEntityId: params.recordId,
      relationshipType: 'office_regulatory',
      metadata: {
        complianceStatus: params.complianceStatus || 'unknown',
        lastReview: params.lastReview || null,
        notes: params.notes || ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create relationship using Firestore operations
    const relationship = await createRelationship(relationshipData);

    return {
      success: true,
      data: relationship,
      message: `Successfully linked office ${params.officeId} to regulatory record ${params.recordId}`
    };
  } catch (error) {
    console.error('Error linking office to regulatory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Link a project to a regulatory record
 */
export async function linkProjectToRegulatoryAction(params: {
  projectId: string;
  recordId: string;
  complianceStatus?: string;
  requirements?: string;
  notes?: string;
}): Promise<RelationshipActionResult> {
  try {
    // Validate required parameters
    if (!params.projectId || !params.recordId) {
      return {
        success: false,
        error: 'Missing required parameters: projectId and recordId are required'
      };
    }

    // Prepare relationship data
    const relationshipData: CreateRelationshipData = {
      fromEntityType: 'project',
      fromEntityId: params.projectId,
      toEntityType: 'regulatory',
      toEntityId: params.recordId,
      relationshipType: 'project_regulatory',
      metadata: {
        complianceStatus: params.complianceStatus || 'unknown',
        requirements: params.requirements || '',
        notes: params.notes || ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create relationship using Firestore operations
    const relationship = await createRelationship(relationshipData);

    return {
      success: true,
      data: relationship,
      message: `Successfully linked project ${params.projectId} to regulatory record ${params.recordId}`
    };
  } catch (error) {
    console.error('Error linking project to regulatory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get all relationships for a specific entity
 */
export async function getEntityRelationshipsAction(params: {
  entityType: string;
  entityId: string;
  relationshipType?: string;
}): Promise<RelationshipActionResult> {
  try {
    // Validate required parameters
    if (!params.entityType || !params.entityId) {
      return {
        success: false,
        error: 'Missing required parameters: entityType and entityId are required'
      };
    }

    // Get relationships using Firestore operations
    const relationships = await getRelationshipsByEntity(
      params.entityType,
      params.entityId,
      params.relationshipType
    );

    return {
      success: true,
      data: relationships,
      message: `Found ${relationships.length} relationships for ${params.entityType} ${params.entityId}`
    };
  } catch (error) {
    console.error('Error getting entity relationships:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete a specific relationship
 */
export async function deleteRelationshipAction(params: {
  relationshipId: string;
}): Promise<RelationshipActionResult> {
  try {
    // Validate required parameters
    if (!params.relationshipId) {
      return {
        success: false,
        error: 'Missing required parameter: relationshipId is required'
      };
    }

    // Delete relationship using Firestore operations
    await deleteRelationship(params.relationshipId);

    return {
      success: true,
      message: `Successfully deleted relationship: ${params.relationshipId}`
    };
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get relationship details by ID
 */
export async function getRelationshipAction(params: {
  relationshipId: string;
}): Promise<RelationshipActionResult> {
  try {
    // Validate required parameters
    if (!params.relationshipId) {
      return {
        success: false,
        error: 'Missing required parameter: relationshipId is required'
      };
    }

    // Get relationship using Firestore operations
    const relationship = await getRelationshipById(params.relationshipId);

    if (!relationship) {
      return {
        success: false,
        error: `Relationship not found: ${params.relationshipId}`
      };
    }

    return {
      success: true,
      data: relationship,
      message: `Retrieved relationship: ${relationship.relationshipType}`
    };
  } catch (error) {
    console.error('Error getting relationship:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Action handler mapping for registry
 */
export const relationshipActions = {
  linkOfficeToProject: linkOfficeToProjectAction,
  linkOfficeToRegulatory: linkOfficeToRegulatoryAction,
  linkProjectToRegulatory: linkProjectToRegulatoryAction,
  getEntityRelationships: getEntityRelationshipsAction,
  deleteRelationship: deleteRelationshipAction,
  getRelationship: getRelationshipAction
};
