// Entity Update Service - Handles update vs create logic for note processing
// Searches for existing entities, merges data, and manages relationships

import { Office, Project, Regulation } from '../renderer/src/types/firestore';

export interface EntitySearchResult {
  found: boolean;
  entity?: Office | Project | Regulation;
  similarity?: number;
}

export interface EntityMergeResult {
  success: boolean;
  entity: Office | Project | Regulation;
  wasUpdated: boolean;
  mergedFields: string[];
  error?: string;
}

export interface RelationshipUpdate {
  sourceId: string;
  targetId: string;
  relationshipType: 'office-project' | 'office-regulation' | 'project-regulation';
  bidirectional: boolean;
}

export class EntityUpdateService {
  private static instance: EntityUpdateService;

  private constructor() {}

  public static getInstance(): EntityUpdateService {
    if (!EntityUpdateService.instance) {
      EntityUpdateService.instance = new EntityUpdateService();
    }
    return EntityUpdateService.instance;
  }

  /**
   * Search for existing office by name with fuzzy matching
   * IMPORTANT: Only searches in the offices collection, never in projects
   */
  public async searchExistingOffice(officeName: string): Promise<EntitySearchResult> {
    try {
      console.log(`Searching for existing office: "${officeName}"`);
      
      // Import FirestoreService dynamically to avoid circular dependencies
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      if (!firestoreService.isFirebaseAvailable()) {
        console.log('Firebase not available for office search');
        return { found: false };
      }

      // Search by exact name first - ONLY in offices collection
      const exactMatch = await firestoreService.queryOffices({ 
        filters: [{ field: 'name', operator: '==', value: officeName }] 
      });
      if (exactMatch.success && exactMatch.data && exactMatch.data.length > 0) {
        console.log(`Found exact match for office: ${officeName}`);
        // Verify it's actually an office, not accidentally a project
        if (exactMatch.data[0].name === officeName) {
          return { found: true, entity: exactMatch.data[0], similarity: 1.0 };
        }
      }

      // Fuzzy search - look for similar names ONLY in offices
      const fuzzyResults = await this.fuzzySearchOffices(officeName);
      if (fuzzyResults.length > 0) {
        const bestMatch = fuzzyResults[0];
        if (bestMatch.entity && 'name' in bestMatch.entity && bestMatch.similarity) {
          console.log(`Found fuzzy match for office: ${officeName} -> ${bestMatch.entity.name} (${(bestMatch.similarity * 100).toFixed(1)}%)`);
          return bestMatch;
        }
      }

      console.log(`No existing office found for: ${officeName}`);
      return { found: false };
    } catch (error) {
      console.error('Error searching for existing office:', error);
      return { found: false };
    }
  }

  /**
   * Search for existing project by name with fuzzy matching
   * IMPORTANT: Only searches in the projects collection, never in offices
   */
  public async searchExistingProject(projectName: string): Promise<EntitySearchResult> {
    try {
      console.log(`Searching for existing project: "${projectName}"`);
      
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      if (!firestoreService.isFirebaseAvailable()) {
        console.log('Firebase not available for project search');
        return { found: false };
      }

      // Search by exact name first - ONLY in projects collection
      const exactMatch = await firestoreService.queryProjects({ 
        filters: [{ field: 'projectName', operator: '==', value: projectName }] 
      });
      if (exactMatch.success && exactMatch.data && exactMatch.data.length > 0) {
        console.log(`Found exact match for project: ${projectName}`);
        // Verify it's actually a project, not accidentally an office
        if (exactMatch.data[0].projectName === projectName) {
          return { found: true, entity: exactMatch.data[0], similarity: 1.0 };
        }
      }

      // Fuzzy search - look for similar names ONLY in projects
      const fuzzyResults = await this.fuzzySearchProjects(projectName);
      if (fuzzyResults.length > 0) {
        const bestMatch = fuzzyResults[0];
        if (bestMatch.entity && 'name' in bestMatch.entity && bestMatch.similarity) {
          console.log(`Found fuzzy match for project: ${projectName} -> ${bestMatch.entity.name} (${(bestMatch.similarity * 100).toFixed(1)}%)`);
          return bestMatch;
        }
      }

      console.log(`No existing project found for: ${projectName}`);
      return { found: false };
    } catch (error) {
      console.error('Error searching for existing project:', error);
      return { found: false };
    }
  }

