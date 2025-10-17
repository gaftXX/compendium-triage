import { useState, useEffect, useCallback } from 'react';
import { FirestoreService } from '../types/operations';
import { Office, Project, Regulation } from '../types/firestore';

// Create a singleton instance of FirestoreService
let firestoreServiceInstance: FirestoreService | null = null;

export const useFirestore = () => {
  const [service, setService] = useState<FirestoreService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!firestoreServiceInstance) {
          const { FirestoreService } = await import('../services/firebase/firestoreOperations');
          firestoreServiceInstance = new FirestoreService();
        }
        setService(firestoreServiceInstance);
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize Firestore service');
        console.error('Firestore initialization error:', err);
      }
    };

    initializeService();
  }, []);

  return {
    service,
    isInitialized,
    error
  };
};

// Office operations hook
export const useOffices = () => {
  const { service, isInitialized, error } = useFirestore();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOffices = useCallback(async () => {
    if (!service || !isInitialized) return;
    
    try {
      setLoading(true);
      const result = await service.queryOffices();
      if (result.success && result.data) {
        setOffices(result.data);
      } else {
        console.error('Failed to load offices:', result.error);
      }
    } catch (err) {
      console.error('Error loading offices:', err);
    } finally {
      setLoading(false);
    }
  }, [service, isInitialized]);

  const createOffice = useCallback(async (officeData: Partial<Office>) => {
    if (!service || !isInitialized) return null;
    
    try {
      const result = await service.createOffice(officeData);
      if (result.success) {
        await loadOffices(); // Reload the list
        return result.data;
      } else {
        console.error('Failed to create office:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error creating office:', err);
      return null;
    }
  }, [service, isInitialized, loadOffices]);

  const updateOffice = useCallback(async (id: string, officeData: Partial<Office>) => {
    if (!service || !isInitialized) return false;
    
    try {
      const result = await service.updateOffice(id, officeData);
      if (result.success) {
        await loadOffices(); // Reload the list
        return true;
      } else {
        console.error('Failed to update office:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error updating office:', err);
      return false;
    }
  }, [service, isInitialized, loadOffices]);

  const deleteOffice = useCallback(async (id: string) => {
    if (!service || !isInitialized) return false;
    
    try {
      const result = await service.deleteOffice(id);
      if (result.success) {
        await loadOffices(); // Reload the list
        return true;
      } else {
        console.error('Failed to delete office:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error deleting office:', err);
      return false;
    }
  }, [service, isInitialized, loadOffices]);

  const getOffice = useCallback(async (id: string) => {
    if (!service || !isInitialized) return null;
    
    try {
      const result = await service.getOffice(id);
      if (result.success) {
        return result.data;
      } else {
        console.error('Failed to get office:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error getting office:', err);
      return null;
    }
  }, [service, isInitialized]);

  return {
    offices,
    loading,
    error,
    loadOffices,
    createOffice,
    updateOffice,
    deleteOffice,
    getOffice
  };
};

// Project operations hook
export const useProjects = () => {
  const { service, isInitialized, error } = useFirestore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async (officeId?: string) => {
    if (!service || !isInitialized) return;
    
    try {
      setLoading(true);
      const options = officeId ? { filters: [{ field: 'officeId', operator: '==', value: officeId }] } : undefined;
      const result = await service.queryProjects(options);
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        console.error('Failed to load projects:', result.error);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, [service, isInitialized]);

  const createProject = useCallback(async (projectData: Partial<Project>) => {
    if (!service || !isInitialized) return null;
    
    try {
      const result = await service.createProject(projectData);
      if (result.success) {
        await loadProjects(); // Reload the list
        return result.data;
      } else {
        console.error('Failed to create project:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error creating project:', err);
      return null;
    }
  }, [service, isInitialized, loadProjects]);

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
    if (!service || !isInitialized) return false;
    
    try {
      const result = await service.updateProject(id, projectData);
      if (result.success) {
        await loadProjects(); // Reload the list
        return true;
      } else {
        console.error('Failed to update project:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error updating project:', err);
      return false;
    }
  }, [service, isInitialized, loadProjects]);

  const deleteProject = useCallback(async (id: string) => {
    if (!service || !isInitialized) return false;
    
    try {
      const result = await service.deleteProject(id);
      if (result.success) {
        await loadProjects(); // Reload the list
        return true;
      } else {
        console.error('Failed to delete project:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      return false;
    }
  }, [service, isInitialized, loadProjects]);

  const getProject = useCallback(async (id: string) => {
    if (!service || !isInitialized) return null;
    
    try {
      const result = await service.getProject(id);
      if (result.success) {
        return result.data;
      } else {
        console.error('Failed to get project:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error getting project:', err);
      return null;
    }
  }, [service, isInitialized]);

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject
  };
};

// Regulation operations hook
export const useRegulations = () => {
  const { service, isInitialized, error } = useFirestore();
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRegulations = useCallback(async (jurisdiction?: string) => {
    if (!service || !isInitialized) return;
    
    try {
      setLoading(true);
      // Note: This is a simplified filter - in a real implementation you might want more sophisticated filtering
      const options = jurisdiction ? { 
        filters: [{ field: 'jurisdiction.cityName', operator: '==', value: jurisdiction }] 
      } : undefined;
      const result = await service.queryRegulations(options);
      if (result.success && result.data) {
        setRegulations(result.data);
      } else {
        console.error('Failed to load regulations:', result.error);
      }
    } catch (err) {
      console.error('Error loading regulations:', err);
    } finally {
      setLoading(false);
    }
  }, [service, isInitialized]);

  const createRegulation = useCallback(async (regulationData: Partial<Regulation>) => {
    if (!service || !isInitialized) return null;
    
    try {
      const result = await service.createRegulation(regulationData);
      if (result.success) {
        await loadRegulations(); // Reload the list
        return result.data;
      } else {
        console.error('Failed to create regulation:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error creating regulation:', err);
      return null;
    }
  }, [service, isInitialized, loadRegulations]);

  const updateRegulation = useCallback(async (id: string, regulationData: Partial<Regulation>) => {
    if (!service || !isInitialized) return false;
    
    try {
      const result = await service.updateRegulation(id, regulationData);
      if (result.success) {
        await loadRegulations(); // Reload the list
        return true;
      } else {
        console.error('Failed to update regulation:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error updating regulation:', err);
      return false;
    }
  }, [service, isInitialized, loadRegulations]);

  const deleteRegulation = useCallback(async (id: string) => {
    if (!service || !isInitialized) return false;
    
    try {
      const result = await service.deleteRegulation(id);
      if (result.success) {
        await loadRegulations(); // Reload the list
        return true;
      } else {
        console.error('Failed to delete regulation:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error deleting regulation:', err);
      return false;
    }
  }, [service, isInitialized, loadRegulations]);

  const getRegulation = useCallback(async (id: string) => {
    if (!service || !isInitialized) return null;
    
    try {
      const result = await service.getRegulation(id);
      if (result.success) {
        return result.data;
      } else {
        console.error('Failed to get regulation:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error getting regulation:', err);
      return null;
    }
  }, [service, isInitialized]);

  return {
    regulations,
    loading,
    error,
    loadRegulations,
    createRegulation,
    updateRegulation,
    deleteRegulation,
    getRegulation
  };
};
