// Document Templates Service - Easy access to document templates and validation

import { 
  CollectionName, 
  DocumentType,
  Office,
  Project,
  Regulation,
  Relationship,
  ACTIVE_COLLECTIONS
} from '../../types/firestore';
import { 
  getSchema,
  getTemplate,
  getRequiredFields,
  getOptionalFields,
  getValidationRules,
  isActiveCollection,
  isDormantCollection,
  COLLECTION_SCHEMAS
} from './schemas';
import { validateOfficeId } from '../../types/validation';
import { generateOfficeId } from './officeIdSystem';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// TEMPLATE SERVICE
// ============================================================================

export interface TemplateOptions {
  includeOptional?: boolean;
  includeDefaults?: boolean;
  validate?: boolean;
  generateIds?: boolean;
}

export interface TemplateResult<T extends DocumentType = DocumentType> {
  success: boolean;
  template?: Partial<T>;
  error?: string;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export class DocumentTemplateService {
  private static instance: DocumentTemplateService;

  private constructor() {}

  public static getInstance(): DocumentTemplateService {
    if (!DocumentTemplateService.instance) {
      DocumentTemplateService.instance = new DocumentTemplateService();
    }
    return DocumentTemplateService.instance;
  }

  // ============================================================================
  // BASIC TEMPLATE METHODS
  // ============================================================================

  /**
   * Get a document template for any collection
   */
  public async getTemplate<T extends DocumentType>(
    collectionName: CollectionName,
    options: TemplateOptions = {}
  ): Promise<TemplateResult<T>> {
    try {
      const { includeOptional = true, includeDefaults = true, validate = false, generateIds = false } = options;
      
      // Get base template
      let template = getTemplate(collectionName);
      
      // Generate IDs if requested
      if (generateIds) {
        template = await this.generateIdsForTemplate(collectionName, template);
      }
      
      // Include defaults if requested
      if (includeDefaults) {
        template = this.addDefaultsToTemplate(collectionName, template);
      }
      
      // Include optional fields if requested
      if (includeOptional) {
        template = this.addOptionalFieldsToTemplate(collectionName, template);
      }
      
      // Validate if requested
      let validation;
      if (validate) {
        validation = this.validateTemplate(collectionName, template);
      }
      
      return {
        success: true,
        template: template as Partial<T>,
        validation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      };
    }
  }

  /**
   * Get template for active collections only
   */
  public async getActiveTemplate<T extends DocumentType>(
    collectionName: CollectionName,
    options: TemplateOptions = {}
  ): Promise<TemplateResult<T>> {
    if (!isActiveCollection(collectionName)) {
      return {
        success: false,
        error: `Collection '${collectionName}' is dormant and not available for operations`,
        validation: {
          isValid: false,
          errors: [`Collection '${collectionName}' is dormant`],
          warnings: []
        }
      };
    }
    
    return this.getTemplate<T>(collectionName, options);
  }

  // ============================================================================
  // SPECIALIZED TEMPLATE METHODS
  // ============================================================================

  /**
   * Get office template with generated ID
   */
  public async getOfficeTemplate(
    country: string,
    city: string,
    options: TemplateOptions = {}
  ): Promise<TemplateResult<Office>> {
    try {
      const template = await this.getTemplate<Office>('offices', {
        ...options,
        generateIds: true,
        includeOptional: true,
        includeDefaults: true
      });
      
      if (!template.success || !template.template) {
        return template;
      }
      
      // Generate office ID
      const officeIdResult = await generateOfficeId({
        country,
        city,
        checkCollision: false
      });
      
      if (!officeIdResult.success) {
        return {
          success: false,
          error: `Failed to generate office ID: ${officeIdResult.error}`,
          validation: {
            isValid: false,
            errors: [`Failed to generate office ID: ${officeIdResult.error}`],
            warnings: []
          }
        };
      }
      
      // Update template with generated ID
      template.template.id = officeIdResult.officeId!;
      template.template.location = {
        headquarters: {
          city,
          country,
          coordinates: { latitude: 0, longitude: 0 }
        },
        otherOffices: []
      };
      
      return template;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      };
    }
  }

