// Firestore Note Service - Handles real database operations for the Note System

import { FirestoreOperationsService } from '../renderer/src/services/firebase/firestoreOperations.ts';
import { Office, Project, Regulation, Workforce, Client, Technology, Financial, SupplyChain, LandData, CityData, ProjectData, CompanyStructure, DivisionPercentages, NewsArticle, PoliticalContext } from '../renderer/src/types/firestore';
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
      if (!officeData.name) {
        return {
          success: false,
          message: 'Office name is required',
          error: 'Cannot create office without name'
        };
      }
      
      console.log('Creating new office:', officeData.name);
      const result = await this.firestoreService.createOffice(officeData as any);
      
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
        if (!projectData.projectName || !projectData.status) {
          return {
            success: false,
            message: 'Project name and status are required',
            error: 'Cannot create project without required fields'
          };
        }
        const result = await this.firestoreService.createProject(projectData as any);
        
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
        if (!regulationData.name) {
          return {
            success: false,
            message: 'Regulation name is required',
            error: 'Cannot create regulation without name'
          };
        }
        const result = await this.firestoreService.createRegulation(regulationData as any);
        
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

  /**
   * Find existing workforce record for an office
   */
  public async findWorkforceForOffice(officeId: string): Promise<Workforce | null> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return null;
      }

      const result = await this.firestoreService.query<Workforce>('workforce', {
        filters: [
          { field: 'officeId', operator: '==', value: officeId }
        ],
        limit: 1
      });

      if (result.success && result.data && result.data.length > 0) {
        return result.data[0] as Workforce;
      }
      return null;
    } catch (error) {
      console.error('Error finding workforce for office:', error);
      return null;
    }
  }


  /**
   * Count unique employees for an office from the employees array
   */
  public async countUniqueEmployees(officeId: string): Promise<number> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return 0;
      }

      const workforce = await this.findWorkforceForOffice(officeId);
      
      if (workforce && workforce.employees && Array.isArray(workforce.employees)) {
        // Count unique employees by name
        const uniqueNames = new Set<string>();
        workforce.employees.forEach(employee => {
          if (employee.name && employee.name.trim()) {
            uniqueNames.add(employee.name.trim());
          }
        });
        return uniqueNames.size;
      }
      return 0;
    } catch (error) {
      console.error('Error counting unique employees:', error);
      return 0;
    }
  }

  /**
   * Update office employee count based on actual workforce records
   */
  public async updateOfficeEmployeeCount(officeId: string): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot update employee count without Firebase configuration'
        };
      }

      // Count unique individual employees
      const employeeCount = await this.countUniqueEmployees(officeId);
      
      // Get the office to update
      const officeResult = await this.firestoreService.get<Office>('offices', officeId);
      
      if (!officeResult.success || !officeResult.data) {
        return {
          success: false,
          message: 'Office not found',
          error: `Office with ID ${officeId} not found`
        };
      }

      const office = officeResult.data as Office;
      
      // Determine size category based on count if not already set
      let sizeCategory = office.size?.sizeCategory;
      if (!sizeCategory && employeeCount > 0) {
        if (employeeCount < 10) sizeCategory = 'boutique';
        else if (employeeCount < 50) sizeCategory = 'medium';
        else if (employeeCount < 200) sizeCategory = 'large';
        else sizeCategory = 'global';
      }

      // Update office with new employee count
      const updatedOffice: Partial<Office> = {
        ...office,
        size: {
          ...office.size,
          employeeCount: employeeCount,
          sizeCategory: sizeCategory || office.size?.sizeCategory || 'medium'
        }
      };

      const updateResult = await this.firestoreService.updateOffice(officeId, updatedOffice);
      
      if (updateResult.success) {
        return {
          success: true,
          message: `Office employee count updated to ${employeeCount}`,
          data: updateResult.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to update office employee count',
          error: updateResult.error
        };
      }
    } catch (error) {
      console.error('Error updating office employee count:', error);
      return {
        success: false,
        message: 'Failed to update employee count',
        error: (error as Error).message
      };
    }
  }

  /**
   * Add employees to workforce record for an office
   * Creates the workforce record if it doesn't exist, otherwise adds/updates employees in the array
   */
  public async addEmployeesToWorkforce(
    officeId: string,
    employees: Array<{
      name: string;
      role?: string;
      description?: string;
      expertise?: string[];
      location?: {
        city?: string;
        country?: string;
      };
    }>
  ): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!officeId) {
        return {
          success: false,
          message: 'Office ID is required',
          error: 'Cannot create workforce record without officeId'
        };
      }

      if (!employees || employees.length === 0) {
        return {
          success: false,
          message: 'No employees provided',
          error: 'Cannot add employees without employee data'
        };
      }

      // Find existing workforce record for this office
      const existingWorkforce = await this.findWorkforceForOffice(officeId);
      
      if (existingWorkforce) {
        // Update existing workforce record - add/update employees in array
        const currentEmployees = existingWorkforce.employees || [];
        const employeesMap = new Map<string, typeof employees[0]>();
        
        // Add existing employees to map - normalize field order
        currentEmployees.forEach(emp => {
          if (emp.name && emp.name.trim()) {
            // Normalize field order: name first, then description, preserve location (city and country)
            const normalizedEmp = {
              name: emp.name,
              ...(emp.description && { description: emp.description }),
              ...(emp.role && { role: emp.role }),
              ...(emp.expertise && emp.expertise.length > 0 && { expertise: emp.expertise }),
              ...(emp.location && (emp.location.city || emp.location.country) && {
                location: {
                  ...(emp.location.city && { city: emp.location.city }),
                  ...(emp.location.country && { country: emp.location.country })
                }
              })
            };
            employeesMap.set(emp.name.trim().toLowerCase(), normalizedEmp);
          }
        });
        
        // Add/update new employees
        let addedCount = 0;
        let updatedCount = 0;
        
        employees.forEach(newEmployee => {
          if (!newEmployee.name || !newEmployee.name.trim()) return;
          
          const key = newEmployee.name.trim().toLowerCase();
          const existingEmployee = employeesMap.get(key);
          
          if (existingEmployee) {
            // Update existing employee - merge data
            // Ensure field order: name first, then description, then other fields
            // Merge location: use new location if provided, otherwise keep existing
            const mergedLocation = newEmployee.location || existingEmployee.location;
            const mergedEmployee: typeof newEmployee = {
              name: existingEmployee.name,
              description: newEmployee.description || existingEmployee.description,
              role: newEmployee.role || existingEmployee.role,
              expertise: newEmployee.expertise && newEmployee.expertise.length > 0
                ? [...new Set([...(existingEmployee.expertise || []), ...newEmployee.expertise])]
                : existingEmployee.expertise,
              ...(mergedLocation && (mergedLocation.city || mergedLocation.country) && {
                location: {
                  ...(mergedLocation.city && { city: mergedLocation.city }),
                  ...(mergedLocation.country && { country: mergedLocation.country })
                }
              })
            };
            employeesMap.set(key, mergedEmployee);
            updatedCount++;
          } else {
            // Add new employee - normalize field order: name first, then description
            const normalizedEmployee: typeof newEmployee = {
              name: newEmployee.name,
              ...(newEmployee.description && { description: newEmployee.description }),
              ...(newEmployee.role && { role: newEmployee.role }),
              ...(newEmployee.expertise && newEmployee.expertise.length > 0 && { expertise: newEmployee.expertise }),
              ...(newEmployee.location && (newEmployee.location.city || newEmployee.location.country) && {
                location: {
                  ...(newEmployee.location.city && { city: newEmployee.location.city }),
                  ...(newEmployee.location.country && { country: newEmployee.location.country })
                }
              })
            };
            employeesMap.set(key, normalizedEmployee);
            addedCount++;
          }
        });
        
        // Normalize all employees to ensure field order: name first, then description, preserve location (city and country)
        const updatedEmployees = Array.from(employeesMap.values()).map(emp => ({
          name: emp.name,
          ...(emp.description && { description: emp.description }),
          ...(emp.role && { role: emp.role }),
          ...(emp.expertise && emp.expertise.length > 0 && { expertise: emp.expertise }),
          ...(emp.location && (emp.location.city || emp.location.country) && {
            location: {
              ...(emp.location.city && { city: emp.location.city }),
              ...(emp.location.country && { country: emp.location.country })
            }
          })
        }));
        
        const updatedData: Partial<Workforce> = {
          ...existingWorkforce,
          employees: updatedEmployees,
          updatedAt: new Date() as any
        };
        
        const updateResult = await this.firestoreService.update<Workforce>('workforce', existingWorkforce.id, updatedData);
        
        if (updateResult.success && updateResult.data) {
          // Update office employee count based on actual workforce records
          await this.updateOfficeEmployeeCount(officeId);
          
          return {
            success: true,
            message: `Workforce updated: ${addedCount} added, ${updatedCount} updated`,
            data: updateResult.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to update workforce record',
            error: updateResult.error
          };
        }
      } else {
        // Create new workforce record
        // Normalize employees to ensure field order: name first, then description, preserve location (city and country)
        const normalizedEmployees = employees.map(emp => ({
          name: emp.name,
          ...(emp.description && { description: emp.description }),
          ...(emp.role && { role: emp.role }),
          ...(emp.expertise && emp.expertise.length > 0 && { expertise: emp.expertise }),
          ...(emp.location && (emp.location.city || emp.location.country) && {
            location: {
              ...(emp.location.city && { city: emp.location.city }),
              ...(emp.location.country && { country: emp.location.country })
            }
          })
        }));
        
        // Don't include aggregate field if it's undefined (Firestore doesn't allow undefined values)
        const newWorkforceData: Partial<Workforce> = {
          id: `WF-${officeId}`,
          officeId: officeId,
          employees: normalizedEmployees,
          talentSources: [],
          partnerships: [],
          keyPersonnel: [],
          skillsMatrix: {}
        };
        
        console.log('Creating new workforce record for office:', officeId);
        const result = await this.firestoreService.create<Workforce>('workforce', newWorkforceData as any);
        
        if (result.success && result.data) {
          // Update office employee count based on actual workforce records
          await this.updateOfficeEmployeeCount(officeId);
          
          return {
            success: true,
            message: `Workforce record created with ${employees.length} employee(s)`,
            data: result.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to create workforce record',
            error: result.error
          };
        }
      }
    } catch (error) {
      console.error('Error adding employees to workforce:', error);
      return {
        success: false,
        message: 'Failed to add employees to workforce',
        error: (error as Error).message
      };
    }
  }

  /**
   * Update aggregate data in workforce record
   */
  public async updateWorkforceAggregate(
    officeId: string,
    aggregate: Workforce['aggregate']
  ): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot update without Firebase configuration'
        };
      }

      const existingWorkforce = await this.findWorkforceForOffice(officeId);
      
      if (existingWorkforce) {
        const updatedData: Partial<Workforce> = {
          ...existingWorkforce,
          aggregate: aggregate || existingWorkforce.aggregate,
          updatedAt: new Date() as any
        };
        
        const updateResult = await this.firestoreService.update<Workforce>('workforce', existingWorkforce.id, updatedData);
        
        if (updateResult.success && updateResult.data) {
          return {
            success: true,
            message: 'Aggregate data updated successfully',
            data: updateResult.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to update aggregate data',
            error: updateResult.error
          };
        }
      } else {
        // Create new workforce record with aggregate data
        // Only include aggregate if it's defined (Firestore doesn't allow undefined)
        const newWorkforceData: Partial<Workforce> = {
          id: `WF-${officeId}`,
          officeId: officeId,
          employees: [],
          talentSources: [],
          partnerships: [],
          keyPersonnel: [],
          skillsMatrix: {}
        };
        
        if (aggregate) {
          newWorkforceData.aggregate = aggregate;
        }
        
        const result = await this.firestoreService.create<Workforce>('workforce', newWorkforceData as any);
        
        if (result.success && result.data) {
          // Update office employee count based on actual workforce records
          await this.updateOfficeEmployeeCount(officeId);
          
          return {
            success: true,
            message: 'Workforce record created with aggregate data',
            data: result.data
          };
        } else {
          return {
            success: false,
            message: 'Failed to create workforce record',
            error: result.error
          };
        }
      }
    } catch (error) {
      console.error('Error updating workforce aggregate:', error);
      return {
        success: false,
        message: 'Failed to update aggregate data',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save client to Firestore
   */
  public async saveClient(clientData: Partial<Client>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!clientData.clientName) {
        return {
          success: false,
          message: 'Client name is required',
          error: 'Cannot create client without name'
        };
      }

      // Generate ID if not provided
      if (!clientData.id) {
        const nameCode = clientData.clientName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(4, 'X');
        const numberCode = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        clientData.id = `CLI-${nameCode}-${numberCode}`;
      }

      const result = await this.firestoreService.create<Client>('clients', clientData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `Client created successfully: ${clientData.clientName}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create client',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving client:', error);
      return {
        success: false,
        message: 'Failed to save client',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save technology to Firestore
   */
  public async saveTechnology(techData: Partial<Technology>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!techData.technologyName || !techData.officeId) {
        return {
          success: false,
          message: 'Technology name and office ID are required',
          error: 'Cannot create technology record without name and officeId'
        };
      }

      // Generate ID if not provided
      if (!techData.id) {
        const techCode = techData.technologyName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(3, 'X');
        const officeCode = techData.officeId.substring(0, 4);
        const numberCode = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        techData.id = `${officeCode}-TECH-${techCode}-${numberCode}`;
      }

      const result = await this.firestoreService.create<Technology>('technology', techData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `Technology created successfully: ${techData.technologyName}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create technology',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving technology:', error);
      return {
        success: false,
        message: 'Failed to save technology',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save financial record to Firestore
   */
  public async saveFinancial(financialData: Partial<Financial>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!financialData.officeId || !financialData.recordType || !financialData.amount) {
        return {
          success: false,
          message: 'Office ID, record type, and amount are required',
          error: 'Cannot create financial record without required fields'
        };
      }

      // Generate ID if not provided
      if (!financialData.id) {
        const officeCode = financialData.officeId.substring(0, 4);
        const typeCode = financialData.recordType.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        financialData.id = `${officeCode}-FIN-${typeCode}-${timestamp}`;
      }

      const result = await this.firestoreService.create<Financial>('financials', financialData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `Financial record created successfully: ${financialData.recordType}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create financial record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving financial:', error);
      return {
        success: false,
        message: 'Failed to save financial record',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save supply chain record to Firestore
   */
  public async saveSupplyChain(supplyData: Partial<SupplyChain>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!supplyData.supplierName) {
        return {
          success: false,
          message: 'Supplier name is required',
          error: 'Cannot create supply chain record without supplier name'
        };
      }

      // Generate ID if not provided
      if (!supplyData.id) {
        const nameCode = supplyData.supplierName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(4, 'X');
        const numberCode = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        supplyData.id = `SUP-${nameCode}-${numberCode}`;
      }

      const result = await this.firestoreService.create<SupplyChain>('supplyChain', supplyData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `Supply chain record created successfully: ${supplyData.supplierName}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create supply chain record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving supply chain:', error);
      return {
        success: false,
        message: 'Failed to save supply chain record',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save land data to Firestore
   */
  public async saveLandData(landData: Partial<LandData>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!landData.location || !landData.location.city || !landData.location.country) {
        return {
          success: false,
          message: 'Location is required',
          error: 'Cannot create land data record without location'
        };
      }

      // Generate ID if not provided
      if (!landData.id) {
        const cityCode = landData.location.city.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(3, 'X');
        const countryCode = landData.location.country.substring(0, 2).toUpperCase();
        const numberCode = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        landData.id = `LAND-${countryCode}${cityCode}-${numberCode}`;
      }

      const result = await this.firestoreService.create<LandData>('landData', landData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `Land data record created successfully`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create land data record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving land data:', error);
      return {
        success: false,
        message: 'Failed to save land data',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save city data to Firestore
   */
  public async saveCityData(cityData: Partial<CityData>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!cityData.cityId) {
        return {
          success: false,
          message: 'City ID is required',
          error: 'Cannot create city data record without cityId'
        };
      }

      // Generate ID if not provided
      if (!cityData.id) {
        cityData.id = `CITY-${cityData.cityId}`;
      }

      const result = await this.firestoreService.create<CityData>('cityData', cityData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: 'City data record created successfully',
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create city data record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving city data:', error);
      return {
        success: false,
        message: 'Failed to save city data',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save project data to Firestore
   */
  public async saveProjectData(projectData: Partial<ProjectData>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!projectData.projectId) {
        return {
          success: false,
          message: 'Project ID is required',
          error: 'Cannot create project data record without projectId'
        };
      }

      // Generate ID if not provided
      if (!projectData.id) {
        projectData.id = `PROJ-${projectData.projectId}`;
      }

      const result = await this.firestoreService.create<ProjectData>('projectData', projectData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Project data record created successfully',
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create project data record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving project data:', error);
      return {
        success: false,
        message: 'Failed to save project data',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save company structure to Firestore
   */
  public async saveCompanyStructure(structureData: Partial<CompanyStructure>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!structureData.officeId) {
        return {
          success: false,
          message: 'Office ID is required',
          error: 'Cannot create company structure record without officeId'
        };
      }

      // Generate ID if not provided
      if (!structureData.id) {
        structureData.id = `STRUCT-${structureData.officeId}`;
      }

      const result = await this.firestoreService.create<CompanyStructure>('companyStructure', structureData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Company structure record created successfully',
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create company structure record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving company structure:', error);
      return {
        success: false,
        message: 'Failed to save company structure',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save division percentages to Firestore
   */
  public async saveDivisionPercentages(divisionData: Partial<DivisionPercentages>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!divisionData.officeId || !divisionData.divisionType) {
        return {
          success: false,
          message: 'Office ID and division type are required',
          error: 'Cannot create division percentages record without required fields'
        };
      }

      // Generate ID if not provided
      if (!divisionData.id) {
        const typeCode = divisionData.divisionType.substring(0, 3).toUpperCase();
        const officeCode = divisionData.officeId.substring(0, 4);
        const period = divisionData.period?.year || new Date().getFullYear();
        divisionData.id = `${officeCode}-DIV-${typeCode}-${period}`;
      }

      const result = await this.firestoreService.create<DivisionPercentages>('divisionPercentages', divisionData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Division percentages record created successfully',
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create division percentages record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving division percentages:', error);
      return {
        success: false,
        message: 'Failed to save division percentages',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save news article to Firestore
   */
  public async saveNewsArticle(articleData: Partial<NewsArticle>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!articleData.title && !articleData.url) {
        return {
          success: false,
          message: 'Title or URL is required',
          error: 'Cannot create news article without title or URL'
        };
      }

      // Generate ID if not provided
      if (!articleData.id) {
        const titleCode = (articleData.title || 'article').substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, 'X').padEnd(6, 'X');
        const timestamp = Date.now().toString().slice(-8);
        articleData.id = `NEWS-${titleCode}-${timestamp}`;
      }

      const result = await this.firestoreService.create<NewsArticle>('newsArticles', articleData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `News article created successfully: ${articleData.title || 'Untitled'}`,
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create news article',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving news article:', error);
      return {
        success: false,
        message: 'Failed to save news article',
        error: (error as Error).message
      };
    }
  }

  /**
   * Save political context to Firestore
   */
  public async savePoliticalContext(politicalData: Partial<PoliticalContext>): Promise<NoteServiceResult> {
    try {
      if (!this.firestoreService.isFirebaseAvailable()) {
        return {
          success: false,
          message: 'Firebase not available',
          error: 'Cannot save to Firestore without Firebase configuration'
        };
      }

      if (!politicalData.jurisdiction || !politicalData.jurisdiction.country) {
        return {
          success: false,
          message: 'Jurisdiction with country is required',
          error: 'Cannot create political context record without jurisdiction'
        };
      }

      // Generate ID if not provided
      if (!politicalData.id) {
        const countryCode = politicalData.jurisdiction.country.substring(0, 2).toUpperCase();
        const levelCode = politicalData.jurisdiction.level?.substring(0, 1).toUpperCase() || 'N';
        const stateCode = politicalData.jurisdiction.state ? politicalData.jurisdiction.state.substring(0, 2).toUpperCase() : '';
        const cityCode = politicalData.jurisdiction.cityId ? politicalData.jurisdiction.cityId.substring(0, 3).toUpperCase() : '';
        const numberCode = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        politicalData.id = `POL-${countryCode}${levelCode}${stateCode}${cityCode}-${numberCode}`;
      }

      const result = await this.firestoreService.create<PoliticalContext>('politicalContext', politicalData as any);
      
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Political context record created successfully',
          data: result.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to create political context record',
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error saving political context:', error);
      return {
        success: false,
        message: 'Failed to save political context',
        error: (error as Error).message
      };
    }
  }
}
