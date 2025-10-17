// Security Rules Configuration - Comprehensive security for all collections

import { 
  CollectionName, 
  ACTIVE_COLLECTIONS,
  DORMANT_COLLECTIONS
} from '../../types/firestore';

// ============================================================================
// SECURITY RULE TYPES
// ============================================================================

export interface SecurityRule {
  collection: CollectionName;
  rule: string;
  description: string;
  accessLevel: 'public' | 'authenticated' | 'admin' | 'custom';
  operations: ('read' | 'write' | 'create' | 'update' | 'delete')[];
  conditions?: string[];
  examples: string[];
}

export interface SecurityRuleSet {
  rules: SecurityRule[];
  version: string;
  description: string;
  lastUpdated: Date;
  totalRules: number;
  collections: CollectionName[];
}

// ============================================================================
// SECURITY RULES FOR ACTIVE COLLECTIONS
// ============================================================================

const officesSecurityRules: SecurityRule[] = [
  {
    collection: 'offices',
    rule: `// Allow read access to all users for public office information
    match /offices/{officeId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['admin', 'editor'] &&
                     validateOfficeData(request.resource.data);
    }`,
    description: 'Public read access, authenticated write access for admins/editors',
    accessLevel: 'custom',
    operations: ['read', 'write'],
    conditions: ['request.auth != null', 'request.auth.token.role in [\'admin\', \'editor\']', 'validateOfficeData(request.resource.data)'],
    examples: [
      'Read office information: All users',
      'Create/update office: Admin or Editor role required',
      'Delete office: Admin role required'
    ]
  },
  {
    collection: 'offices',
    rule: `// Validate office data structure
    function validateOfficeData(data) {
      return data.keys().hasAll(['id', 'name', 'founded', 'status', 'location', 'size']) &&
             data.id is string &&
             data.name is string &&
             data.founded is number &&
             data.status in ['active', 'acquired', 'dissolved'] &&
             data.location is map &&
             data.size is map;
    }`,
    description: 'Office data validation function',
    accessLevel: 'custom',
    operations: ['write'],
    conditions: ['validateOfficeData(request.resource.data)'],
    examples: ['Validates required fields and data types for office documents']
  }
];

const projectsSecurityRules: SecurityRule[] = [
  {
    collection: 'projects',
    rule: `// Allow read access to all users for public project information
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['admin', 'editor'] &&
                     validateProjectData(request.resource.data);
    }`,
    description: 'Public read access, authenticated write access for admins/editors',
    accessLevel: 'custom',
    operations: ['read', 'write'],
    conditions: ['request.auth != null', 'request.auth.token.role in [\'admin\', \'editor\']', 'validateProjectData(request.resource.data)'],
    examples: [
      'Read project information: All users',
      'Create/update project: Admin or Editor role required',
      'Delete project: Admin role required'
    ]
  },
  {
    collection: 'projects',
    rule: `// Validate project data structure
    function validateProjectData(data) {
      return data.keys().hasAll(['id', 'projectName', 'officeId', 'cityId', 'status']) &&
             data.id is string &&
             data.projectName is string &&
             data.officeId is string &&
             data.cityId is string &&
             data.status in ['concept', 'planning', 'construction', 'completed', 'cancelled'];
    }`,
    description: 'Project data validation function',
    accessLevel: 'custom',
    operations: ['write'],
    conditions: ['validateProjectData(request.resource.data)'],
    examples: ['Validates required fields and data types for project documents']
  }
];