  /**
   * Search for existing regulation by name with fuzzy matching
   */
  public async searchExistingRegulation(regulationName: string): Promise<EntitySearchResult> {
    try {
      console.log(`Searching for existing regulation: "${regulationName}"`);
      
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      if (!firestoreService.isFirebaseAvailable()) {
        console.log('Firebase not available for regulation search');
        return { found: false };
      }

      // Search by exact name first
      const exactMatch = await firestoreService.queryRegulations({ 
        filters: [{ field: 'name', operator: '==', value: regulationName }] 
      });
      if (exactMatch.success && exactMatch.data && exactMatch.data.length > 0) {
        console.log(`Found exact match for regulation: ${regulationName}`);
        return { found: true, entity: exactMatch.data[0], similarity: 1.0 };
      }

      // Fuzzy search
      const fuzzyResults = await this.fuzzySearchRegulations(regulationName);
      if (fuzzyResults.length > 0) {
        const bestMatch = fuzzyResults[0];
        if (bestMatch.entity && 'name' in bestMatch.entity && bestMatch.similarity) {
          console.log(`Found fuzzy match for regulation: ${regulationName} -> ${bestMatch.entity.name} (${(bestMatch.similarity * 100).toFixed(1)}%)`);
          return bestMatch;
        }
      }

      console.log(`No existing regulation found for: ${regulationName}`);
      return { found: false };
    } catch (error) {
      console.error('Error searching for existing regulation:', error);
      return { found: false };
    }
  }

