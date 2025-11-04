// Validation schemas and utility types for Firestore documents

import { 
  CollectionName, 
  DocumentType, 
  Office, 
  Project, 
  Regulation, 
  Relationship,
  ACTIVE_COLLECTIONS 
} from './firestore';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => boolean;
  message: string;
  required?: boolean;
}

// ============================================================================
// OFFICE ID SYSTEM VALIDATION
// ============================================================================

export interface OfficeIdValidation {
  isValid: boolean;
  format: 'CCccNNN';
  country: string;
  city: string;
  number: string;
  errors: string[];
}

/**
 * Validate CCccNNN office ID format
 * CC = ISO 3166-1 alpha-2 country code (2 letters)
 * cc = First 2 letters of city (2 letters)  
 * NNN = Random 3-digit number (100-999)
 */
export function validateOfficeId(officeId: string): OfficeIdValidation {
  const errors: string[] = [];
  
  // Check length
  if (officeId.length !== 7) {
    errors.push('Office ID must be exactly 7 characters');
    return {
      isValid: false,
      format: 'CCccNNN',
      country: '',
      city: '',
      number: '',
      errors
    };
  }
  
  // Extract parts
  const country = officeId.substring(0, 2).toUpperCase();
  const city = officeId.substring(2, 4).toUpperCase();
  const number = officeId.substring(4, 7);
  
  // Validate country code (basic check for 2 letters)
  if (!/^[A-Z]{2}$/.test(country)) {
    errors.push('Country code must be 2 uppercase letters');
  }
  
  // Validate city code (basic check for 2 letters)
  if (!/^[A-Z]{2}$/.test(city)) {
    errors.push('City code must be 2 uppercase letters');
  }
  
  // Validate number (3 digits, 100-999)
  const num = parseInt(number, 10);
  if (!/^\d{3}$/.test(number) || num < 100 || num > 999) {
    errors.push('Number must be 3 digits between 100-999');
  }
  
  return {
    isValid: errors.length === 0,
    format: 'CCccNNN',
    country,
    city,
    number,
    errors
  };
}

// ============================================================================
// DOCUMENT VALIDATION SCHEMAS
// ============================================================================

export const OFFICE_VALIDATION_RULES: ValidationRule<Office>[] = [
  {
    field: 'id',
    validator: (value: string) => validateOfficeId(value).isValid,
    message: 'Invalid office ID format (must be CCccNNN)',
    required: true
  },
  {
    field: 'name',
    validator: (value: string) => typeof value === 'string' && value.length > 0,
    message: 'Office name is required',
    required: true
  },
  {
    field: 'founded',
    validator: (value: number) => typeof value === 'number' && value >= 1800 && value <= new Date().getFullYear(),
    message: 'Founded year must be between 1800 and current year',
    required: true
  },
  {
    field: 'status',
    validator: (value: string) => ['active', 'acquired', 'dissolved'].includes(value),
    message: 'Status must be active, acquired, or dissolved',
    required: true
  },
  {
    field: 'size',
    validator: (value: any) => {
      // Size is completely optional - always return true
      return true;
    },
    message: 'Size must have valid employeeCount and sizeCategory',
    required: false
  }
];

export const PROJECT_VALIDATION_RULES: ValidationRule<Project>[] = [
  {
    field: 'projectName',
    validator: (value: string) => typeof value === 'string' && value.length > 0,
    message: 'Project name is required',
    required: true
  },
  {
    field: 'officeId',
    validator: (value: string) => validateOfficeId(value).isValid,
    message: 'Invalid office ID format',
    required: true
  },
  {
    field: 'status',
    validator: (value: string) => ['concept', 'planning', 'construction', 'completed', 'cancelled'].includes(value),
    message: 'Status must be concept, planning, construction, completed, or cancelled',
    required: true
  },
  {
    field: 'timeline',
    validator: (value: any) => {
      return value && 
             value.startDate && 
             value.expectedCompletion;
    },
    message: 'Timeline must have startDate and expectedCompletion',
    required: true
  }
];

export const REGULATION_VALIDATION_RULES: ValidationRule<Regulation>[] = [
  {
    field: 'name',
    validator: (value: string) => typeof value === 'string' && value.length > 0,
    message: 'Regulation name is required',
    required: true
  },
  {
    field: 'regulationType',
    validator: (value: string) => ['zoning', 'building-code', 'environmental', 'safety', 'accessibility', 'fire-safety', 'energy'].includes(value),
    message: 'Invalid regulation type',
    required: true
  },
  {
    field: 'jurisdiction',
    validator: (value: any) => {
      return value && 
             ['international', 'national', 'state', 'city'].includes(value.level) &&
             typeof value.country === 'string' &&
             value.country.length === 2;
    },
    message: 'Jurisdiction must have valid level and country code',
    required: true
  },
  {
    field: 'effectiveDate',
    validator: (value: any) => value && value.toDate,
    message: 'Effective date is required',
    required: true
  }
];