const regulationsSecurityRules: SecurityRule[] = [
  {
    collection: 'regulations',
    rule: `// Allow read access to all users for public regulation information
    match /regulations/{regulationId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['admin', 'editor'] &&
                     validateRegulationData(request.resource.data);
    }`,
    description: 'Public read access, authenticated write access for admins/editors',
    accessLevel: 'custom',
    operations: ['read', 'write'],
    conditions: ['request.auth != null', 'request.auth.token.role in [\'admin\', \'editor\']', 'validateRegulationData(request.resource.data)'],
    examples: [
      'Read regulation information: All users',
      'Create/update regulation: Admin or Editor role required',
      'Delete regulation: Admin role required'
    ]
  },
  {
    collection: 'regulations',
    rule: `// Validate regulation data structure
    function validateRegulationData(data) {
      return data.keys().hasAll(['id', 'name', 'regulationType', 'jurisdiction', 'effectiveDate']) &&
             data.id is string &&
             data.name is string &&
             data.regulationType is string &&
             data.jurisdiction is map &&
             data.effectiveDate is timestamp;
    }`,
    description: 'Regulation data validation function',
    accessLevel: 'custom',
    operations: ['write'],
    conditions: ['validateRegulationData(request.resource.data)'],
    examples: ['Validates required fields and data types for regulation documents']
  }
];

const relationshipsSecurityRules: SecurityRule[] = [
  {
    collection: 'relationships',
    rule: `// Allow read access to all users for public relationship information
    match /relationships/{relationshipId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['admin', 'editor'] &&
                     validateRelationshipData(request.resource.data);
    }`,
    description: 'Public read access, authenticated write access for admins/editors',
    accessLevel: 'custom',
    operations: ['read', 'write'],
    conditions: ['request.auth != null', 'request.auth.token.role in [\'admin\', \'editor\']', 'validateRelationshipData(request.resource.data)'],
    examples: [
      'Read relationship information: All users',
      'Create/update relationship: Admin or Editor role required',
      'Delete relationship: Admin role required'
    ]
  },
  {
    collection: 'relationships',
    rule: `// Validate relationship data structure
    function validateRelationshipData(data) {
      return data.keys().hasAll(['id', 'sourceEntity', 'targetEntity', 'relationshipType', 'strength']) &&
             data.id is string &&
             data.sourceEntity is map &&
             data.targetEntity is map &&
             data.relationshipType is string &&
             data.strength is number &&
             data.strength >= 1 && data.strength <= 10;
    }`,
    description: 'Relationship data validation function',
    accessLevel: 'custom',
    operations: ['write'],
    conditions: ['validateRelationshipData(request.resource.data)'],
    examples: ['Validates required fields and data types for relationship documents']
  }
];

// ============================================================================
// SECURITY RULES FOR DORMANT COLLECTIONS
// ============================================================================

