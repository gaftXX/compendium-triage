import { firestoreOperations } from '../firebase/firestoreOperations';
import {
  Office,
  Workforce,
  Project,
  Relationship,
  MeditationData,
  BTWorkspace,
} from '../../types/firestore';

export interface OfficeFullProfile {
  office: Office;
  workforce?: Workforce;
  projects: Project[];
  relationships: Relationship[];
  meditations: MeditationData[];
  workspaces: BTWorkspace[];
}

export interface OfficeFullProfileResult {
  success: boolean;
  data?: OfficeFullProfile;
  error?: string;
  warnings?: string[];
}

export async function getOfficeFullProfile(officeId: string): Promise<OfficeFullProfileResult> {
  try {
    if (!officeId || typeof officeId !== 'string') {
      return {
        success: false,
        error: 'officeId is required to fetch the full profile',
      };
    }

    const officePromise = firestoreOperations.readDocument<Office>('offices', officeId);
    const workforcePromise = firestoreOperations.queryDocuments<Workforce>('workforce', {
      filters: [{ field: 'officeId', operator: '==', value: officeId }],
      limit: 1,
    });
    const projectsPromise = firestoreOperations.queryDocuments<Project>('projects', {
      filters: [{ field: 'officeId', operator: '==', value: officeId }],
    });
    const relationshipsSourcePromise = firestoreOperations.queryDocuments<Relationship>('relationships', {
      filters: [{ field: 'sourceEntity.id', operator: '==', value: officeId }],
    });
    const relationshipsTargetPromise = firestoreOperations.queryDocuments<Relationship>('relationships', {
      filters: [{ field: 'targetEntity.id', operator: '==', value: officeId }],
    });
    const meditationsPromise = firestoreOperations.queryDocuments<MeditationData>('meditations', {
      filters: [{ field: 'officeId', operator: '==', value: officeId }],
    });
    const workspacesPromise = firestoreOperations.queryDocuments<BTWorkspace>('bt-workspaces', {
      filters: [{ field: 'officeId', operator: '==', value: officeId }],
    });

    const [
      officeResult,
      workforceResult,
      projectsResult,
      relationshipsSourceResult,
      relationshipsTargetResult,
      meditationsResult,
      workspacesResult,
    ] = await Promise.all([
      officePromise,
      workforcePromise,
      projectsPromise,
      relationshipsSourcePromise,
      relationshipsTargetPromise,
      meditationsPromise,
      workspacesPromise,
    ]);

    if (!officeResult.success || !officeResult.data) {
      return {
        success: false,
        error: officeResult.error || `Office with ID ${officeId} was not found.`,
      };
    }

    const warnings: string[] = [];

    const projects = projectsResult.success && projectsResult.data ? projectsResult.data : [];
    if (!projectsResult.success) {
      warnings.push(projectsResult.error || 'Failed to retrieve projects for this office.');
    }

    const meditations = meditationsResult.success && meditationsResult.data ? meditationsResult.data : [];
    if (!meditationsResult.success) {
      warnings.push(meditationsResult.error || 'Failed to retrieve meditations for this office.');
    }

    const workspaces = workspacesResult.success && workspacesResult.data ? workspacesResult.data : [];
    if (!workspacesResult.success) {
      warnings.push(workspacesResult.error || 'Failed to retrieve BT workspaces for this office.');
    }

    const relationshipsSource = relationshipsSourceResult.success && relationshipsSourceResult.data
      ? relationshipsSourceResult.data
      : [];
    if (!relationshipsSourceResult.success) {
      warnings.push(relationshipsSourceResult.error || 'Failed to retrieve relationships where office is the source.');
    }

    const relationshipsTarget = relationshipsTargetResult.success && relationshipsTargetResult.data
      ? relationshipsTargetResult.data
      : [];
    if (!relationshipsTargetResult.success) {
      warnings.push(relationshipsTargetResult.error || 'Failed to retrieve relationships where office is the target.');
    }

    const relationshipMap = new Map<string, Relationship>();
    [...relationshipsSource, ...relationshipsTarget].forEach((relationship) => {
      if (!relationshipMap.has(relationship.id)) {
        relationshipMap.set(relationship.id, relationship);
      }
    });

    const workforce = workforceResult.success && workforceResult.data && workforceResult.data.length > 0
      ? workforceResult.data[0]
      : undefined;
    if (!workforceResult.success) {
      warnings.push(workforceResult.error || 'Failed to retrieve workforce data for this office.');
    }

    return {
      success: true,
      data: {
        office: officeResult.data,
        workforce,
        projects,
        relationships: Array.from(relationshipMap.values()),
        meditations,
        workspaces,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assemble office profile.',
    };
  }
}