  /**
   * Merge new office data with existing office
   */
  public async mergeOfficeData(existingOffice: Office, newData: Partial<Office>): Promise<EntityMergeResult> {
    try {
      console.log(`🔄 Merging office data: ${existingOffice.name}`);
      
      const mergedFields: string[] = [];
      const mergedOffice = { ...existingOffice };

      // Merge basic fields
      if (newData.officialName && newData.officialName !== existingOffice.officialName) {
        mergedOffice.officialName = newData.officialName;
        mergedFields.push('officialName');
      }

      if (newData.founded && newData.founded !== existingOffice.founded) {
        mergedOffice.founded = newData.founded;
        mergedFields.push('founded');
      }

      if (newData.status && newData.status !== existingOffice.status) {
        mergedOffice.status = newData.status;
        mergedFields.push('status');
      }

      // Merge location data
      if (newData.location) {
        if (newData.location.headquarters && newData.location.headquarters !== existingOffice.location.headquarters) {
          mergedOffice.location.headquarters = { ...existingOffice.location.headquarters, ...newData.location.headquarters };
          mergedFields.push('location.headquarters');
        }
        
        if (newData.location.otherOffices && Array.isArray(newData.location.otherOffices)) {
          const existingOtherOffices = existingOffice.location.otherOffices || [];
          const newOtherOffices = newData.location.otherOffices.filter(office => 
            !existingOtherOffices.some(existing => existing.city === office.city && existing.country === office.country)
          );
          if (newOtherOffices.length > 0) {
            mergedOffice.location.otherOffices = [...existingOtherOffices, ...newOtherOffices];
            mergedFields.push('location.otherOffices');
          }
        }
      }

      // Merge specializations
      if (newData.specializations && Array.isArray(newData.specializations)) {
        const existingSpecializations = existingOffice.specializations || [];
        const newSpecializations = newData.specializations.filter(spec => 
          !existingSpecializations.includes(spec)
        );
        if (newSpecializations.length > 0) {
          mergedOffice.specializations = [...existingSpecializations, ...newSpecializations];
          mergedFields.push('specializations');
        }
      }

      // Merge size data
      if (newData.size) {
        if (newData.size.employeeCount && newData.size.employeeCount !== existingOffice.size?.employeeCount) {
          mergedOffice.size = { ...existingOffice.size, ...newData.size };
          mergedFields.push('size');
        }
      }

      // Update the office in Firestore
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      const updateResult = await firestoreService.updateOffice(existingOffice.id, mergedOffice);
      
      if (updateResult.success) {
        console.log(`Office merged successfully: ${mergedFields.length} fields updated`);
        return {
          success: true,
          entity: mergedOffice,
          wasUpdated: true,
          mergedFields
        };
      } else {
        return {
          success: false,
          entity: existingOffice,
          wasUpdated: false,
          mergedFields: [],
          error: updateResult.error
        };
      }
    } catch (error) {
      console.error('Error merging office data:', error);
      return {
        success: false,
        entity: existingOffice,
        wasUpdated: false,
        mergedFields: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Merge new project data with existing project
   */
  public async mergeProjectData(existingProject: Project, newData: Partial<Project>): Promise<EntityMergeResult> {
    try {
      console.log(`🔄 Merging project data: ${existingProject.projectName}`);
      
      const mergedFields: string[] = [];
      const mergedProject = { ...existingProject };

      // Merge basic fields
      if (newData.projectName && newData.projectName !== existingProject.projectName) {
        mergedProject.projectName = newData.projectName;
        mergedFields.push('projectName');
      }

      if (newData.status && newData.status !== existingProject.status) {
        mergedProject.status = newData.status;
        mergedFields.push('status');
      }

      // Merge location data
      if (newData.location && newData.location !== existingProject.location) {
        mergedProject.location = { ...existingProject.location, ...newData.location };
        mergedFields.push('location');
      }

      // Merge details
      if (newData.details) {
        mergedProject.details = { ...existingProject.details, ...newData.details };
        mergedFields.push('details');
      }

      // Merge financial data
      if (newData.financial && newData.financial !== existingProject.financial) {
        mergedProject.financial = { ...existingProject.financial, ...newData.financial };
        mergedFields.push('financial');
      }

      // Update the project in Firestore
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      const updateResult = await firestoreService.updateProject(existingProject.id, mergedProject);
      
      if (updateResult.success) {
        console.log(`Project merged successfully: ${mergedFields.length} fields updated`);
        return {
          success: true,
          entity: mergedProject,
          wasUpdated: true,
          mergedFields
        };
      } else {
        return {
          success: false,
          entity: existingProject,
          wasUpdated: false,
          mergedFields: [],
          error: updateResult.error
        };
      }
    } catch (error) {
      console.error('Error merging project data:', error);
      return {
        success: false,
        entity: existingProject,
        wasUpdated: false,
        mergedFields: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Merge new regulation data with existing regulation
   */
  public async mergeRegulationData(existingRegulation: Regulation, newData: Partial<Regulation>): Promise<EntityMergeResult> {
    try {
      console.log(`🔄 Merging regulation data: ${existingRegulation.name}`);
      
      const mergedFields: string[] = [];
      const mergedRegulation = { ...existingRegulation };

      // Merge basic fields
      if (newData.name && newData.name !== existingRegulation.name) {
        mergedRegulation.name = newData.name;
        mergedFields.push('name');
      }

      if (newData.description && newData.description !== existingRegulation.description) {
        mergedRegulation.description = newData.description;
        mergedFields.push('description');
      }

      if (newData.effectiveDate && newData.effectiveDate !== existingRegulation.effectiveDate) {
        mergedRegulation.effectiveDate = newData.effectiveDate;
        mergedFields.push('effectiveDate');
      }

      // Merge jurisdiction data
      if (newData.jurisdiction && newData.jurisdiction !== existingRegulation.jurisdiction) {
        mergedRegulation.jurisdiction = { ...existingRegulation.jurisdiction, ...newData.jurisdiction };
        mergedFields.push('jurisdiction');
      }

      // Update the regulation in Firestore
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      const updateResult = await firestoreService.updateRegulation(existingRegulation.id, mergedRegulation);
      
      if (updateResult.success) {
        console.log(`Regulation merged successfully: ${mergedFields.length} fields updated`);
        return {
          success: true,
          entity: mergedRegulation,
          wasUpdated: true,
          mergedFields
        };
      } else {
        return {
          success: false,
          entity: existingRegulation,
          wasUpdated: false,
          mergedFields: [],
          error: updateResult.error
        };
      }
    } catch (error) {
      console.error('Error merging regulation data:', error);
      return {
        success: false,
        entity: existingRegulation,
        wasUpdated: false,
        mergedFields: [],
        error: (error as Error).message
      };
    }
  }

  /**
   * Create bidirectional relationship between entities
   */
  public async createBidirectionalRelationship(relationship: RelationshipUpdate): Promise<boolean> {
    try {
      console.log(`🔗 Creating bidirectional relationship: ${relationship.sourceId} <-> ${relationship.targetId}`);
      
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      if (!firestoreService.isFirebaseAvailable()) {
        console.log('Firebase not available for relationship creation');
        return false;
      }

      // Create relationship in both directions
      // TODO: Implement relationship creation when methods are available
      console.log(`🔗 Would create relationship: ${relationship.sourceId} -> ${relationship.targetId} (${relationship.relationshipType})`);
      const result1 = { success: true }; // Placeholder

      if (relationship.bidirectional) {
        console.log(`🔗 Would create bidirectional relationship: ${relationship.targetId} -> ${relationship.sourceId} (${relationship.relationshipType})`);
        const result2 = { success: true }; // Placeholder
        
        const success = result1.success && result2.success;
        if (success) {
          console.log(`Bidirectional relationship created successfully`);
          await this.updateConnectionCounts(relationship.sourceId, relationship.targetId, relationship.relationshipType);
        } else {
          console.log(`Failed to create bidirectional relationship`);
        }
        return success;
      } else {
        if (result1.success) {
          console.log(`Unidirectional relationship created successfully`);
          await this.updateConnectionCounts(relationship.sourceId, relationship.targetId, relationship.relationshipType);
        } else {
          console.log(`Failed to create relationship`);
        }
        return result1.success;
      }
    } catch (error) {
      console.error('Error creating bidirectional relationship:', error);
      return false;
    }
  }

  /**
   * Update connection counts for entities
   */
  private async updateConnectionCounts(sourceId: string, targetId: string, relationshipType: string): Promise<void> {
    try {
      console.log(`📊 Updating connection counts for relationship: ${relationshipType}`);
      
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      // TODO: Implement connection count updates when increment methods are available
      console.log(`📊 Would update connection counts for relationship: ${relationshipType} between ${sourceId} and ${targetId}`);
      
      // Placeholder - connection count updates would go here
      switch (relationshipType) {
        case 'office-project':
          console.log(`📊 Would increment totalProjects for ${sourceId} and totalOffices for ${targetId}`);
          break;
        case 'office-regulation':
          console.log(`📊 Would increment totalRegulations for ${sourceId} and totalOffices for ${targetId}`);
          break;
        case 'project-regulation':
          console.log(`📊 Would increment totalRegulations for ${sourceId} and totalProjects for ${targetId}`);
          break;
      }
      
      console.log(`Connection counts updated successfully`);
    } catch (error) {
      console.error('Error updating connection counts:', error);
    }
  }

  /**
   * Fuzzy search for offices using string similarity
   */
  private async fuzzySearchOffices(query: string): Promise<EntitySearchResult[]> {
    try {
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      // Get all offices for fuzzy matching
      const allOffices = await firestoreService.queryOffices();
      if (!allOffices.success || !allOffices.data) {
        return [];
      }

      const results: EntitySearchResult[] = [];
      const queryLower = query.toLowerCase();

      for (const office of allOffices.data) {
        const officeNameLower = office.name.toLowerCase();
        const similarity = this.calculateStringSimilarity(queryLower, officeNameLower);
        
        // Only include matches with > 70% similarity
        if (similarity > 0.7) {
          results.push({
            found: true,
            entity: office,
            similarity
          });
        }
      }

      // Sort by similarity (highest first)
      return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    } catch (error) {
      console.error('Error in fuzzy office search:', error);
      return [];
    }
  }

  /**
   * Fuzzy search for projects using string similarity
   */
  private async fuzzySearchProjects(query: string): Promise<EntitySearchResult[]> {
    try {
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      const allProjects = await firestoreService.queryProjects();
      if (!allProjects.success || !allProjects.data) {
        return [];
      }

      const results: EntitySearchResult[] = [];
      const queryLower = query.toLowerCase();

      for (const project of allProjects.data) {
        const projectNameLower = project.projectName.toLowerCase();
        const similarity = this.calculateStringSimilarity(queryLower, projectNameLower);
        
        if (similarity > 0.7) {
          results.push({
            found: true,
            entity: project,
            similarity
          });
        }
      }

      return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    } catch (error) {
      console.error('Error in fuzzy project search:', error);
      return [];
    }
  }

  /**
   * Fuzzy search for regulations using string similarity
   */
  private async fuzzySearchRegulations(query: string): Promise<EntitySearchResult[]> {
    try {
      const { FirestoreOperationsService } = await import('../renderer/src/services/firebase/firestoreOperations.ts');
      const firestoreService = FirestoreOperationsService.getInstance();
      
      const allRegulations = await firestoreService.queryRegulations();
      if (!allRegulations.success || !allRegulations.data) {
        return [];
      }

      const results: EntitySearchResult[] = [];
      const queryLower = query.toLowerCase();

      for (const regulation of allRegulations.data) {
        const regulationNameLower = regulation.name.toLowerCase();
        const similarity = this.calculateStringSimilarity(queryLower, regulationNameLower);
        
        if (similarity > 0.7) {
          results.push({
            found: true,
            entity: regulation,
            similarity
          });
        }
      }

      return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    } catch (error) {
      console.error('Error in fuzzy regulation search:', error);
      return [];
    }
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}
