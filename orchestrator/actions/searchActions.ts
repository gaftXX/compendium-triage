/**
 * Search Actions Handler
 * 
 * Handles all search and query operations for the AI Orchestrator.
 * These actions provide unified search capabilities across all data types.
 */

import { 
  queryOffices, 
  queryProjects, 
  queryRegulations 
} from '../../renderer/src/services/firebase/dataService';

export interface SearchActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
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
}): Promise<SearchActionResult> {
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
 * Search and filter architecture projects
 */
export async function searchProjectsAction(params: {
  query?: string;
  officeId?: string;
  status?: string;
  type?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<SearchActionResult> {
  try {
    // Prepare search filters
    const filters: any = {};
    
    if (params.officeId) filters.officeId = params.officeId;
    if (params.status) filters.status = params.status;
    if (params.type) filters.type = params.type;
    if (params.location) filters.location = params.location;
    if (params.startDate) filters.startDate = params.startDate;
    if (params.endDate) filters.endDate = params.endDate;

    // Search projects using Firestore operations
    const projects = await queryProjects({
      filters,
      limit: params.limit || 50
    });

    return {
      success: true,
      data: projects,
      message: `Found ${projects.length} projects matching criteria`
    };
  } catch (error) {
    console.error('Error searching projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Search and filter regulatory records
 */
export async function searchRegulatoryAction(params: {
  query?: string;
  type?: string;
  jurisdiction?: string;
  status?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  limit?: number;
}): Promise<SearchActionResult> {
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
 * Universal search across all data types
 */
export async function universalSearchAction(params: {
  query: string;
  types?: string[]; // ['offices', 'projects', 'regulatory']
  limit?: number;
}): Promise<SearchActionResult> {
  try {
    // Validate required parameters
    if (!params.query) {
      return {
        success: false,
        error: 'Missing required parameter: query is required'
      };
    }

    const searchTypes = params.types || ['offices', 'projects', 'regulatory'];
    const limit = params.limit || 20;
    const results: any = {};

    // Search each requested type
    for (const type of searchTypes) {
      try {
        switch (type) {
          case 'offices':
            const offices = await queryOffices({
              limit: Math.ceil(limit / searchTypes.length)
            });
            results.offices = offices;
            break;
            
          case 'projects':
            const projects = await queryProjects({
              limit: Math.ceil(limit / searchTypes.length)
            });
            results.projects = projects;
            break;
            
          case 'regulatory':
            const regulatory = await queryRegulations({
              limit: Math.ceil(limit / searchTypes.length)
            });
            results.regulatory = regulatory;
            break;
        }
      } catch (error) {
        console.error(`Error searching ${type}:`, error);
        results[type] = [];
      }
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0);

    return {
      success: true,
      data: results,
      message: `Found ${totalResults} results across ${searchTypes.join(', ')}`
    };
  } catch (error) {
    console.error('Error in universal search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get search suggestions based on existing data
 */
export async function getSearchSuggestionsAction(params: {
  type: string; // 'offices', 'projects', 'regulatory'
  field: string; // 'name', 'city', 'country', etc.
  query?: string;
  limit?: number;
}): Promise<SearchActionResult> {
  try {
    // Validate required parameters
    if (!params.type || !params.field) {
      return {
        success: false,
        error: 'Missing required parameters: type and field are required'
      };
    }

    const limit = params.limit || 10;
    let suggestions: string[] = [];

    // Get suggestions based on type and field
    switch (params.type) {
      case 'offices':
        const offices = await queryOffices({
          limit: 100
        });
        suggestions = offices
          .map((office: any) => office[params.field])
          .filter((value: any) => value && value.toString().toLowerCase().includes((params.query || '').toLowerCase()))
          .slice(0, limit);
        break;
        
      case 'projects':
        const projects = await queryProjects({
          limit: 100
        });
        suggestions = projects
          .map((project: any) => project[params.field])
          .filter((value: any) => value && value.toString().toLowerCase().includes((params.query || '').toLowerCase()))
          .slice(0, limit);
        break;
        
      case 'regulatory':
        const regulatory = await queryRegulations({
          limit: 100
        });
        suggestions = regulatory
          .map((record: any) => record[params.field])
          .filter((value: any) => value && value.toString().toLowerCase().includes((params.query || '').toLowerCase()))
          .slice(0, limit);
        break;
        
      default:
        return {
          success: false,
          error: `Invalid type: ${params.type}. Must be 'offices', 'projects', or 'regulatory'`
        };
    }

    return {
      success: true,
      data: suggestions,
      message: `Found ${suggestions.length} suggestions for ${params.type}.${params.field}`
    };
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Action handler mapping for registry
 */
export const searchActions = {
  searchOffices: searchOfficesAction,
  searchProjects: searchProjectsAction,
  searchRegulatory: searchRegulatoryAction,
  universalSearch: universalSearchAction,
  getSearchSuggestions: getSearchSuggestionsAction
};