export const RELATIONSHIP_VALIDATION_RULES: ValidationRule<Relationship>[] = [
  {
    field: 'sourceEntity',
    validator: (value: any) => {
      return value && 
             typeof value.type === 'string' && 
             typeof value.id === 'string' &&
             value.type.length > 0 &&
             value.id.length > 0;
    },
    message: 'Source entity must have valid type and id',
    required: true
  },
  {
    field: 'targetEntity',
    validator: (value: any) => {
      return value && 
             typeof value.type === 'string' && 
             typeof value.id === 'string' &&
             value.type.length > 0 &&
             value.id.length > 0;
    },
    message: 'Target entity must have valid type and id',
    required: true
  },
  {
    field: 'relationshipType',
    validator: (value: string) => ['collaborator', 'competitor', 'client-of', 'supplier-to', 'influenced-by', 'acquired', 'merged', 'partner', 'subcontractor'].includes(value),
    message: 'Invalid relationship type',
    required: true
  }
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateDocument<T extends DocumentType>(
  document: Partial<T>,
  rules: ValidationRule<T>[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const rule of rules) {
    const value = document[rule.field];
    
    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${String(rule.field)} is required`);
      continue;
    }
    
    // Skip validation if field is not required and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Validate field value
    if (!rule.validator(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateOffice(office: Partial<Office>): ValidationResult {
  return validateDocument(office, OFFICE_VALIDATION_RULES);
}

export function validateProject(project: Partial<Project>): ValidationResult {
  return validateDocument(project, PROJECT_VALIDATION_RULES);
}

export function validateRegulation(regulation: Partial<Regulation>): ValidationResult {
  return validateDocument(regulation, REGULATION_VALIDATION_RULES);
}

export function validateRelationship(relationship: Partial<Relationship>): ValidationResult {
  return validateDocument(relationship, RELATIONSHIP_VALIDATION_RULES);
}

// ============================================================================
// COLLECTION VALIDATION
// ============================================================================

export function validateCollectionName(collectionName: string): boolean {
  return Object.keys(ACTIVE_COLLECTIONS).includes(collectionName);
}

export function getValidationRulesForCollection(collectionName: CollectionName): ValidationRule<any>[] {
  switch (collectionName) {
    case 'offices':
      return OFFICE_VALIDATION_RULES;
    case 'projects':
      return PROJECT_VALIDATION_RULES;
    case 'regulations':
      return REGULATION_VALIDATION_RULES;
    case 'relationships':
      return RELATIONSHIP_VALIDATION_RULES;
    default:
      return [];
  }
}

// ============================================================================
// UTILITY VALIDATION FUNCTIONS
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'];
  return validCurrencies.includes(currency.toUpperCase());
}

export function isValidCountryCode(countryCode: string): boolean {
  return /^[A-Z]{2}$/.test(countryCode) && countryCode.length === 2;
}

export function isValidCityCode(cityCode: string): boolean {
  return /^[A-Z]{2}$/.test(cityCode) && cityCode.length === 2;
}

// ============================================================================
// DATA SANITIZATION
// ============================================================================

export function sanitizeString(value: any): string {
  if (typeof value !== 'string') {
    return String(value || '');
  }
  return value.trim();
}

export function sanitizeNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

export function sanitizeArray(value: any): any[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return value ? [value] : [];
}

// ============================================================================
// DOCUMENT TRANSFORMATION
// ============================================================================

export interface DocumentTransform {
  beforeSave?: (doc: any) => any;
  afterLoad?: (doc: any) => any;
}

export const DOCUMENT_TRANSFORMS: Record<CollectionName, DocumentTransform> = {
  // Office transforms
  offices: {
    beforeSave: (doc: Partial<Office>) => ({
      ...doc,
      id: doc.id?.toUpperCase(),
      name: sanitizeString(doc.name),
      officialName: sanitizeString(doc.officialName),
      founded: sanitizeNumber(doc.founded),
      specializations: sanitizeArray(doc.specializations),
      notableWorks: sanitizeArray(doc.notableWorks)
    }),
    afterLoad: (doc: Office) => ({
      ...doc,
      id: doc.id.toUpperCase()
    })
  },
  
  // Project transforms
  projects: {
    beforeSave: (doc: Partial<Project>) => ({
      ...doc,
      projectName: sanitizeString(doc.projectName),
      officeId: doc.officeId?.toUpperCase(),
      cityId: sanitizeString(doc.cityId),
      clientId: sanitizeString(doc.clientId),
      details: {
        ...doc.details,
        projectType: sanitizeString(doc.details?.projectType),
        description: sanitizeString(doc.details?.description)
      }
    })
  },
  
  // Regulation transforms
  regulations: {
    beforeSave: (doc: Partial<Regulation>) => ({
      ...doc,
      name: sanitizeString(doc.name),
      description: sanitizeString(doc.description),
      jurisdiction: {
        ...doc.jurisdiction,
        country: doc.jurisdiction?.country?.toUpperCase(),
        countryName: sanitizeString(doc.jurisdiction?.countryName)
      }
    })
  },
  
  // Relationship transforms
  relationships: {
    beforeSave: (doc: Partial<Relationship>) => ({
      ...doc,
      sourceEntity: {
        ...doc.sourceEntity,
        type: sanitizeString(doc.sourceEntity?.type),
        id: sanitizeString(doc.sourceEntity?.id)
      },
      targetEntity: {
        ...doc.targetEntity,
        type: sanitizeString(doc.targetEntity?.type),
        id: sanitizeString(doc.targetEntity?.id)
      },
      tags: sanitizeArray(doc.tags)
    })
  },
  
  // Dormant collections (no transforms yet)
  cities: {},
  archHistory: {},
  networkGraph: {},
  clients: {},
  workforce: {},
  technology: {},
  financials: {},
  supplyChain: {},
  landData: {},
  cityData: {},
  projectData: {},
  companyStructure: {},
  divisionPercentages: {},
  newsArticles: {},
  politicalContext: {},
  externalMacroeconomic: {},
  externalTechnology: {},
  externalSupplyChain: {},
  externalDemographics: {},
  externalClimate: {},
  externalPolicy: {},
  externalEvents: {},
  marketIntelligence: {},
  trends: {},
  competitiveAnalysis: {},
  financialMetrics: {},
  externalForcesImpact: {}
};
