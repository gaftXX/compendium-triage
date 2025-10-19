/**
 * Project Actions Handler
 * 
 * Handles all project-related operations for the AI Orchestrator.
 * These actions work with the Firestore operations from Phase 2.
 */

import { 
  createProject, 
  updateProject, 
  deleteProject, 
  getProject,
  queryProjects
} from '../../renderer/src/services/firebase/dataService';
import { Project, CreateProjectData, UpdateProjectData } from '../../renderer/src/types/firestore';

export interface ProjectActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Create a new architecture project
 */
export async function createProjectAction(params: {
  name: string;
  officeId: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  location?: string;
  type?: string;
}): Promise<ProjectActionResult> {
  try {
    // Validate required parameters
    if (!params.name || !params.officeId) {
      return {
        success: false,
        error: 'Missing required parameters: name and officeId are required'
      };
    }

    // Prepare project data
    const projectData: CreateProjectData = {
      name: params.name,
      officeId: params.officeId,
      description: params.description || '',
      status: params.status || 'planning',
      startDate: params.startDate || null,
      endDate: params.endDate || null,
      budget: params.budget || null,
      location: params.location || '',
      type: params.type || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create project using Firestore operations
    const project = await createProject(projectData);

    return {
      success: true,
      data: project,
      message: `Successfully created project: ${project.name} (${project.id})`
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update an existing architecture project
 */
export async function updateProjectAction(params: {
  projectId: string;
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  location?: string;
  type?: string;
}): Promise<ProjectActionResult> {
  try {
    // Validate required parameters
    if (!params.projectId) {
      return {
        success: false,
        error: 'Missing required parameter: projectId is required'
      };
    }

    // Prepare update data (only include provided fields)
    const updateData: UpdateProjectData = {
      updatedAt: new Date()
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.startDate !== undefined) updateData.startDate = params.startDate;
    if (params.endDate !== undefined) updateData.endDate = params.endDate;
    if (params.budget !== undefined) updateData.budget = params.budget;
    if (params.location !== undefined) updateData.location = params.location;
    if (params.type !== undefined) updateData.type = params.type;

    // Update project using Firestore operations
    const project = await updateProject(params.projectId, updateData);

    return {
      success: true,
      data: project,
      message: `Successfully updated project: ${project.name} (${project.id})`
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete an architecture project
 */
export async function deleteProjectAction(params: {
  projectId: string;
}): Promise<ProjectActionResult> {
  try {
    // Validate required parameters
    if (!params.projectId) {
      return {
        success: false,
        error: 'Missing required parameter: projectId is required'
      };
    }

    // Delete project using Firestore operations
    await deleteProject(params.projectId);

    return {
      success: true,
      message: `Successfully deleted project: ${params.projectId}`
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get detailed information about a specific project
 */
export async function getProjectAction(params: {
  projectId: string;
  includeRelationships?: boolean;
}): Promise<ProjectActionResult> {
  try {
    // Validate required parameters
    if (!params.projectId) {
      return {
        success: false,
        error: 'Missing required parameter: projectId is required'
      };
    }

    // Get project using Firestore operations
    const project = await getProject(params.projectId);

    if (!project) {
      return {
        success: false,
        error: `Project not found: ${params.projectId}`
      };
    }

    return {
      success: true,
      data: project,
      message: `Retrieved project: ${project.name} (${project.id})`
    };
  } catch (error) {
    console.error('Error getting project:', error);
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
}): Promise<ProjectActionResult> {
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
 * Action handler mapping for registry
 */
export const projectActions = {
  createProject: createProjectAction,
  updateProject: updateProjectAction,
  deleteProject: deleteProjectAction,
  getProject: getProjectAction,
  searchProjects: searchProjectsAction
};
