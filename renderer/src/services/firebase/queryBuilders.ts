// Query Builders - Specialized query builders for common operations

import { 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { 
  CollectionName, 
  Office, 
  Project, 
  Regulation, 
  Relationship,
  ACTIVE_COLLECTIONS
} from '../../types/firestore';
import { QueryOptions } from '../../types/operations';

// ============================================================================
// QUERY BUILDER TYPES
// ============================================================================

export interface OfficeQueryOptions {
  country?: string;
  city?: string;
  status?: 'active' | 'acquired' | 'dissolved';
  sizeCategory?: 'boutique' | 'medium' | 'large' | 'global';
  foundedYear?: number;
  foundedYearRange?: { min: number; max: number };
  specializations?: string[];
  minEmployeeCount?: number;
  maxEmployeeCount?: number;
  minRevenue?: number;
  maxRevenue?: number;
  orderBy?: { field: keyof Office; direction: 'asc' | 'desc' }[];
  limit?: number;
  startAfter?: DocumentData;
}

export interface ProjectQueryOptions {
  officeId?: string;
  cityId?: string;
  clientId?: string;
  status?: 'concept' | 'planning' | 'construction' | 'completed' | 'cancelled';
  projectType?: string;
  minBudget?: number;
  maxBudget?: number;
  currency?: string;
  startDateRange?: { start: Date; end: Date };
  completionDateRange?: { start: Date; end: Date };
  orderBy?: { field: keyof Project; direction: 'asc' | 'desc' }[];
  limit?: number;
  startAfter?: DocumentData;
}

export interface RegulationQueryOptions {
  regulationType?: string;
  jurisdiction?: {
    level?: 'international' | 'national' | 'state' | 'city';
    country?: string;
    state?: string;
    cityId?: string;
  };
  effectiveDateRange?: { start: Date; end: Date };
  expirationDateRange?: { start: Date; end: Date };
  mandatory?: boolean;
  impactLevel?: 'high' | 'medium' | 'low';
  orderBy?: { field: keyof Regulation; direction: 'asc' | 'desc' }[];
  limit?: number;
  startAfter?: DocumentData;
}

export interface RelationshipQueryOptions {
  sourceEntity?: { type: string; id: string };
  targetEntity?: { type: string; id: string };
  relationshipType?: string;
  minStrength?: number;
  maxStrength?: number;
  orderBy?: { field: keyof Relationship; direction: 'asc' | 'desc' }[];
  limit?: number;
  startAfter?: DocumentData;
}

// ============================================================================
// QUERY BUILDER SERVICE
// ============================================================================

export class QueryBuilderService {
  private static instance: QueryBuilderService;

  private constructor() {}

  public static getInstance(): QueryBuilderService {
    if (!QueryBuilderService.instance) {
      QueryBuilderService.instance = new QueryBuilderService();
    }
    return QueryBuilderService.instance;
  }

  // ============================================================================
  // OFFICE QUERY BUILDER
  // ============================================================================

  /**
   * Build office queries with specialized filters
   */
  public buildOfficeQuery(options: OfficeQueryOptions = {}): QueryOptions {
    const constraints: QueryConstraint[] = [];

    // Country filter
    if (options.country) {
      constraints.push(where('location.headquarters.country', '==', options.country));
    }

    // City filter
    if (options.city) {
      constraints.push(where('location.headquarters.city', '==', options.city));
    }

    // Status filter
    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    // Size category filter
    if (options.sizeCategory) {
      constraints.push(where('size.sizeCategory', '==', options.sizeCategory));
    }

    // Founded year filter
    if (options.foundedYear) {
      constraints.push(where('founded', '==', options.foundedYear));
    }

    // Founded year range filter
    if (options.foundedYearRange) {
      if (options.foundedYearRange.min) {
        constraints.push(where('founded', '>=', options.foundedYearRange.min));
      }
      if (options.foundedYearRange.max) {
        constraints.push(where('founded', '<=', options.foundedYearRange.max));
      }
    }

    // Specializations filter (array contains)
    if (options.specializations && options.specializations.length > 0) {
      constraints.push(where('specializations', 'array-contains-any', options.specializations));
    }

    // Employee count range filter
    if (options.minEmployeeCount) {
      constraints.push(where('size.employeeCount', '>=', options.minEmployeeCount));
    }
    if (options.maxEmployeeCount) {
      constraints.push(where('size.employeeCount', '<=', options.maxEmployeeCount));
    }

    // Revenue range filter
    if (options.minRevenue) {
      constraints.push(where('size.annualRevenue', '>=', options.minRevenue));
    }
    if (options.maxRevenue) {
      constraints.push(where('size.annualRevenue', '<=', options.maxRevenue));
    }

    // Ordering
    const orderByOptions = options.orderBy || [{ field: 'name', direction: 'asc' as const }];
    orderByOptions.forEach(order => {
      constraints.push(orderBy(order.field, order.direction));
    });

    // Limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    return {
      filters: constraints,
      orderBy: orderByOptions,
      limit: options.limit,
      startAfter: options.startAfter
    };
  }

  // ============================================================================
  // PROJECT QUERY BUILDER
  // ============================================================================

  /**
   * Build project queries with specialized filters
   */
  public buildProjectQuery(options: ProjectQueryOptions = {}): QueryOptions {
    const constraints: QueryConstraint[] = [];

    // Office ID filter
    if (options.officeId) {
      constraints.push(where('officeId', '==', options.officeId));
    }

    // City ID filter
    if (options.cityId) {
      constraints.push(where('cityId', '==', options.cityId));
    }

    // Client ID filter
    if (options.clientId) {
      constraints.push(where('clientId', '==', options.clientId));
    }

    // Status filter
    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    // Project type filter
    if (options.projectType) {
      constraints.push(where('details.projectType', '==', options.projectType));
    }

    // Budget range filter
    if (options.minBudget) {
      constraints.push(where('financial.budget', '>=', options.minBudget));
    }
    if (options.maxBudget) {
      constraints.push(where('financial.budget', '<=', options.maxBudget));
    }

    // Currency filter
    if (options.currency) {
      constraints.push(where('financial.currency', '==', options.currency));
    }

    // Start date range filter
    if (options.startDateRange) {
      if (options.startDateRange.start) {
        constraints.push(where('timeline.startDate', '>=', options.startDateRange.start));
      }
      if (options.startDateRange.end) {
        constraints.push(where('timeline.startDate', '<=', options.startDateRange.end));
      }
    }

    // Completion date range filter
    if (options.completionDateRange) {
      if (options.completionDateRange.start) {
        constraints.push(where('timeline.actualCompletion', '>=', options.completionDateRange.start));
      }
      if (options.completionDateRange.end) {
        constraints.push(where('timeline.actualCompletion', '<=', options.completionDateRange.end));
      }
    }

    // Ordering
    const orderByOptions = options.orderBy || [{ field: 'projectName', direction: 'asc' as const }];
    orderByOptions.forEach(order => {
      constraints.push(orderBy(order.field, order.direction));
    });

    // Limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    return {
      filters: constraints,
      orderBy: orderByOptions,
      limit: options.limit,
      startAfter: options.startAfter
    };
  }

  // ============================================================================
  // REGULATION QUERY BUILDER
  // ============================================================================

  /**
   * Build regulation queries with specialized filters
   */
  public buildRegulationQuery(options: RegulationQueryOptions = {}): QueryOptions {
    const constraints: QueryConstraint[] = [];

    // Regulation type filter
    if (options.regulationType) {
      constraints.push(where('regulationType', '==', options.regulationType));
    }

    // Jurisdiction filters
    if (options.jurisdiction) {
      if (options.jurisdiction.level) {
        constraints.push(where('jurisdiction.level', '==', options.jurisdiction.level));
      }
      if (options.jurisdiction.country) {
        constraints.push(where('jurisdiction.country', '==', options.jurisdiction.country));
      }
      if (options.jurisdiction.state) {
        constraints.push(where('jurisdiction.state', '==', options.jurisdiction.state));
      }
      if (options.jurisdiction.cityId) {
        constraints.push(where('jurisdiction.cityId', '==', options.jurisdiction.cityId));
      }
    }

    // Effective date range filter
    if (options.effectiveDateRange) {
      if (options.effectiveDateRange.start) {
        constraints.push(where('effectiveDate', '>=', options.effectiveDateRange.start));
      }
      if (options.effectiveDateRange.end) {
        constraints.push(where('effectiveDate', '<=', options.effectiveDateRange.end));
      }
    }

    // Expiration date range filter
    if (options.expirationDateRange) {
      if (options.expirationDateRange.start) {
        constraints.push(where('expirationDate', '>=', options.expirationDateRange.start));
      }
      if (options.expirationDateRange.end) {
        constraints.push(where('expirationDate', '<=', options.expirationDateRange.end));
      }
    }

    // Mandatory filter
    if (options.mandatory !== undefined) {
      constraints.push(where('compliance.mandatory', '==', options.mandatory));
    }

    // Impact level filter
    if (options.impactLevel) {
      constraints.push(where('impact.level', '==', options.impactLevel));
    }

    // Ordering
    const orderByOptions = options.orderBy || [{ field: 'name', direction: 'asc' as const }];
    orderByOptions.forEach(order => {
      constraints.push(orderBy(order.field, order.direction));
    });

    // Limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    return {
      filters: constraints,
      orderBy: orderByOptions,
      limit: options.limit,
      startAfter: options.startAfter
    };
  }

  // ============================================================================
  // RELATIONSHIP QUERY BUILDER
  // ============================================================================

  /**
   * Build relationship queries with specialized filters
   */
  public buildRelationshipQuery(options: RelationshipQueryOptions = {}): QueryOptions {
    const constraints: QueryConstraint[] = [];

    // Source entity filter
    if (options.sourceEntity) {
      constraints.push(where('sourceEntity.type', '==', options.sourceEntity.type));
      constraints.push(where('sourceEntity.id', '==', options.sourceEntity.id));
    }

    // Target entity filter
    if (options.targetEntity) {
      constraints.push(where('targetEntity.type', '==', options.targetEntity.type));
      constraints.push(where('targetEntity.id', '==', options.targetEntity.id));
    }

    // Relationship type filter
    if (options.relationshipType) {
      constraints.push(where('relationshipType', '==', options.relationshipType));
    }

    // Strength range filter
    if (options.minStrength !== undefined) {
      constraints.push(where('strength', '>=', options.minStrength));
    }
    if (options.maxStrength !== undefined) {
      constraints.push(where('strength', '<=', options.maxStrength));
    }

    // Ordering
    const orderByOptions = options.orderBy || [];
    orderByOptions.forEach(order => {
      constraints.push(orderBy(order.field, order.direction));
    });

    // Limit
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    return {
      filters: constraints,
      orderBy: orderByOptions,
      limit: options.limit,
      startAfter: options.startAfter
    };
  }

  // ============================================================================
  // GENERIC QUERY BUILDER
  // ============================================================================

  /**
   * Build generic queries for any collection
   */
  public buildGenericQuery(
    collectionName: CollectionName,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderByOptions: Array<{ field: string; direction: 'asc' | 'desc' }> = [],
    limitCount?: number,
    startAfterDoc?: DocumentData
  ): QueryOptions {
    const constraints: QueryConstraint[] = [];

    // Add filters
    filters.forEach(filter => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });

    // Add ordering
    orderByOptions.forEach(order => {
      constraints.push(orderBy(order.field, order.direction));
    });

    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    // Add pagination
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    return {
      filters: constraints,
      orderBy: orderByOptions,
      limit: limitCount,
      startAfter: startAfterDoc
    };
  }

  // ============================================================================
  // COMMON QUERY PATTERNS
  // ============================================================================

  /**
   * Get offices by country
   */
  public getOfficesByCountry(country: string, limitCount: number = 50): QueryOptions {
    return this.buildOfficeQuery({
      country,
      status: 'active',
      orderBy: [{ field: 'name', direction: 'asc' }],
      limit: limitCount
    });
  }

  /**
   * Get offices by city
   */
  public getOfficesByCity(city: string, country: string, limitCount: number = 50): QueryOptions {
    return this.buildOfficeQuery({
      city,
      country,
      status: 'active',
      orderBy: [{ field: 'name', direction: 'asc' }],
      limit: limitCount
    });
  }

  /**
   * Get large offices (employee count > 100)
   */
  public getLargeOffices(limitCount: number = 50): QueryOptions {
    return this.buildOfficeQuery({
      status: 'active',
      minEmployeeCount: 100,
      orderBy: [{ field: 'size.employeeCount', direction: 'desc' }],
      limit: limitCount
    });
  }

  /**
   * Get projects by office
   */
  public getProjectsByOffice(officeId: string, limitCount: number = 50): QueryOptions {
    return this.buildProjectQuery({
      officeId,
      orderBy: [{ field: 'projectName', direction: 'asc' }],
      limit: limitCount
    });
  }

  /**
   * Get active projects
   */
  public getActiveProjects(limitCount: number = 50): QueryOptions {
    return this.buildProjectQuery({
      status: 'construction',
      orderBy: [{ field: 'timeline.startDate', direction: 'desc' }],
      limit: limitCount
    });
  }

  /**
   * Get completed projects
   */
  public getCompletedProjects(limitCount: number = 50): QueryOptions {
    return this.buildProjectQuery({
      status: 'completed',
      orderBy: [{ field: 'timeline.actualCompletion', direction: 'desc' }],
      limit: limitCount
    });
  }

  /**
   * Get regulations by country
   */
  public getRegulationsByCountry(country: string, limitCount: number = 50): QueryOptions {
    return this.buildRegulationQuery({
      jurisdiction: { country },
      orderBy: [{ field: 'name', direction: 'asc' }],
      limit: limitCount
    });
  }

  /**
   * Get mandatory regulations
   */
  public getMandatoryRegulations(limitCount: number = 50): QueryOptions {
    return this.buildRegulationQuery({
      mandatory: true,
      orderBy: [{ field: 'name', direction: 'asc' }],
      limit: limitCount
    });
  }

  /**
   * Get relationships by entity
   */
  public getRelationshipsByEntity(entityType: string, entityId: string, limitCount: number = 50): QueryOptions {
    return this.buildRelationshipQuery({
      sourceEntity: { type: entityType, id: entityId },
      limit: limitCount
    });
  }

  /**
   * Get strong relationships (strength > 7)
   */
  public getStrongRelationships(limitCount: number = 50): QueryOptions {
    return this.buildRelationshipQuery({
      minStrength: 8,
      orderBy: [{ field: 'strength' as keyof Relationship, direction: 'desc' }],
      limit: limitCount
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const queryBuilder = QueryBuilderService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function buildOfficeQuery(options: OfficeQueryOptions = {}): QueryOptions {
  return queryBuilder.buildOfficeQuery(options);
}

export function buildProjectQuery(options: ProjectQueryOptions = {}): QueryOptions {
  return queryBuilder.buildProjectQuery(options);
}

export function buildRegulationQuery(options: RegulationQueryOptions = {}): QueryOptions {
  return queryBuilder.buildRegulationQuery(options);
}

export function buildRelationshipQuery(options: RelationshipQueryOptions = {}): QueryOptions {
  return queryBuilder.buildRelationshipQuery(options);
}

export function buildGenericQuery(
  collectionName: CollectionName,
  filters: Array<{ field: string; operator: any; value: any }> = [],
  orderByOptions: Array<{ field: string; direction: 'asc' | 'desc' }> = [],
  limitCount?: number,
  startAfterDoc?: DocumentData
): QueryOptions {
  return queryBuilder.buildGenericQuery(collectionName, filters, orderByOptions, limitCount, startAfterDoc);
}

// Common query patterns
export function getOfficesByCountry(country: string, limitCount: number = 50): QueryOptions {
  return queryBuilder.getOfficesByCountry(country, limitCount);
}

export function getOfficesByCity(city: string, country: string, limitCount: number = 50): QueryOptions {
  return queryBuilder.getOfficesByCity(city, country, limitCount);
}

export function getLargeOffices(limitCount: number = 50): QueryOptions {
  return queryBuilder.getLargeOffices(limitCount);
}

export function getProjectsByOffice(officeId: string, limitCount: number = 50): QueryOptions {
  return queryBuilder.getProjectsByOffice(officeId, limitCount);
}

export function getActiveProjects(limitCount: number = 50): QueryOptions {
  return queryBuilder.getActiveProjects(limitCount);
}

export function getCompletedProjects(limitCount: number = 50): QueryOptions {
  return queryBuilder.getCompletedProjects(limitCount);
}

export function getRegulationsByCountry(country: string, limitCount: number = 50): QueryOptions {
  return queryBuilder.getRegulationsByCountry(country, limitCount);
}

export function getMandatoryRegulations(limitCount: number = 50): QueryOptions {
  return queryBuilder.getMandatoryRegulations(limitCount);
}

export function getRelationshipsByEntity(entityType: string, entityId: string, limitCount: number = 50): QueryOptions {
  return queryBuilder.getRelationshipsByEntity(entityType, entityId, limitCount);
}

export function getStrongRelationships(limitCount: number = 50): QueryOptions {
  return queryBuilder.getStrongRelationships(limitCount);
}
