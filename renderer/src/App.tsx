import { useState, useEffect } from 'react';
import { Cross } from '../../cross/Cross';
import { OfficesList } from './components/offices/OfficesList';
import { OfficeDetail } from './components/offices/OfficeDetail';
import { ProjectsList } from './components/projects/ProjectsList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { RegulatoryList } from './components/regulatory/RegulatoryList';
import { RegulatoryDetail } from './components/regulatory/RegulatoryDetail';
import { Office, Project, Regulation } from './types/firestore';
import { useOffices, useProjects, useRegulations } from './hooks/useFirestore';
import { initializeFirebase } from './services/firebase';
import { navigationService } from './services/navigation/navigationService';
import { OrchestratorProvider } from './context/OrchestratorContext';

type ViewType = 'cross' | 'offices-list' | 'office-detail' | 'projects-list' | 'project-detail' | 'regulatory-list' | 'regulatory-detail';

interface AppState {
  currentView: ViewType;
  selectedOffice?: Office;
  selectedProject?: Project;
  selectedRegulation?: Regulation;
  showCross: boolean;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'cross',
    showCross: true
  });

  // Initialize Firebase when app starts
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        console.log('App will continue with mock data');
      }
    };
    initFirebase();
  }, []);

  // Firestore hooks
  const { offices, loadOffices, deleteOffice } = useOffices();
  const { projects, loadProjects, deleteProject } = useProjects();
  const { regulations, loadRegulations, deleteRegulation } = useRegulations();

  // Register navigation service callbacks
  useEffect(() => {
    navigationService.registerCallbacks({
      onNavigate: (view: ViewType) => {
        setAppState(prev => ({
          ...prev,
          currentView: view,
          showCross: view === 'cross'
        }));
      },
      onSelectOffice: (officeId: string) => {
        // Find and select the office
        const office = offices.find(o => o.id === officeId);
        if (office) {
          setAppState(prev => ({
            ...prev,
            selectedOffice: office,
            currentView: 'office-detail'
          }));
        }
      },
      onSelectProject: (projectId: string) => {
        // Find and select the project
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setAppState(prev => ({
            ...prev,
            selectedProject: project,
            currentView: 'project-detail'
          }));
        }
      },
      onSelectRegulation: (regulationId: string) => {
        // Find and select the regulation
        const regulation = regulations.find(r => r.id === regulationId);
        if (regulation) {
          setAppState(prev => ({
            ...prev,
            selectedRegulation: regulation,
            currentView: 'regulatory-detail'
          }));
        }
      },
      onBack: () => {
        handleBackToList();
      },
      onRefresh: () => {
        // Refresh current data
        if (appState.currentView.startsWith('office')) {
          loadOffices();
        } else if (appState.currentView.startsWith('project')) {
          loadProjects();
        } else if (appState.currentView.startsWith('regulatory')) {
          loadRegulations();
        }
      }
    });
  }, [offices, projects, regulations, loadOffices, loadProjects, loadRegulations, appState.currentView]);

  // Handle window management when views change
  useEffect(() => {
    const handleViewChange = async () => {
      if (appState.currentView === 'cross') {
        // Show Cross UI - restore normal window
        if (window.electronAPI?.window) {
          await (window.electronAPI.window as any).restore();
        }
        setAppState(prev => ({ ...prev, showCross: true }));
      } else {
        // Hide Cross UI and maximize window for other views
        if (window.electronAPI?.window?.maximize) {
          await window.electronAPI.window.maximize();
        }
        setAppState(prev => ({ ...prev, showCross: false }));
      }
    };

    handleViewChange();
  }, [appState.currentView]);

  const handleOfficeSelect = (office: Office) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'office-detail',
      selectedOffice: office
    }));
  };

  const handleProjectSelect = (project: Project) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'project-detail',
      selectedProject: project
    }));
  };

  const handleRegulationSelect = (regulation: Regulation) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'regulatory-detail',
      selectedRegulation: regulation
    }));
  };

  const handleBackToList = () => {
    if (appState.currentView === 'office-detail') {
      setAppState(prev => ({
        ...prev,
        currentView: 'offices-list',
        selectedOffice: undefined
      }));
    } else if (appState.currentView === 'project-detail') {
      setAppState(prev => ({
        ...prev,
        currentView: 'projects-list',
        selectedProject: undefined
      }));
    } else if (appState.currentView === 'regulatory-detail') {
      setAppState(prev => ({
        ...prev,
        currentView: 'regulatory-list',
        selectedRegulation: undefined
      }));
    }
  };

  const handleCreateOffice = async () => {
    // For now, just show a placeholder - in a real implementation this would open a form
    console.log('Create office clicked - would open form');
    // Example of creating an office:
    // const newOffice = await createOffice({
    //   name: 'New Office',
    //   officialName: 'New Office Ltd',
    //   founded: new Date().getFullYear(),
    //   status: 'active',
    //   location: { headquarters: { city: 'Unknown', country: 'Unknown' }, otherOffices: [] },
    //   size: { employeeCount: 0, sizeCategory: 'boutique', annualRevenue: 0 },
    //   specializations: [],
    //   notableWorks: [],
    //   connectionCounts: { totalProjects: 0, activeProjects: 0, clients: 0, competitors: 0, suppliers: 0 }
    // });
  };

  const handleCreateProject = async () => {
    console.log('Create project clicked - would open form');
    // Example of creating a project:
    // const newProject = await createProject({
    //   projectName: 'New Project',
    //   officeId: 'unknown',
    //   cityId: 'unknown',
    //   clientId: 'unknown',
    //   status: 'concept',
    //   timeline: { startDate: new Date(), expectedCompletion: new Date() },
    //   location: { city: 'Unknown', country: 'Unknown' },
    //   financial: { budget: 0, currency: 'USD' },
    //   details: { projectType: 'unknown', size: 0, description: 'New project' }
    // });
  };

  const handleCreateRegulation = async () => {
    console.log('Create regulation clicked - would open form');
    // Example of creating a regulation:
    // const newRegulation = await createRegulation({
    //   regulationType: 'zoning',
    //   name: 'New Regulation',
    //   jurisdiction: { level: 'city', country: 'Unknown', countryName: 'Unknown', scope: { appliesToCountry: false, appliesToState: false, appliesToCities: [], appliesToProjectTypes: [] } },
    //   hierarchy: { relatedRegulations: [] },
    //   effectiveDate: new Date(),
    //   version: '1.0',
    //   description: 'New regulation',
    //   requirements: [],
    //   compliance: { mandatory: false, penalties: { fines: '', criminal: false, projectStoppage: false }, requiredCertifications: [], inspectionRequired: false, complianceCost: { estimated: 0, currency: 'USD', perProjectType: {} }, documentationRequired: [] },
    //   enforcement: { enforcingAuthority: '', inspectionFrequency: '', complianceRate: 0, violationCount: 0 },
    //   impact: { level: 'low', affectedProjects: [], economicImpact: '', timelineImpact: '', designImpact: '' },
    //   newsArticles: []
    // });
  };

  const handleEditOffice = async (office: Office) => {
    console.log('Edit office:', office);
    // In a real implementation, this would open an edit form
    // For now, just show a placeholder
    alert('Edit office functionality would open here');
  };

  const handleEditProject = async (project: Project) => {
    console.log('Edit project:', project);
    alert('Edit project functionality would open here');
  };

  const handleEditRegulation = async (regulation: Regulation) => {
    console.log('Edit regulation:', regulation);
    alert('Edit regulation functionality would open here');
  };

  const handleDeleteOffice = async (officeId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this office?');
    if (confirmed) {
      const success = await deleteOffice(officeId);
      if (success) {
        handleBackToList();
      } else {
        alert('Failed to delete office');
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this project?');
    if (confirmed) {
      const success = await deleteProject(projectId);
      if (success) {
        handleBackToList();
      } else {
        alert('Failed to delete project');
      }
    }
  };

  const handleDeleteRegulation = async (regulationId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this regulation?');
    if (confirmed) {
      const success = await deleteRegulation(regulationId);
      if (success) {
        handleBackToList();
      } else {
        alert('Failed to delete regulation');
      }
    }
  };

  const handleNavigateToOffices = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'offices-list'
    }));
  };

  const handleNavigateToProjects = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'projects-list'
    }));
  };

  const handleNavigateToRegulatory = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'regulatory-list'
    }));
  };

  const handleNavigateToCross = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'cross'
    }));
  };

  // Render the appropriate view
  const renderView = () => {
    switch (appState.currentView) {
      case 'cross':
        return <Cross />;
      
      case 'offices-list':
        return (
          <OfficesList
            onOfficeSelect={handleOfficeSelect}
            onCreateOffice={handleCreateOffice}
          />
        );
      
      case 'office-detail':
        if (!appState.selectedOffice) return null;
        return (
          <OfficeDetail
            office={appState.selectedOffice}
            onEdit={handleEditOffice}
            onDelete={handleDeleteOffice}
            onBack={handleBackToList}
          />
        );
      
      case 'projects-list':
        return (
          <ProjectsList
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
            officeId={appState.selectedOffice?.id}
          />
        );
      
      case 'project-detail':
        if (!appState.selectedProject) return null;
        return (
          <ProjectDetail
            project={appState.selectedProject}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onBack={handleBackToList}
          />
        );
      
      case 'regulatory-list':
        return (
          <RegulatoryList
            onRegulationSelect={handleRegulationSelect}
            onCreateRegulation={handleCreateRegulation}
          />
        );
      
      case 'regulatory-detail':
        if (!appState.selectedRegulation) return null;
        return (
          <RegulatoryDetail
            regulation={appState.selectedRegulation}
            onEdit={handleEditRegulation}
            onDelete={handleDeleteRegulation}
            onBack={handleBackToList}
          />
        );
      
      default:
        return <Cross />;
    }
  };

  return (
    <OrchestratorProvider>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar - only show when not in Cross view */}
      {!appState.showCross && (
        <div style={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button
              onClick={handleNavigateToCross}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cross UI
            </button>
            <button
              onClick={handleNavigateToOffices}
              style={{
                backgroundColor: appState.currentView === 'offices-list' || appState.currentView === 'office-detail' ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Offices
            </button>
            <button
              onClick={handleNavigateToProjects}
              style={{
                backgroundColor: appState.currentView === 'projects-list' || appState.currentView === 'project-detail' ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Projects
            </button>
            <button
              onClick={handleNavigateToRegulatory}
              style={{
                backgroundColor: appState.currentView === 'regulatory-list' || appState.currentView === 'regulatory-detail' ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Regulations
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {appState.currentView.replace('-', ' ').toUpperCase()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderView()}
      </div>
      
      </div>
    </OrchestratorProvider>
  );
}

export default App;
