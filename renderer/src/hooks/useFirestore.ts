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
          const { FirestoreOperationsService } = await import('../services/firebase/firestoreOperations');
          firestoreServiceInstance = FirestoreOperationsService.getInstance();
        }
        setService(firestoreServiceInstance);
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize Firestore service - using mock data');
        console.error('Firestore initialization error:', err);
        // Still set initialized to true so the app doesn't hang
        setIsInitialized(true);
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
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      
      if (service && service.isFirebaseAvailable()) {
        const result = await service.queryOffices();
        if (result.success && result.data) {
          setOffices(result.data);
        } else {
          console.error('Failed to load offices:', result.error);
          // Fall back to mock data
          loadMockOffices();
        }
      } else {
        // Firebase not available, use mock data
        console.log('Firebase not available, loading mock offices');
        loadMockOffices();
      }
    } catch (err) {
      console.error('Error loading offices:', err);
      // Fall back to mock data
      loadMockOffices();
    } finally {
      setLoading(false);
    }
  }, [service, isInitialized]);

  const loadMockOffices = () => {
    const mockOffices: Office[] = [
      {
        id: 'GBLO482',
        name: 'Zaha Hadid Architects',
        officialName: 'Zaha Hadid Architects',
        founded: 1980,
        status: 'active',
        location: {
          headquarters: {
            city: 'London',
            country: 'UK',
            coordinates: undefined,
            address: '10 Bowling Green Lane',
            neighborhood: 'Clerkenwell'
          },
          otherOffices: []
        },
        size: {
          employeeCount: 400,
          sizeCategory: 'large',
          annualRevenue: 50000000
        },
        specializations: ['parametric-design', 'cultural-architecture'],
        notableWorks: ['Heydar Aliyev Center', 'MAXXI Museum'],
        connectionCounts: {
          totalProjects: 950,
          activeProjects: 45,
          clients: 120,
          competitors: 15,
          suppliers: 80
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      }
    ];
    setOffices(mockOffices);
  };

  const createOffice = useCallback(async (officeData: Partial<Office>) => {
    if (!service || !isInitialized || !service.isFirebaseAvailable()) return null;
    
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
    if (!service || !isInitialized || !service.isFirebaseAvailable()) return false;
    
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
    if (!service || !isInitialized || !service.isFirebaseAvailable()) return false;
    
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
    if (!service || !isInitialized || !service.isFirebaseAvailable()) return null;
    
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
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      
      if (service && service.isFirebaseAvailable()) {
        const options = officeId ? { filters: [{ field: 'officeId', operator: '==', value: officeId }] } : undefined;
        const result = await service.queryProjects(options);
        if (result.success && result.data) {
          setProjects(result.data);
        } else {
          console.error('Failed to load projects:', result.error);
          loadMockProjects(officeId);
        }
      } else {
        console.log('Firebase not available, loading mock projects');
        loadMockProjects(officeId);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      loadMockProjects(officeId);
    } finally {
      setLoading(false);
    }
  }, [service, isInitialized]);

  const loadMockProjects = (officeId?: string) => {
    const mockProjects: Project[] = [
      {
        id: 'heydar-aliyev-center',
        projectName: 'Heydar Aliyev Center',
        officeId: 'GBLO482',
        cityId: 'baku-az',
        clientId: 'aliyev-foundation',
        status: 'completed',
        timeline: {
          startDate: new Date('2007-01-01') as any,
          expectedCompletion: new Date('2012-01-01') as any,
          actualCompletion: new Date('2012-05-10') as any
        },
        location: {
          city: 'Baku',
          country: 'Azerbaijan',
          coordinates: undefined,
          address: 'Heydar Aliyev Avenue 1',
          neighborhood: 'Narimanov District'
        },
        financial: {
          budget: 250000000,
          currency: 'USD',
          actualCost: 250000000
        },
        details: {
          projectType: 'cultural',
          size: 57500,
          description: 'Cultural center with flowing parametric design'
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      }
    ];
    
    const filteredProjects = officeId 
      ? mockProjects.filter(p => p.officeId === officeId)
      : mockProjects;
    
    setProjects(filteredProjects);
  };

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
    if (!isInitialized) return;
    
    try {
      setLoading(true);
      
      if (service && service.isFirebaseAvailable()) {
        const options = jurisdiction ? { 
          filters: [{ field: 'jurisdiction.cityName', operator: '==', value: jurisdiction }] 
        } : undefined;
        const result = await service.queryRegulations(options);
        if (result.success && result.data) {
          setRegulations(result.data);
        } else {
          console.error('Failed to load regulations:', result.error);
          loadMockRegulations(jurisdiction);
        }
      } else {
        console.log('Firebase not available, loading mock regulations');
        loadMockRegulations(jurisdiction);
      }
    } catch (err) {
      console.error('Error loading regulations:', err);
      loadMockRegulations(jurisdiction);
    } finally {
      setLoading(false);
    }
  }, [service, isInitialized]);

  const loadMockRegulations = (jurisdiction?: string) => {
    const mockRegulations: Regulation[] = [
      {
        id: 'nyc-manhattan-height-restriction-2024',
        regulationType: 'zoning',
        name: 'Manhattan Upper East Side Height Restriction',
        jurisdiction: {
          level: 'city',
          country: 'US',
          countryName: 'United States',
          state: 'New York',
          cityId: 'new-york-ny',
          cityName: 'New York City',
          scope: {
            appliesToCountry: false,
            appliesToState: false,
            appliesToCities: ['new-york-ny'],
            appliesToProjectTypes: ['residential']
          }
        },
        hierarchy: {
          parentRegulation: undefined,
          supersededBy: undefined,
          relatedRegulations: [],
          derivedFrom: undefined
        },
        effectiveDate: new Date('2024-01-01') as any,
        expirationDate: undefined,
        version: '1.0',
        description: 'Height restrictions updated to 150 feet for residential buildings in Upper East Side',
        requirements: [
          {
            requirement: 'Maximum height: 150 feet',
            mandatory: true,
            applicableTo: ['residential'],
            exceptions: ['landmark buildings'],
            technicalSpec: 'Measured from street level to highest occupied floor'
          }
        ],
        compliance: {
          mandatory: true,
          penalties: {
            fines: 'Up to $25,000 per violation',
            criminal: false,
            projectStoppage: true
          },
          requiredCertifications: ['Height Compliance Certificate'],
          inspectionRequired: true,
          complianceCost: {
            estimated: 5000,
            currency: 'USD',
            perProjectType: {
              residential: 5000,
              commercial: 0
            }
          },
          documentationRequired: ['Height calculations', 'Architectural drawings', 'Survey reports']
        },
        enforcement: {
          enforcingAuthority: 'NYC Department of Buildings',
          inspectionFrequency: 'Pre-construction and during construction',
          complianceRate: 95,
          violationCount: 12
        },
        impact: {
          level: 'high',
          affectedProjects: ['luxury-residential-upper-east-side'],
          economicImpact: 'Increased construction costs for tall residential buildings',
          timelineImpact: 'Additional 2-4 weeks for compliance review',
          designImpact: 'Requires architectural modifications for height compliance'
        },
        newsArticles: [],
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      }
    ];
    
    const filteredRegulations = jurisdiction 
      ? mockRegulations.filter(r => 
          r.jurisdiction.cityName?.toLowerCase().includes(jurisdiction.toLowerCase()) ||
          r.jurisdiction.countryName?.toLowerCase().includes(jurisdiction.toLowerCase())
        )
      : mockRegulations;
    
    setRegulations(filteredRegulations);
  };

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
