// Firestore Note Service - Handles real database operations for the Note System

import { FirestoreOperationsService } from '../firebase/firestoreOperations';
import { Office, Project, Regulation } from '../../types/firestore';
import { NoteServiceResult } from './noteService';

export interface EntityRelationship {
  type: 'office-project' | 'office-regulation' | 'project-regulation';
  sourceId: string;
  targetId: string;
  relationship: string; // e.g., 'designed by', 'regulated by', 'located in'
}

export class FirestoreNoteService {
  private static instance: FirestoreNoteService;
  private firestoreService: FirestoreOperationsService;

  private constructor() {
    this.firestoreService = FirestoreOperationsService.getInstance();
  }

  public static getInstance(): FirestoreNoteService {
    if (!FirestoreNoteService.instance) {
      FirestoreNoteService.instance = new FirestoreNoteService();
    }
    return FirestoreNoteService.instance;
  }

  /**
   * Save office to Firestore with relationship handling
   */
  public async saveOffice(
    officeData: Partial<Office>,
    relatedEntities?: { projects?: string[], regulations?: string[] }
  ): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      // Always create new office (skip update logic to avoid document not found errors)
      console.log('🏢 Creating new office:', officeData.name);
      const result = await this.firestoreService.createOffice(officeData);
      
      if (result.success && result.data) {
        // Create relationships
        if (relatedEntities) {
          await this.createOfficeRelationships(result.data.id, relatedEntities);
        }
        
        return {
          success: true,
          message: `Office "${officeData.name}" created successfully with ID: ${result.data.id}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create office',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving office:', error);
      return {
        success: false,
        message: 'Failed to save office',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save project to Firestore with relationship handling
   */
  public async saveProject(
    projectData: Partial<Project>,
    relatedEntities?: { office?: string, regulations?: string[] }
  ): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      // Check if project already exists
      const existingProject = await this.findExistingProject(projectData.projectName || '');
      
      if (existingProject) {
        // Update existing project
        const updatedData = this.mergeProjectData(existingProject, projectData);
        const result = await this.firestoreService.updateProject(existingProject.id, updatedData);
        
        if (result.success) {
          // Update relationships
          if (relatedEntities) {
            await this.updateProjectRelationships(existingProject.id, relatedEntities);
          }
          
          return {
            success: true,
            message: `Project "${projectData.projectName}" updated successfully`,
            data: result.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to update project',
            error: result.error
          };
        }
      } else {
        // Create new project
        const result = await this.firestoreService.createProject(projectData);
        
        if (result.success && result.data) {
          // Create relationships
          if (relatedEntities) {
            await this.createProjectRelationships(result.data.id, relatedEntities);
          }
          
          return {
            success: true,
            message: `Project "${projectData.projectName}" created successfully`,
            data: result.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to create project',
            error: result.error
          };
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      return {
        success: false,
        message: 'Failed to save project',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save regulation to Firestore with relationship handling
   */
  public async saveRegulation(
    regulationData: Partial<Regulation>,
    relatedEntities?: { offices?: string[], projects?: string[] }
  ): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      // Check if regulation already exists
      const existingRegulation = await this.findExistingRegulation(regulationData.name || '');
      
      if (existingRegulation) {
        // Update existing regulation
        const updatedData = this.mergeRegulationData(existingRegulation, regulationData);
        const result = await this.firestoreService.updateRegulation(existingRegulation.id, updatedData);
        
        if (result.success) {
          // Update relationships
          if (relatedEntities) {
            await this.updateRegulationRelationships(existingRegulation.id, relatedEntities);
          }
          
          return {
            success: true,
            message: `Regulation "${regulationData.name}" updated successfully`,
            data: result.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to update regulation',
            error: result.error
          };
        }
      } else {
        // Create new regulation
        const result = await this.firestoreService.createRegulation(regulationData);
        
        if (result.success && result.data) {
          // Create relationships
          if (relatedEntities) {
            await this.createRegulationRelationships(result.data.id, relatedEntities);
          }
          
          return {
            success: true,
            message: `Regulation "${regulationData.name}" created successfully`,
            data: result.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to create regulation',
            error: result.error
          };
        }
      }
    } catch (error) {
      console.error('Error saving regulation:', error);
      return {
        success: false,
        message: 'Failed to save regulation',
        error: (error as Error).message
      };
    }
  }

  /**
   * Find existing office by name
   */
  private async findExistingOffice(name: string): Promise<Office | null> {
    try {
      const result = await this.firestoreService.queryOffices({
        filters: [{ field: 'name', operator: '==', value: name }]
      });
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding existing office:', error);
      return null;
    }
  }

  /**
   * Find existing project by name
   */
  private async findExistingProject(name: string): Promise<Project | null> {
    try {
      const result = await this.firestoreService.queryProjects({
        filters: [{ field: 'projectName', operator: '==', value: name }]
      });
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding existing project:', error);
      return null;
    }
  }

  /**
   * Find existing regulation by name
   */
  private async findExistingRegulation(name: string): Promise<Regulation | null> {
    try {
      const result = await this.firestoreService.queryRegulations({
        filters: [{ field: 'name', operator: '==', value: name }]
      });
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding existing regulation:', error);
      return null;
    }
  }

  /**
   * Merge office data (update vs create logic)
   */
  private mergeOfficeData(existing: Office, newData: Partial<Office>): Partial<Office> {
    return {
      ...existing,
      ...newData,
      // Preserve connection counts and increment if new data adds relationships
      connectionCounts: {
        ...existing.connectionCounts,
        ...newData.connectionCounts
      },
      // Merge specializations
      specializations: [...new Set([...existing.specializations, ...(newData.specializations || [])])],
      // Merge notable works
      notableWorks: [...new Set([...existing.notableWorks, ...(newData.notableWorks || [])])]
    };
  }

  /**
   * Merge project data (update vs create logic)
   */
  private mergeProjectData(existing: Project, newData: Partial<Project>): Partial<Project> {
    return {
      ...existing,
      ...newData,
      // Keep the original ID
      id: existing.id
    };
  }

  /**
   * Merge regulation data (update vs create logic)
   */
  private mergeRegulationData(existing: Regulation, newData: Partial<Regulation>): Partial<Regulation> {
    return {
      ...existing,
      ...newData,
      // Keep the original ID
      id: existing.id
    };
  }

  /**
   * Create office relationships
   */
  private async createOfficeRelationships(
    officeId: string, 
    relatedEntities: { projects?: string[], regulations?: string[] }
  ): Promise<void> {
    // This would create relationships in a relationships collection
    // For now, just log the relationships that would be created
    console.log(`Creating relationships for office ${officeId}:`, relatedEntities);
    
    // In a full implementation, you would:
    // 1. Create relationship documents in a relationships collection
    // 2. Update connection counts on related entities
    // 3. Create bidirectional relationships
  }

  /**
   * Update office relationships
   */
  private async updateOfficeRelationships(
    officeId: string, 
    relatedEntities: { projects?: string[], regulations?: string[] }
  ): Promise<void> {
    console.log(`Updating relationships for office ${officeId}:`, relatedEntities);
  }

  /**
   * Create project relationships
   */
  private async createProjectRelationships(
    projectId: string, 
    relatedEntities: { office?: string, regulations?: string[] }
  ): Promise<void> {
    console.log(`Creating relationships for project ${projectId}:`, relatedEntities);
  }

  /**
   * Update project relationships
   */
  private async updateProjectRelationships(
    projectId: string, 
    relatedEntities: { office?: string, regulations?: string[] }
  ): Promise<void> {
    console.log(`Updating relationships for project ${projectId}:`, relatedEntities);
  }

  /**
   * Create regulation relationships
   */
  private async createRegulationRelationships(
    regulationId: string, 
    relatedEntities: { offices?: string[], projects?: string[] }
  ): Promise<void> {
    console.log(`Creating relationships for regulation ${regulationId}:`, relatedEntities);
  }

  /**
   * Update regulation relationships
   */
  private async updateRegulationRelationships(
    regulationId: string, 
    relatedEntities: { offices?: string[], projects?: string[] }
  ): Promise<void> {
    console.log(`Updating relationships for regulation ${regulationId}:`, relatedEntities);
  }
}