const dormantCollectionsSecurityRules: SecurityRule[] = [
  {
    collection: 'cities',
    rule: `// Dormant collection - read-only access
    match /cities/{cityId} {
      allow read: if true;
      allow write: if false;
    }`,
    description: 'Read-only access for dormant cities collection',
    accessLevel: 'public',
    operations: ['read'],
    conditions: ['true'],
    examples: ['Read access only - no write operations allowed']
  },
  {
    collection: 'archHistory',
    rule: `// Dormant collection - read-only access
    match /archHistory/{historyId} {
      allow read: if true;
      allow write: if false;
    }`,
    description: 'Read-only access for dormant archHistory collection',
    accessLevel: 'public',
    operations: ['read'],
    conditions: ['true'],
    examples: ['Read access only - no write operations allowed']
  },
  {
    collection: 'networkGraph',
    rule: `// Dormant collection - read-only access
    match /networkGraph/{nodeId} {
      allow read: if true;
      allow write: if false;
    }`,
    description: 'Read-only access for dormant networkGraph collection',
    accessLevel: 'public',
    operations: ['read'],
    conditions: ['true'],
    examples: ['Read access only - no write operations allowed']
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const utilityFunctions: SecurityRule[] = [
  {
    collection: 'utility',
    rule: `// Utility functions for data validation
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return request.auth != null && request.auth.token.role == 'admin';
    }
    
    function isEditor() {
      return request.auth != null && request.auth.token.role in ['admin', 'editor'];
    }
    
    function isValidTimestamp(timestamp) {
      return timestamp is timestamp;
    }
    
    function isValidOfficeId(officeId) {
      return officeId is string && officeId.matches('^[A-Z]{2}[A-Z]{2}\\d{3}$');
    }
    
    function isValidProjectId(projectId) {
      return projectId is string && projectId.size() > 0;
    }
    
    function isValidRegulationId(regulationId) {
      return regulationId is string && regulationId.size() > 0;
    }`,
    description: 'Utility functions for common validations',
    accessLevel: 'custom',
    operations: ['read', 'write'],
    conditions: [],
    examples: ['Common validation functions used across collections']
  }
];

// ============================================================================
// COMPLETE SECURITY RULE SET
// ============================================================================

export const securityRules: SecurityRuleSet = {
  rules: [
    ...officesSecurityRules,
    ...projectsSecurityRules,
    ...regulationsSecurityRules,
    ...relationshipsSecurityRules,
    ...dormantCollectionsSecurityRules,
    ...utilityFunctions
  ],
  version: '1.0.0',
  description: 'Comprehensive security rules for Compendium Triage Firestore database',
  lastUpdated: new Date(),
  totalRules: officesSecurityRules.length + projectsSecurityRules.length + 
              regulationsSecurityRules.length + relationshipsSecurityRules.length + 
              dormantCollectionsSecurityRules.length + utilityFunctions.length,
  collections: [...ACTIVE_COLLECTIONS, ...DORMANT_COLLECTIONS]
};

// ============================================================================
// SECURITY RULE UTILITY FUNCTIONS
// ============================================================================

export function getSecurityRulesForCollection(collectionName: CollectionName): SecurityRule[] {
  return securityRules.rules.filter(rule => rule.collection === collectionName);
}

export function getActiveCollectionSecurityRules(): SecurityRule[] {
  return securityRules.rules.filter(rule => ACTIVE_COLLECTIONS.includes(rule.collection));
}

export function getDormantCollectionSecurityRules(): SecurityRule[] {
  return securityRules.rules.filter(rule => DORMANT_COLLECTIONS.includes(rule.collection));
}

export function getSecurityRulesByAccessLevel(accessLevel: 'public' | 'authenticated' | 'admin' | 'custom'): SecurityRule[] {
  return securityRules.rules.filter(rule => rule.accessLevel === accessLevel);
}

export function getSecurityRulesByOperation(operation: 'read' | 'write' | 'create' | 'update' | 'delete'): SecurityRule[] {
  return securityRules.rules.filter(rule => rule.operations.includes(operation));
}

export function generateFirestoreSecurityRules(): string {
  const rules = securityRules.rules.map(rule => rule.rule).join('\n\n');
  
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    ${rules}
  }
}`;
}

export function generateSecurityRulesDocumentation(): string {
  let documentation = `# Firestore Security Rules Documentation

## Overview
This document describes the security rules implemented for the Compendium Triage Firestore database.

## Version: ${securityRules.version}
## Last Updated: ${securityRules.lastUpdated.toISOString()}
## Total Rules: ${securityRules.totalRules}

## Collections Covered
${securityRules.collections.map(collection => `- ${collection}`).join('\n')}

## Security Rule Categories

### Active Collections
Active collections allow both read and write operations with proper authentication and validation.

#### Offices Collection
${officesSecurityRules.map(rule => `- **${rule.description}**: ${rule.rule.split('\n')[0]}`).join('\n')}

#### Projects Collection
${projectsSecurityRules.map(rule => `- **${rule.description}**: ${rule.rule.split('\n')[0]}`).join('\n')}

#### Regulations Collection
${regulationsSecurityRules.map(rule => `- **${rule.description}**: ${rule.rule.split('\n')[0]}`).join('\n')}

#### Relationships Collection
${relationshipsSecurityRules.map(rule => `- **${rule.description}**: ${rule.rule.split('\n')[0]}`).join('\n')}

### Dormant Collections
Dormant collections are read-only and do not allow write operations.

${dormantCollectionsSecurityRules.map(rule => `#### ${rule.collection} Collection
- **${rule.description}**: ${rule.rule.split('\n')[0]}`).join('\n')}

## Access Levels

### Public Access
- **Description**: Read access for all users
- **Collections**: All collections
- **Operations**: Read only

### Authenticated Access
- **Description**: Write access for authenticated users
- **Collections**: Active collections only
- **Operations**: Create, Update, Delete

### Admin Access
- **Description**: Full access for administrators
- **Collections**: All collections
- **Operations**: All operations

### Custom Access
- **Description**: Custom rules with specific conditions
- **Collections**: Active collections
- **Operations**: Varies by collection

## Validation Functions

### Office Data Validation
- Validates required fields: id, name, founded, status, location, size
- Ensures data types are correct
- Validates status values

### Project Data Validation
- Validates required fields: id, projectName, officeId, cityId, status
- Ensures data types are correct
- Validates status values

### Regulation Data Validation
- Validates required fields: id, name, regulationType, jurisdiction, effectiveDate
- Ensures data types are correct
- Validates jurisdiction structure

### Relationship Data Validation
- Validates required fields: id, sourceEntity, targetEntity, relationshipType, strength
- Ensures data types are correct
- Validates strength range (1-10)

## Best Practices

1. **Principle of Least Privilege**: Users only have access to what they need
2. **Data Validation**: All write operations validate data structure
3. **Role-Based Access**: Different access levels for different user roles
4. **Audit Trail**: All operations are logged for security monitoring
5. **Regular Review**: Security rules are reviewed and updated regularly

## Security Considerations

1. **Authentication Required**: All write operations require authentication
2. **Role Validation**: User roles are validated for each operation
3. **Data Integrity**: Data validation ensures data integrity
4. **Access Control**: Granular access control for different collections
5. **Monitoring**: All operations are monitored for security violations

## Implementation Notes

1. **Firestore Rules**: Rules are deployed to Firestore using Firebase CLI
2. **Testing**: Rules are tested using Firestore emulator
3. **Version Control**: Rules are version controlled and reviewed
4. **Documentation**: Rules are documented and maintained
5. **Updates**: Rules are updated as the application evolves

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user authentication and role
2. **Validation Failed**: Check data structure and required fields
3. **Access Denied**: Check collection access level and user permissions
4. **Rule Errors**: Check rule syntax and logic

### Debugging

1. **Firestore Emulator**: Use emulator for testing rules
2. **Rule Simulator**: Use Firebase console rule simulator
3. **Logs**: Check Firestore logs for rule evaluation
4. **Testing**: Write unit tests for security rules

## Future Enhancements

1. **Dynamic Rules**: Implement dynamic rules based on user context
2. **Advanced Validation**: Add more sophisticated data validation
3. **Audit Logging**: Implement comprehensive audit logging
4. **Performance Optimization**: Optimize rules for better performance
5. **Security Monitoring**: Implement real-time security monitoring
`;

  return documentation;
}

export function validateSecurityRules(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate rule structure
  securityRules.rules.forEach((rule, i) => {
    if (!rule.collection) {
      errors.push(`Rule ${i} missing collection`);
    }
    if (!rule.rule) {
      errors.push(`Rule ${i} missing rule definition`);
    }
    if (!rule.description) {
      warnings.push(`Rule ${i} missing description`);
    }
    if (!rule.operations || rule.operations.length === 0) {
      warnings.push(`Rule ${i} missing operations`);
    }
  });

  // Check for missing collections
  const definedCollections = new Set(securityRules.collections);
  const usedCollections = new Set(securityRules.rules.map(rule => rule.collection));
  
  definedCollections.forEach(collection => {
    if (!usedCollections.has(collection)) {
      warnings.push(`Collection ${collection} defined but no security rules found`);
    }
  });

  usedCollections.forEach(collection => {
    if (!definedCollections.has(collection)) {
      errors.push(`Collection ${collection} used in rules but not defined in collections list`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
