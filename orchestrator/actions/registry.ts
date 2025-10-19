/**
 * AI Orchestrator Action Registry
 * 
 * Maps all app control capabilities to handler functions.
 * This registry is used by the orchestrator to understand what actions
 * are available and how to execute them.
 */

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  handler: string; // Path to handler function
  requiredParams: string[];
  optionalParams: string[];
  category: string;
  domain: string;
}

export interface ActionRegistry {
  [actionId: string]: ActionDefinition;
}

/**
 * ACTIVE ACTIONS (Initial Build)
 * These are the core actions available in the current phase
 */
export const ACTIVE_ACTIONS: ActionRegistry = {
  // Architecture Office Actions
  CREATE_OFFICE: {
    id: 'CREATE_OFFICE',
    name: 'Create Office',
    description: 'Create a new architecture office with unique ID, name, location, and metadata',
    handler: 'officeActions.createOffice',
    requiredParams: ['name', 'city', 'country'],
    optionalParams: ['description', 'founded', 'specialization', 'website', 'contact'],
    category: 'office',
    domain: 'architecture'
  },
  
  UPDATE_OFFICE: {
    id: 'UPDATE_OFFICE',
    name: 'Update Office',
    description: 'Update an existing architecture office with new information',
    handler: 'officeActions.updateOffice',
    requiredParams: ['officeId'],
    optionalParams: ['name', 'city', 'country', 'description', 'founded', 'specialization', 'website', 'contact'],
    category: 'office',
    domain: 'architecture'
  },
  
  DELETE_OFFICE: {
    id: 'DELETE_OFFICE',
    name: 'Delete Office',
    description: 'Delete an architecture office and all its relationships',
    handler: 'officeActions.deleteOffice',
    requiredParams: ['officeId'],
    optionalParams: [],
    category: 'office',
    domain: 'architecture'
  },
  
  SEARCH_OFFICES: {
    id: 'SEARCH_OFFICES',
    name: 'Search Offices',
    description: 'Search and filter architecture offices by various criteria',
    handler: 'searchActions.searchOffices',
    requiredParams: [],
    optionalParams: ['query', 'city', 'country', 'specialization', 'founded', 'limit'],
    category: 'office',
    domain: 'search'
  },
  
  GET_OFFICE: {
    id: 'GET_OFFICE',
    name: 'Get Office',
    description: 'Retrieve detailed information about a specific office',
    handler: 'officeActions.getOffice',
    requiredParams: ['officeId'],
    optionalParams: ['includeRelationships'],
    category: 'office',
    domain: 'architecture'
  },

  // Project Actions
  CREATE_PROJECT: {
    id: 'CREATE_PROJECT',
    name: 'Create Project',
    description: 'Create a new architecture project with details and metadata',
    handler: 'projectActions.createProject',
    requiredParams: ['name', 'officeId'],
    optionalParams: ['description', 'status', 'startDate', 'endDate', 'budget', 'location', 'type'],
    category: 'project',
    domain: 'architecture'
  },
  
  UPDATE_PROJECT: {
    id: 'UPDATE_PROJECT',
    name: 'Update Project',
    description: 'Update an existing architecture project with new information',
    handler: 'projectActions.updateProject',
    requiredParams: ['projectId'],
    optionalParams: ['name', 'description', 'status', 'startDate', 'endDate', 'budget', 'location', 'type'],
    category: 'project',
    domain: 'architecture'
  },
  
  DELETE_PROJECT: {
    id: 'DELETE_PROJECT',
    name: 'Delete Project',
    description: 'Delete an architecture project and its relationships',
    handler: 'projectActions.deleteProject',
    requiredParams: ['projectId'],
    optionalParams: [],
    category: 'project',
    domain: 'architecture'
  },
  
  SEARCH_PROJECTS: {
    id: 'SEARCH_PROJECTS',
    name: 'Search Projects',
    description: 'Search and filter architecture projects by various criteria',
    handler: 'searchActions.searchProjects',
    requiredParams: [],
    optionalParams: ['query', 'officeId', 'status', 'type', 'location', 'startDate', 'endDate', 'limit'],
    category: 'project',
    domain: 'search'
  },
  
  GET_PROJECT: {
    id: 'GET_PROJECT',
    name: 'Get Project',
    description: 'Retrieve detailed information about a specific project',
    handler: 'projectActions.getProject',
    requiredParams: ['projectId'],
    optionalParams: ['includeRelationships'],
    category: 'project',
    domain: 'architecture'
  },

  // Regulatory/Zoning Actions
  CREATE_REGULATORY_RECORD: {
    id: 'CREATE_REGULATORY_RECORD',
    name: 'Create Regulatory Record',
    description: 'Create a new regulatory or zoning record with details',
    handler: 'regulatoryActions.createRegulatoryRecord',
    requiredParams: ['name', 'type', 'jurisdiction'],
    optionalParams: ['description', 'effectiveDate', 'expiryDate', 'status', 'requirements', 'penalties'],
    category: 'regulatory',
    domain: 'compliance'
  },
  
  UPDATE_REGULATORY_RECORD: {
    id: 'UPDATE_REGULATORY_RECORD',
    name: 'Update Regulatory Record',
    description: 'Update an existing regulatory or zoning record',
    handler: 'regulatoryActions.updateRegulatoryRecord',
    requiredParams: ['recordId'],
    optionalParams: ['name', 'type', 'jurisdiction', 'description', 'effectiveDate', 'expiryDate', 'status', 'requirements', 'penalties'],
    category: 'regulatory',
    domain: 'compliance'
  },
  
  DELETE_REGULATORY_RECORD: {
    id: 'DELETE_REGULATORY_RECORD',
    name: 'Delete Regulatory Record',
    description: 'Delete a regulatory or zoning record',
    handler: 'regulatoryActions.deleteRegulatoryRecord',
    requiredParams: ['recordId'],
    optionalParams: [],
    category: 'regulatory',
    domain: 'compliance'
  },
  
  SEARCH_REGULATORY: {
    id: 'SEARCH_REGULATORY',
    name: 'Search Regulatory Records',
    description: 'Search and filter regulatory records by various criteria',
    handler: 'searchActions.searchRegulatory',
    requiredParams: [],
    optionalParams: ['query', 'type', 'jurisdiction', 'status', 'effectiveDate', 'expiryDate', 'limit'],
    category: 'regulatory',
    domain: 'search'
  },
  
  GET_REGULATORY: {
    id: 'GET_REGULATORY',
    name: 'Get Regulatory Record',
    description: 'Retrieve detailed information about a specific regulatory record',
    handler: 'regulatoryActions.getRegulatoryRecord',
    requiredParams: ['recordId'],
    optionalParams: ['includeRelationships'],
    category: 'regulatory',
    domain: 'compliance'
  },

  // Relationship Actions
  LINK_OFFICE_TO_PROJECT: {
    id: 'LINK_OFFICE_TO_PROJECT',
    name: 'Link Office to Project',
    description: 'Create a relationship between an office and a project',
    handler: 'relationshipActions.linkOfficeToProject',
    requiredParams: ['officeId', 'projectId'],
    optionalParams: ['role', 'startDate', 'endDate', 'notes'],
    category: 'relationship',
    domain: 'architecture'
  },
  
  LINK_OFFICE_TO_REGULATORY: {
    id: 'LINK_OFFICE_TO_REGULATORY',
    name: 'Link Office to Regulatory',
    description: 'Create a relationship between an office and a regulatory record',
    handler: 'relationshipActions.linkOfficeToRegulatory',
    requiredParams: ['officeId', 'recordId'],
    optionalParams: ['complianceStatus', 'lastReview', 'notes'],
    category: 'relationship',
    domain: 'compliance'
  },
  
  LINK_PROJECT_TO_REGULATORY: {
    id: 'LINK_PROJECT_TO_REGULATORY',
    name: 'Link Project to Regulatory',
    description: 'Create a relationship between a project and a regulatory record',
    handler: 'relationshipActions.linkProjectToRegulatory',
    requiredParams: ['projectId', 'recordId'],
    optionalParams: ['complianceStatus', 'requirements', 'notes'],
    category: 'relationship',
    domain: 'compliance'
  },

  // UI Navigation Actions
  NAVIGATE_TO_CROSS: {
    id: 'NAVIGATE_TO_CROSS',
    name: 'Navigate to Cross UI',
    description: 'Navigate to the main Cross UI input interface',
    handler: 'uiActions.navigateToCross',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_TO_OFFICES: {
    id: 'NAVIGATE_TO_OFFICES',
    name: 'Navigate to Offices',
    description: 'Navigate to the offices list view',
    handler: 'uiActions.navigateToOffices',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_TO_PROJECTS: {
    id: 'NAVIGATE_TO_PROJECTS',
    name: 'Navigate to Projects',
    description: 'Navigate to the projects list view',
    handler: 'uiActions.navigateToProjects',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_TO_REGULATORY: {
    id: 'NAVIGATE_TO_REGULATORY',
    name: 'Navigate to Regulatory',
    description: 'Navigate to the regulatory records list view',
    handler: 'uiActions.navigateToRegulatory',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_TO_OFFICE_DETAIL: {
    id: 'NAVIGATE_TO_OFFICE_DETAIL',
    name: 'Navigate to Office Detail',
    description: 'Navigate to a specific office detail view',
    handler: 'uiActions.navigateToOfficeDetail',
    requiredParams: ['officeId'],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_TO_PROJECT_DETAIL: {
    id: 'NAVIGATE_TO_PROJECT_DETAIL',
    name: 'Navigate to Project Detail',
    description: 'Navigate to a specific project detail view',
    handler: 'uiActions.navigateToProjectDetail',
    requiredParams: ['projectId'],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_TO_REGULATORY_DETAIL: {
    id: 'NAVIGATE_TO_REGULATORY_DETAIL',
    name: 'Navigate to Regulatory Detail',
    description: 'Navigate to a specific regulatory record detail view',
    handler: 'uiActions.navigateToRegulatoryDetail',
    requiredParams: ['regulationId'],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  NAVIGATE_BACK: {
    id: 'NAVIGATE_BACK',
    name: 'Navigate Back',
    description: 'Go back to the previous view',
    handler: 'uiActions.navigateBack',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  REFRESH_VIEW: {
    id: 'REFRESH_VIEW',
    name: 'Refresh View',
    description: 'Refresh the current view',
    handler: 'uiActions.refreshCurrentView',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  SHOW_HELP: {
    id: 'SHOW_HELP',
    name: 'Show Help',
    description: 'Display help information and available commands',
    handler: 'uiActions.showHelp',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  TOGGLE_INPUT_MODE: {
    id: 'TOGGLE_INPUT_MODE',
    name: 'Toggle Input Mode',
    description: 'Switch between note processing and orchestrator input modes',
    handler: 'uiActions.toggleInputMode',
    requiredParams: ['mode'],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  CLEAR_INPUT: {
    id: 'CLEAR_INPUT',
    name: 'Clear Input',
    description: 'Clear current input or selection',
    handler: 'uiActions.clearInput',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  },

  EXPORT_DATA: {
    id: 'EXPORT_DATA',
    name: 'Export Data',
    description: 'Export data in various formats (JSON, CSV, PDF)',
    handler: 'uiActions.exportData',
    requiredParams: ['type'],
    optionalParams: ['format'],
    category: 'navigation',
    domain: 'ui'
  },

  GET_CURRENT_STATE: {
    id: 'GET_CURRENT_STATE',
    name: 'Get Current State',
    description: 'Get the current application state and context',
    handler: 'uiActions.getCurrentState',
    requiredParams: [],
    optionalParams: [],
    category: 'navigation',
    domain: 'ui'
  }
};

/**
 * DORMANT ACTIONS (Future Expansion)
 * These actions will be implemented in future phases
 */
export const DORMANT_ACTIONS: ActionRegistry = {
  // Client Relationship Actions (Future)
  CREATE_CLIENT: {
    id: 'CREATE_CLIENT',
    name: 'Create Client',
    description: 'Create a new client entity',
    handler: 'clientActions.createClient',
    requiredParams: ['name'],
    optionalParams: ['type', 'industry', 'contact', 'location'],
    category: 'client',
    domain: 'relationships'
  },
  
  // Financial Actions (Future)
  CREATE_FINANCIAL_RECORD: {
    id: 'CREATE_FINANCIAL_RECORD',
    name: 'Create Financial Record',
    description: 'Create a new financial transaction or record',
    handler: 'financialActions.createFinancialRecord',
    requiredParams: ['amount', 'type'],
    optionalParams: ['description', 'date', 'officeId', 'projectId'],
    category: 'financial',
    domain: 'economics'
  },
  
  // Analytics Actions (Future)
  CALCULATE_DIVISION_PERCENTAGES: {
    id: 'CALCULATE_DIVISION_PERCENTAGES',
    name: 'Calculate Division Percentages',
    description: 'Calculate market division percentages and consolidation metrics',
    handler: 'analyticsActions.calculateDivisionPercentages',
    requiredParams: ['market'],
    optionalParams: ['timeframe', 'includeSubmarkets'],
    category: 'analytics',
    domain: 'market_intelligence'
  },
  
  // External Forces Actions (Future)
  TRACK_MACROECONOMIC_IMPACT: {
    id: 'TRACK_MACROECONOMIC_IMPACT',
    name: 'Track Macroeconomic Impact',
    description: 'Track and analyze macroeconomic factors affecting architecture',
    handler: 'externalForcesActions.trackMacroeconomicImpact',
    requiredParams: ['region'],
    optionalParams: ['timeframe', 'factors'],
    category: 'external_forces',
    domain: 'macroeconomic'
  },
  
  // Political Context Actions (Future)
  TRACK_POLITICAL_CONTEXT: {
    id: 'TRACK_POLITICAL_CONTEXT',
    name: 'Track Political Context',
    description: 'Track political and governance factors affecting architecture',
    handler: 'politicalContextActions.trackPoliticalContext',
    requiredParams: ['region'],
    optionalParams: ['timeframe', 'factors'],
    category: 'political',
    domain: 'governance'
  }
};

/**
 * Get all available actions (active + dormant)
 */
export function getAllActions(): ActionRegistry {
  return { ...ACTIVE_ACTIONS, ...DORMANT_ACTIONS };
}

/**
 * Get only active actions
 */
export function getActiveActions(): ActionRegistry {
  return ACTIVE_ACTIONS;
}

/**
 * Get actions by category
 */
export function getActionsByCategory(category: string): ActionRegistry {
  const allActions = getAllActions();
  return Object.fromEntries(
    Object.entries(allActions).filter(([_, action]) => action.category === category)
  );
}

/**
 * Get actions by domain
 */
export function getActionsByDomain(domain: string): ActionRegistry {
  const allActions = getAllActions();
  return Object.fromEntries(
    Object.entries(allActions).filter(([_, action]) => action.domain === domain)
  );
}

/**
 * Get action definition by ID
 */
export function getActionById(actionId: string): ActionDefinition | undefined {
  const allActions = getAllActions();
  return allActions[actionId];
}

/**
 * Validate action parameters
 */
export function validateActionParameters(actionId: string, params: Record<string, any>): {
  valid: boolean;
  missing: string[];
  extra: string[];
} {
  const action = getActionById(actionId);
  if (!action) {
    return { valid: false, missing: [], extra: [] };
  }

  const providedParams = Object.keys(params);
  const missing = action.requiredParams.filter(param => !providedParams.includes(param));
  const extra = providedParams.filter(param => 
    !action.requiredParams.includes(param) && !action.optionalParams.includes(param)
  );

  return {
    valid: missing.length === 0,
    missing,
    extra
  };
}