  /**
   * Get project template with office relationship
   */
  public async getProjectTemplate(
    officeId: string,
    projectName: string,
    options: TemplateOptions = {}
  ): Promise<TemplateResult<Project>> {
    try {
      const template = await this.getTemplate<Project>('projects', {
        ...options,
        generateIds: true,
        includeOptional: true,
        includeDefaults: true
      });
      
      if (!template.success || !template.template) {
        return template;
      }
      
      // Update template with project-specific data
      template.template.officeId = officeId;
      template.template.projectName = projectName;
      template.template.id = this.generateProjectId(projectName);
      
      return template;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      };
    }
  }

  /**
   * Get regulation template with jurisdiction
   */
  public async getRegulationTemplate(
    name: string,
    regulationType: string,
    jurisdiction: any,
    options: TemplateOptions = {}
  ): Promise<TemplateResult<Regulation>> {
    try {
      const template = await this.getTemplate<Regulation>('regulations', {
        ...options,
        generateIds: true,
        includeOptional: true,
        includeDefaults: true
      });
      
      if (!template.success || !template.template) {
        return template;
      }
      
      // Update template with regulation-specific data
      template.template.name = name;
      template.template.regulationType = regulationType;
      template.template.jurisdiction = jurisdiction;
      template.template.id = this.generateRegulationId(name, jurisdiction);
      
      return template;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      };
    }
  }

  /**
   * Get relationship template
   */
  public async getRelationshipTemplate(
    sourceEntity: { type: string; id: string },
    targetEntity: { type: string; id: string },
    relationshipType: string,
    options: TemplateOptions = {}
  ): Promise<TemplateResult<Relationship>> {
    try {
      const template = await this.getTemplate<Relationship>('relationships', {
        ...options,
        generateIds: true,
        includeOptional: true,
        includeDefaults: true
      });
      
      if (!template.success || !template.template) {
        return template;
      }
      
      // Update template with relationship-specific data
      template.template.sourceEntity = sourceEntity;
      template.template.targetEntity = targetEntity;
      template.template.relationshipType = relationshipType;
      template.template.id = this.generateRelationshipId(sourceEntity, targetEntity, relationshipType);
      
      return template;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      };
    }
  }

  // ============================================================================
  // BATCH TEMPLATE METHODS
  // ============================================================================

  /**
   * Get multiple templates at once
   */
  public async getMultipleTemplates(
    requests: Array<{
      collection: CollectionName;
      options?: TemplateOptions;
    }>
  ): Promise<Array<TemplateResult>> {
    const results = await Promise.all(
      requests.map(request => 
        this.getTemplate(request.collection, request.options)
      )
    );
    
    return results;
  }

  /**
   * Get templates for all active collections
   */
  public async getAllActiveTemplates(
    options: TemplateOptions = {}
  ): Promise<Record<CollectionName, TemplateResult>> {
    const results: Record<CollectionName, TemplateResult> = {} as any;
    
    for (const collectionName of ACTIVE_COLLECTIONS) {
      results[collectionName] = await this.getTemplate(collectionName, options);
    }
    
    return results;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate a document template
   */
  public validateTemplate(collectionName: CollectionName, template: Partial<DocumentType>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const schema = getSchema(collectionName);
      const requiredFields = getRequiredFields(collectionName);
      const validationRules = getValidationRules(collectionName);
      
      // Check required fields
      for (const field of requiredFields) {
        if (!(field in template) || template[field] === undefined || template[field] === null) {
          errors.push(`Required field '${String(field)}' is missing`);
        }
      }
      
      // Validate field values
      for (const [field, rules] of Object.entries(validationRules)) {
        const value = template[field as keyof DocumentType];
        
        if (value !== undefined && value !== null) {
          // Type validation
          if (rules.type && typeof value !== rules.type) {
            errors.push(`Field '${field}' must be of type ${rules.type}`);
          }
          
          // Length validation
          if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
            errors.push(`Field '${field}' must be at least ${rules.minLength} characters long`);
          }
          
          if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
            errors.push(`Field '${field}' must be no more than ${rules.maxLength} characters long`);
          }
          
          // Numeric validation
          if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
            errors.push(`Field '${field}' must be at least ${rules.min}`);
          }
          
          if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
            errors.push(`Field '${field}' must be no more than ${rules.max}`);
          }
          
          // Pattern validation
          if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
            errors.push(`Field '${field}' does not match required pattern`);
          }
          
          // Enum validation
          if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
          }
        }
      }
      
      // Special validation for office IDs
      if (collectionName === 'offices' && template.id) {
        const officeIdValidation = validateOfficeId(template.id as string);
        if (!officeIdValidation.isValid) {
          errors.push(`Invalid office ID format: ${officeIdValidation.errors.join(', ')}`);
        }
      }
      
      // Special validation for project office IDs
      if (collectionName === 'projects' && template.officeId) {
        const officeIdValidation = validateOfficeId(template.officeId as string);
        if (!officeIdValidation.isValid) {
          errors.push(`Invalid office ID in project: ${officeIdValidation.errors.join(', ')}`);
        }
      }
      
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate IDs for template
   */
  private async generateIdsForTemplate(
    collectionName: CollectionName,
    template: Partial<DocumentType>
  ): Promise<Partial<DocumentType>> {
    const updatedTemplate = { ...template };
    
    switch (collectionName) {
      case 'offices':
        // Office ID will be generated by the specialized method
        break;
        
      case 'projects':
        if (template.projectName) {
          updatedTemplate.id = this.generateProjectId(template.projectName as string);
        }
        break;
        
      case 'regulations':
        if (template.name && template.jurisdiction) {
          updatedTemplate.id = this.generateRegulationId(
            template.name as string,
            template.jurisdiction
          );
        }
        break;
        
      case 'relationships':
        if (template.sourceEntity && template.targetEntity && template.relationshipType) {
          updatedTemplate.id = this.generateRelationshipId(
            template.sourceEntity as any,
            template.targetEntity as any,
            template.relationshipType as string
          );
        }
        break;
        
      default:
        // Generate generic ID
        updatedTemplate.id = `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return updatedTemplate;
  }

  /**
   * Add default values to template
   */
  private addDefaultsToTemplate(
    collectionName: CollectionName,
    template: Partial<DocumentType>
  ): Partial<DocumentType> {
    const updatedTemplate = { ...template };
    
    // Add timestamps if not present
    if (!updatedTemplate.createdAt) {
      updatedTemplate.createdAt = Timestamp.now();
    }
    if (!updatedTemplate.updatedAt) {
      updatedTemplate.updatedAt = Timestamp.now();
    }
    
    return updatedTemplate;
  }

  /**
   * Add optional fields to template
   */
  private addOptionalFieldsToTemplate(
    collectionName: CollectionName,
    template: Partial<DocumentType>
  ): Partial<DocumentType> {
    const updatedTemplate = { ...template };
    const optionalFields = getOptionalFields(collectionName);
    
    // Add empty optional fields if not present
    for (const field of optionalFields) {
      if (!(field in updatedTemplate)) {
        (updatedTemplate as any)[field] = this.getDefaultValueForField(field);
      }
    }
    
    return updatedTemplate;
  }

  /**
   * Get default value for a field
   */
  private getDefaultValueForField(field: string): any {
    switch (field) {
      case 'specializations':
      case 'notableWorks':
      case 'projects':
      case 'activeOffices':
      case 'activeProjects':
      case 'regulations':
      case 'evidence':
      case 'tags':
      case 'sources':
      case 'relatedProjects':
      case 'applicableRegulations':
      case 'trends':
      case 'newsArticles':
        return [];
        
      case 'connectionCounts':
        return {
          totalProjects: 0,
          activeProjects: 0,
          clients: 0,
          competitors: 0,
          suppliers: 0
        };
        
      case 'size':
        return {
          employeeCount: 0,
          sizeCategory: 'boutique',
          annualRevenue: 0
        };
        
      case 'financial':
        return {
          budget: 0,
          currency: 'USD',
          actualCost: 0
        };
        
      case 'details':
        return {
          projectType: '',
          size: 0,
          description: ''
        };
        
      case 'location':
        return {
          city: '',
          country: '',
          coordinates: { latitude: 0, longitude: 0 }
        };
        
      case 'timeline':
        return {
          startDate: Timestamp.now(),
          expectedCompletion: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
        };
        
      default:
        return '';
    }
  }

  /**
   * Generate project ID from name
   */
  private generateProjectId(projectName: string): string {
    return projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
  }

  /**
   * Generate regulation ID
   */
  private generateRegulationId(name: string, jurisdiction: any): string {
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const country = jurisdiction.country?.toLowerCase() || 'unknown';
    const year = new Date().getFullYear();
    return `${country}-${nameSlug}-${year}`;
  }

  /**
   * Generate relationship ID
   */
  private generateRelationshipId(
    sourceEntity: { type: string; id: string },
    targetEntity: { type: string; id: string },
    relationshipType: string
  ): string {
    const source = `${sourceEntity.type}-${sourceEntity.id}`;
    const target = `${targetEntity.type}-${targetEntity.id}`;
    const type = relationshipType.toLowerCase();
    return `${source}-${type}-${target}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const documentTemplateService = DocumentTemplateService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function getDocumentTemplate<T extends DocumentType>(
  collectionName: CollectionName,
  options?: TemplateOptions
): Promise<TemplateResult<T>> {
  return documentTemplateService.getTemplate<T>(collectionName, options);
}

export async function getOfficeTemplate(
  country: string,
  city: string,
  options?: TemplateOptions
): Promise<TemplateResult<Office>> {
  return documentTemplateService.getOfficeTemplate(country, city, options);
}

export async function getProjectTemplate(
  officeId: string,
  projectName: string,
  options?: TemplateOptions
): Promise<TemplateResult<Project>> {
  return documentTemplateService.getProjectTemplate(officeId, projectName, options);
}

export async function getRegulationTemplate(
  name: string,
  regulationType: string,
  jurisdiction: any,
  options?: TemplateOptions
): Promise<TemplateResult<Regulation>> {
  return documentTemplateService.getRegulationTemplate(name, regulationType, jurisdiction, options);
}

export async function getRelationshipTemplate(
  sourceEntity: { type: string; id: string },
  targetEntity: { type: string; id: string },
  relationshipType: string,
  options?: TemplateOptions
): Promise<TemplateResult<Relationship>> {
  return documentTemplateService.getRelationshipTemplate(sourceEntity, targetEntity, relationshipType, options);
}

export function validateDocumentTemplate(
  collectionName: CollectionName,
  template: Partial<DocumentType>
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  return documentTemplateService.validateTemplate(collectionName, template);
}
