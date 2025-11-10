import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { BTWorkspace, Office, Financial, Workforce, Project, CompanyStructure, Relationship, MeditationData } from '../../types/firestore';
import { ClaudeAIService } from '../../services/claudeAIService';
import { navigationService } from '../../services/navigation/navigationService';
import { ContextProvider } from '../../../../aiOrchestra/gen2/contextProvider';
import { BasicOfficeDataWindow } from './windows/BasicOfficeDataWindow';
import { ProjectsListWindow } from './windows/ProjectsListWindow';
import { ProjectsTimelineWindow } from './windows/ProjectsTimelineWindow';
import { EmployeesListWindow } from './windows/EmployeesListWindow';
import { OfficeNotesWindow } from './windows/OfficeNotesWindow';
import { CompanyStructureWindow } from './windows/CompanyStructureWindow';
import { OfficeFinancialsWindow } from './windows/OfficeFinancialsWindow';

interface BTViewPageProps {
  params?: any;
}

type WindowType = 'basic-office-data' | 'projects-list' | 'projects-timeline' | 'employees-list' | 'office-notes' | 'company-structure' | 'office-financials';

interface Window {
  id: string;
  type: WindowType;
  gridPosition: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
}

const GRID_COLS = 5;
const GRID_ROWS = 2;
const CELL_SIZE = 340;

const WINDOW_OPTIONS: Array<{ type: WindowType; label: string }> = [
  { type: 'basic-office-data', label: 'Basic Office Data' },
  { type: 'projects-list', label: 'Projects List' },
  { type: 'projects-timeline', label: 'Projects Timeline' },
  { type: 'employees-list', label: 'Employees List' },
  { type: 'office-notes', label: 'Office Notes' },
  { type: 'company-structure', label: 'Company Structure' },
  { type: 'office-financials', label: 'Office Financials' }
];

export const BTViewPage: React.FC<BTViewPageProps> = ({ params }) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const hasLoadedWorkspace = useRef(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [draggedWindowId, setDraggedWindowId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [resizingWindowId, setResizingWindowId] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right' | null>(null);
  const [office, setOffice] = useState<Office | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isProcessingNote, setIsProcessingNote] = useState(false);
  const [showMeditationInput, setShowMeditationInput] = useState(false);
  const [meditationText, setMeditationText] = useState('');
  const [meditationTitle, setMeditationTitle] = useState('');
  const [isCreatingMeditation, setIsCreatingMeditation] = useState(false);
  const claudeService = ClaudeAIService.getInstance();
  const contextProvider = ContextProvider.getInstance();

  // Helper functions: gridPosition.col is now the MIDDLE column (base point)
  // Calculate leftmost column from middle column and width
  const getLeftmostCol = (middleCol: number, width: number): number => {
    return middleCol - Math.floor((width - 1) / 2);
  };

  // Calculate rightmost column from middle column and width
  const getRightmostCol = (middleCol: number, width: number): number => {
    return middleCol + Math.floor(width / 2);
  };

  // Adjust middle column to ensure window fits within grid bounds
  const clampMiddleCol = (desiredMiddleCol: number, width: number): number => {
    const leftmost = getLeftmostCol(desiredMiddleCol, width);
    const rightmost = getRightmostCol(desiredMiddleCol, width);
    
    if (leftmost < 0) {
      // Shift right to fit
      return desiredMiddleCol + (0 - leftmost);
    }
    if (rightmost >= GRID_COLS) {
      // Shift left to fit
      return desiredMiddleCol - (rightmost - GRID_COLS + 1);
    }
    return desiredMiddleCol;
  };

  useEffect(() => {
    if (params?.officeId) {
      setOfficeId(params.officeId);
      setWorkspaceId(`bt-view-${params.officeId}`);
    }
  }, [params]);

  useEffect(() => {
    const fetchOffice = async () => {
      if (!officeId) {
        setOffice(null);
        return;
      }

      try {
        const result = await firestoreOperations.readDocument<Office>('offices', officeId);
        if (result.success && result.data) {
          setOffice(result.data);
        } else {
          setOffice(null);
        }
      } catch (error) {
        console.error('Error fetching office:', error);
        setOffice(null);
      }
    };

    fetchOffice();
  }, [officeId]);

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId || hasLoadedWorkspace.current) return;

    try {
      const result = await firestoreOperations.readDocument<BTWorkspace>('bt-workspaces', workspaceId);
      if (result.success && result.data) {
        const savedWorkspace = result.data;
        // Ensure all windows have width and height
        const windowsWithDefaults = (savedWorkspace.windows || []).map(w => ({
          ...w,
          gridPosition: {
            row: w.gridPosition.row,
            col: w.gridPosition.col,
            width: w.gridPosition.width || 1,
            height: w.gridPosition.height || 1
          }
        }));
        setWindows(windowsWithDefaults);
        hasLoadedWorkspace.current = true;
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  }, [workspaceId]);

  const saveWorkspace = useCallback(async () => {
    if (!workspaceId || !officeId) return;

    try {
      await firestoreOperations.create('bt-workspaces', {
        id: workspaceId,
        officeId: officeId,
        windows
      });
    } catch (error) {
      console.error('Error saving workspace:', error);
    }
  }, [windows, workspaceId, officeId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (hasLoadedWorkspace.current) {
      saveWorkspace();
    }
  }, [windows, saveWorkspace]);

  useEffect(() => {
    return () => {
      saveWorkspace();
    };
  }, [saveWorkspace]);

  // Update context provider when page loads
  useEffect(() => {
    contextProvider.setCurrentPage('bt-view');
    
    return () => {
      // Clear context when leaving page
      contextProvider.updateContext({
        currentPage: 'unknown',
        openWindows: []
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update context provider when windows change
  useEffect(() => {
    const windowLabels = windows.map(w => {
      const option = WINDOW_OPTIONS.find(opt => opt.type === w.type);
      return option ? option.label : w.type;
    });
    
    contextProvider.updateContext({
      openWindows: windowLabels
    });
  }, [windows]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update selected entity when office changes
  useEffect(() => {
    if (office && officeId) {
      contextProvider.setSelectedEntity('office', officeId, office.name);
    }
  }, [office, officeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddWindow = useCallback((windowType: WindowType) => {
    setWindows(prev => {
      // Check if a position is occupied (accounting for window widths)
      const isPositionOccupied = (row: number, col: number): boolean => {
        return prev.some(w => {
          const wLeftmost = getLeftmostCol(w.gridPosition.col, w.gridPosition.width || 1);
          const wRightmost = getRightmostCol(w.gridPosition.col, w.gridPosition.width || 1);
          return w.gridPosition.row === row && col >= wLeftmost && col <= wRightmost;
        });
      };

      let foundPosition: { row: number; col: number } | null = null;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (!isPositionOccupied(row, col)) {
            foundPosition = { row, col };
            break;
          }
        }
        if (foundPosition) break;
      }

      const position = foundPosition || { row: 0, col: 0 };
      
      const newWindow: Window = {
        id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: windowType,
        gridPosition: {
          row: position.row,
          col: position.col, // This is now the middle column (same as leftmost for width=1)
          width: 1,
          height: 1
        }
      };
      
      return [...prev, newWindow];
    });
  }, []);

  const handleRemoveWindow = (windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const getNoteableWindowType = (windowType: WindowType): 'project' | 'workforce' | 'financial' | 'companyStructure' | null => {
    switch (windowType) {
      case 'projects-list':
        return 'project';
      case 'employees-list':
        return 'workforce';
      case 'office-financials':
        return 'financial';
      case 'company-structure':
        return 'companyStructure';
      default:
        return null;
    }
  };

  const handleNoteSubmit = useCallback(async () => {
    if (!noteText.trim() || !selectedWindowId || !officeId || isProcessingNote) return;

    const selectedWindow = windows.find(w => w.id === selectedWindowId);
    if (!selectedWindow) return;

    const targetType = getNoteableWindowType(selectedWindow.type);
    if (!targetType) return;

    setIsProcessingNote(true);

    try {
      // Get API key from environment
      const apiKey = (import.meta as any).env.VITE_ANTHROPIC_API_KEY || (import.meta as any).env.VITE_CLAUDE_API_KEY || '';

      if (!apiKey) {
        alert('Claude API key not configured. Please configure it in settings.');
        setIsProcessingNote(false);
        setShowNoteInput(false);
        setNoteText('');
        return;
      }

      // Analyze the note with Claude AI
      claudeService.setApiKey(apiKey);
      const analysis = await claudeService.analyzeText(noteText);

      if (!analysis.categorization || analysis.categorization.confidence < 0.7) {
        alert('Could not determine the type of information in the note. Please be more specific.');
        setIsProcessingNote(false);
        setShowNoteInput(false);
        setNoteText('');
        return;
      }

      const category = analysis.categorization.category;
      const extractedData = analysis.extraction.extractedData;

      // Create the appropriate document based on category and target type
      let createdDocumentId: string | null = null;

      if (targetType === 'financial' && category === 'financial') {
        // Create Financial document
        const financialData: Omit<Financial, 'id' | 'createdAt' | 'updatedAt'> = {
          officeId: officeId,
          recordType: (extractedData as any).recordType || 'expense',
          amount: (extractedData as any).amount || 0,
          currency: (extractedData as any).currency || 'USD',
          date: (extractedData as any).date ? Timestamp.fromDate(new Date((extractedData as any).date)) : Timestamp.now(),
          period: (extractedData as any).period,
          source: (extractedData as any).source || '',
          destination: (extractedData as any).destination || '',
          category: (extractedData as any).category || '',
          details: noteText
        };

        const result = await firestoreOperations.create('financials', financialData);
        if (result.success && result.data) {
          createdDocumentId = result.data.id;
        }
      } else if (targetType === 'workforce' && category === 'office') {
        // Create or update Workforce document
        // First check if workforce document exists
        const existingWorkforce = await firestoreOperations.query('workforce', {
          filters: [{ field: 'officeId', operator: '==', value: officeId }]
        });

        if (existingWorkforce.success && existingWorkforce.data && existingWorkforce.data.length > 0) {
          // Update existing workforce
          const workforce = existingWorkforce.data[0] as Workforce;
          const updatedEmployees = [...(workforce.employees || [])];
          
          if ((extractedData as any).employees && (extractedData as any).employees.length > 0) {
            updatedEmployees.push(...(extractedData as any).employees);
          }

          await firestoreOperations.update('workforce', workforce.id, {
            employees: updatedEmployees
          });
          createdDocumentId = workforce.id;
        } else {
          // Create new workforce
          const workforceData: Omit<Workforce, 'id' | 'createdAt' | 'updatedAt'> = {
            officeId: officeId,
            employees: (extractedData as any).employees || [],
            aggregate: (extractedData as any).aggregate,
            talentSources: [],
            partnerships: [],
            keyPersonnel: [],
            skillsMatrix: {}
          };

          const result = await firestoreOperations.create('workforce', workforceData);
          if (result.success && result.data) {
            createdDocumentId = result.data.id;
          }
        }
      } else if (targetType === 'project' && category === 'project') {
        // Create Project document
        const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
          projectName: (extractedData as any).projectName || 'Untitled Project',
          officeId: officeId,
          cityId: '', // Will need to be filled in
          clientId: '',
          status: (extractedData as any).status || 'concept',
          timeline: {
            startDate: (extractedData as any).timeline?.startDate ? Timestamp.fromDate(new Date((extractedData as any).timeline.startDate)) : Timestamp.now(),
            expectedCompletion: Timestamp.now()
          },
          location: (extractedData as any).location || { city: '', country: '', address: '' },
          financial: (extractedData as any).financial || { budget: 0, currency: 'USD' },
          details: (extractedData as any).details || { projectType: '', size: 0, description: '' }
        };

        const result = await firestoreOperations.create('projects', projectData);
        if (result.success && result.data) {
          createdDocumentId = result.data.id;
        }
      } else if (targetType === 'companyStructure' && category === 'companyStructure') {
        // Create CompanyStructure document
        const companyStructureData: Omit<CompanyStructure, 'id' | 'createdAt' | 'updatedAt'> = {
          officeId: officeId,
          structure: (extractedData as any).structure || {
            organizationType: 'corporation',
            departments: [],
            hierarchy: { levels: 0, reportingStructure: '' }
          },
          leadership: (extractedData as any).leadership || [],
          divisions: (extractedData as any).divisions || [],
          governance: (extractedData as any).governance || { ownership: '', boardMembers: [] }
        };

        const result = await firestoreOperations.create('companyStructure', companyStructureData);
        if (result.success && result.data) {
          createdDocumentId = result.data.id;
        }
      }

      // Create relationship if document was created
      if (createdDocumentId) {
        const relationshipData: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> = {
          sourceEntity: {
            type: 'office',
            id: officeId
          },
          targetEntity: {
            type: targetType,
            id: createdDocumentId
          },
          relationshipType: 'partner'
        };

        await firestoreOperations.create('relationships', relationshipData);
      }

      // Reset state
      setShowNoteInput(false);
      setNoteText('');
      
      // Refresh windows to show new data
      // This will be handled by the window components' useEffect hooks

    } catch (error) {
      console.error('Error processing note:', error);
      alert('Error processing note: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessingNote(false);
    }
  }, [noteText, selectedWindowId, officeId, windows, claudeService, isProcessingNote]);

  const handleMeditationSubmit = useCallback(async () => {
    if (!meditationText.trim() || !officeId || isCreatingMeditation) return;

    setIsCreatingMeditation(true);

    try {
      const meditationData: Omit<MeditationData, 'id' | 'createdAt' | 'updatedAt'> = {
        title: meditationTitle.trim() || undefined,
        text: meditationText.trim(),
        officeId: officeId
      };

      const result = await firestoreOperations.create('meditations', meditationData);
      
      if (result.success) {
        setShowMeditationInput(false);
        setMeditationText('');
        setMeditationTitle('');
      } else {
        alert('Error creating meditation: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating meditation:', error);
      alert('Error creating meditation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreatingMeditation(false);
    }
  }, [meditationText, meditationTitle, officeId, isCreatingMeditation]);

  const handleWindowRightClick = (windowId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedWindowId === windowId) {
      setSelectedWindowId(null);
    } else {
      setSelectedWindowId(windowId);
    }
  };

  const handleWindowDragStart = (windowId: string, e: React.DragEvent) => {
    if (selectedWindowId !== windowId) {
      e.preventDefault();
      return;
    }
    setDraggedWindowId(windowId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleWindowDragEnd = () => {
    setDraggedWindowId(null);
  };

  const handleGridClick = () => {
    setSelectedWindowId(null);
  };

  const handleCellDrop = (row: number, col: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedWindowId) return;

    setWindows(prev => {
      const draggedWindow = prev.find(w => w.id === draggedWindowId);
      if (!draggedWindow) return prev;

      // Clamp the middle column to ensure window fits within grid
      const clampedCol = clampMiddleCol(col, draggedWindow.gridPosition.width || 1);
      const draggedLeftmost = getLeftmostCol(clampedCol, draggedWindow.gridPosition.width || 1);
      const draggedRightmost = getRightmostCol(clampedCol, draggedWindow.gridPosition.width || 1);
      
      // Check if any cell in the target area is occupied
      const existingWindowAtTarget = prev.find(w => {
        if (w.id === draggedWindowId) return false;
        
        const wLeftmost = getLeftmostCol(w.gridPosition.col, w.gridPosition.width || 1);
        const wRightmost = getRightmostCol(w.gridPosition.col, w.gridPosition.width || 1);
        
        // Check if windows overlap
        return w.gridPosition.row === row &&
               !(wRightmost < draggedLeftmost || wLeftmost > draggedRightmost);
      });

      if (existingWindowAtTarget && existingWindowAtTarget.id !== draggedWindowId) {
                  const swappedWindows = prev.map(w => {
            if (w.id === draggedWindowId) {
              return { 
                ...w, 
                gridPosition: { 
                  ...w.gridPosition,
                  row: existingWindowAtTarget.gridPosition.row,
                  col: existingWindowAtTarget.gridPosition.col
                }
              };
            }
            if (w.id === existingWindowAtTarget.id) {
              return { 
                ...w, 
                gridPosition: { 
                  ...w.gridPosition,
                  row: draggedWindow.gridPosition.row,
                  col: draggedWindow.gridPosition.col
                }
              };
            }
            return w;
          });
        return swappedWindows;
      }

      const movedWindows = prev.map(w => 
        w.id === draggedWindowId ? { 
          ...w, 
          gridPosition: { 
            ...w.gridPosition,
            row, 
            col: clampedCol
          } 
        } : w
      );
      return movedWindows;
    });

    setDraggedWindowId(null);
  };

  const canResize = (window: Window, direction: 'left' | 'right'): boolean => {
    if (window.type !== 'office-notes') return false;
    if (window.gridPosition.width >= 3) return false; // Max 3 cells
    
    const currentLeftmost = getLeftmostCol(window.gridPosition.col, window.gridPosition.width);
    const currentRightmost = getRightmostCol(window.gridPosition.col, window.gridPosition.width);
    
    if (direction === 'right') {
      // For odd widths, middle stays same; for even, shifts right
      const newRightmost = currentRightmost + 1;
      if (newRightmost >= GRID_COLS) return false; // Can't expand beyond grid
      
      // Check if the cell to the right is free
      const checkCol = newRightmost;
      const existingWindow = windows.find(w => {
        if (w.id === window.id) return false;
        const wLeftmost = getLeftmostCol(w.gridPosition.col, w.gridPosition.width || 1);
        const wRightmost = getRightmostCol(w.gridPosition.col, w.gridPosition.width || 1);
        return w.gridPosition.row === window.gridPosition.row &&
               checkCol >= wLeftmost && checkCol <= wRightmost;
      });
      return !existingWindow;
    } else { // left
      const newLeftmost = currentLeftmost - 1;
      if (newLeftmost < 0) return false; // Can't expand beyond grid
      
      // Check if the cell to the left is free
      const checkCol = newLeftmost;
      const existingWindow = windows.find(w => {
        if (w.id === window.id) return false;
        const wLeftmost = getLeftmostCol(w.gridPosition.col, w.gridPosition.width || 1);
        const wRightmost = getRightmostCol(w.gridPosition.col, w.gridPosition.width || 1);
        return w.gridPosition.row === window.gridPosition.row &&
               checkCol >= wLeftmost && checkCol <= wRightmost;
      });
      return !existingWindow;
    }
  };

  const handleResizeStart = (windowId: string, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const window = windows.find(w => w.id === windowId);
    if (!window || !canResize(window, direction)) return;
    
    setResizingWindowId(windowId);
    setResizeDirection(direction);
  };

  const handleResizeEnd = () => {
    if (!resizingWindowId || !resizeDirection) return;
    
    const window = windows.find(w => w.id === resizingWindowId);
    if (!window) return;
    
    setWindows(prev => prev.map(w => {
      if (w.id === resizingWindowId) {
        const newWidth = Math.min(w.gridPosition.width + 1, 3);
        const currentLeftmost = getLeftmostCol(w.gridPosition.col, w.gridPosition.width);
        const currentRightmost = getRightmostCol(w.gridPosition.col, w.gridPosition.width);
        
        let newMiddleCol = w.gridPosition.col;
        if (resizeDirection === 'left') {
          // Expanding left: new leftmost is currentLeftmost - 1
          // For odd widths, middle stays same; for even, shifts left
          const newLeftmost = currentLeftmost - 1;
          newMiddleCol = newLeftmost + Math.floor((newWidth - 1) / 2);
        } else {
          // Expanding right: new rightmost is currentRightmost + 1
          // For odd widths, middle stays same; for even, shifts right
          const newRightmost = currentRightmost + 1;
          newMiddleCol = newRightmost - Math.floor(newWidth / 2);
        }
        
        // Clamp to ensure it fits
        newMiddleCol = clampMiddleCol(newMiddleCol, newWidth);
        
        return {
          ...w,
          gridPosition: {
            ...w.gridPosition,
            width: newWidth,
            col: newMiddleCol
          }
        };
      }
      return w;
    }));
    
    setResizingWindowId(null);
    setResizeDirection(null);
  };

  const handleResizeCancel = () => {
    setResizingWindowId(null);
    setResizeDirection(null);
  };

  // Add mouse up listener for resize
  useEffect(() => {
    const handleMouseUp = () => {
      if (resizingWindowId && resizeDirection) {
        handleResizeEnd();
      }
    };

    if (resizingWindowId) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingWindowId, resizeDirection]);

  const handleCellDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const renderWindow = (window: Window) => {
    switch (window.type) {
      case 'basic-office-data':
        return <BasicOfficeDataWindow officeId={officeId} onClose={() => handleRemoveWindow(window.id)} />;
      case 'projects-list':
        return <ProjectsListWindow officeId={officeId} onClose={() => handleRemoveWindow(window.id)} />;
      case 'projects-timeline':
        return <ProjectsTimelineWindow officeId={officeId} onClose={() => handleRemoveWindow(window.id)} />;
      case 'employees-list':
        return <EmployeesListWindow officeId={officeId} onClose={() => handleRemoveWindow(window.id)} />;
      case 'office-notes':
        return <OfficeNotesWindow officeId={officeId} width={window.gridPosition.width || 1} onClose={() => handleRemoveWindow(window.id)} />;
      case 'company-structure':
        return <CompanyStructureWindow officeId={officeId} onClose={() => handleRemoveWindow(window.id)} />;
      case 'office-financials':
        return <OfficeFinancialsWindow officeId={officeId} onClose={() => handleRemoveWindow(window.id)} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A' && !showAddMenu && !showNoteInput && !showMeditationInput) {
        e.preventDefault();
        setShowAddMenu(true);
        setSelectedMenuIndex(0);
        setCursorPosition({ x: lastMousePosition.current.x, y: lastMousePosition.current.y });
      } else if (showAddMenu) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedMenuIndex(prev => (prev + 1) % WINDOW_OPTIONS.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedMenuIndex(prev => (prev - 1 + WINDOW_OPTIONS.length) % WINDOW_OPTIONS.length);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const selectedWindow = WINDOW_OPTIONS[selectedMenuIndex];
          handleAddWindow(selectedWindow.type);
          setShowAddMenu(false);
          setSelectedMenuIndex(0);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setShowAddMenu(false);
          setSelectedMenuIndex(0);
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWindowId && !showAddMenu) {
        e.preventDefault();
        handleRemoveWindow(selectedWindowId);
        setSelectedWindowId(null);
      } else if (e.key === 'a' && selectedWindowId && !showAddMenu && !showNoteInput) {
        const selectedWindow = windows.find(w => w.id === selectedWindowId);
        const noteableWindowTypes: WindowType[] = ['projects-list', 'employees-list', 'office-financials', 'company-structure'];
        if (selectedWindow && noteableWindowTypes.includes(selectedWindow.type)) {
          e.preventDefault();
          setShowNoteInput(true);
          setNoteText('');
        }
      } else if (e.key === 'Escape') {
        if (showNoteInput || showMeditationInput) {
          e.preventDefault();
          setShowNoteInput(false);
          setNoteText('');
          setShowMeditationInput(false);
          setMeditationText('');
          setMeditationTitle('');
        } else if (!showAddMenu) {
          e.preventDefault();
          navigationService.navigateToOffices();
        }
      } else if (e.shiftKey && e.key === 'R' && officeId && !showAddMenu && !showNoteInput && !showMeditationInput) {
        e.preventDefault();
        setShowMeditationInput(true);
        setMeditationText('');
        setMeditationTitle('');
      }
    };

    const handleKeyUp = (_e: KeyboardEvent) => {
      // No longer needed for menu handling - menu stays open until explicit selection/cancel
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      if (showAddMenu) {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showAddMenu, selectedMenuIndex, handleAddWindow, selectedWindowId, handleRemoveWindow, windows, showNoteInput, showMeditationInput, officeId]);

  const totalWidth = GRID_COLS * CELL_SIZE;
  const totalHeight = GRID_ROWS * CELL_SIZE;

  return (
    <div style={{ 
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: '#000000', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      padding: '10px',
      overflow: 'hidden',
      boxSizing: 'border-box',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
        gap: '0px',
        position: 'relative'
      }}>
        {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, idx) => {
          const row = Math.floor(idx / GRID_COLS);
          const col = idx % GRID_COLS;
          
          // Find window that occupies this cell (using leftmost/rightmost)
          const window = windows.find(w => {
            const wLeftmost = getLeftmostCol(w.gridPosition.col, w.gridPosition.width || 1);
            const wRightmost = getRightmostCol(w.gridPosition.col, w.gridPosition.width || 1);
            return w.gridPosition.row === row && col >= wLeftmost && col <= wRightmost;
          });
          
          // Only render the window in its leftmost cell
          const windowLeftmost = window ? getLeftmostCol(window.gridPosition.col, window.gridPosition.width || 1) : -1;
          const isWindowStart = window && windowLeftmost === col;
          
          // Check if this cell is part of a multi-cell window but not the start
          const isOccupiedByMultiCell = window && windowLeftmost !== col;
          
          const isMultiCellWindow = window && (window.gridPosition.width || 1) > 1;
          
          // Hide borders on all cells that are part of a multi-cell window
          const isPartOfMultiCell = window && isMultiCellWindow;
          
          return (
            <div
              key={idx}
              style={{
                border: isPartOfMultiCell ? 'none' : '1px solid #333333',
                backgroundColor: isPartOfMultiCell ? 'transparent' : (window ? '#0a0a0a' : 'transparent'),
                display: 'flex',
                flexDirection: 'column',
                overflow: isWindowStart && isMultiCellWindow ? 'visible' : 'hidden',
                position: 'relative',
                pointerEvents: isOccupiedByMultiCell ? 'none' : 'auto'
              }}
              onDrop={(e) => handleCellDrop(row, col, e)}
              onDragOver={handleCellDragOver}
              onClick={handleGridClick}
            >
              {window && isWindowStart && (
                <>
                  <div
                    draggable={selectedWindowId === window.id}
                    onContextMenu={(e) => handleWindowRightClick(window.id, e)}
                    onDragStart={(e) => handleWindowDragStart(window.id, e)}
                    onDragEnd={handleWindowDragEnd}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCellDrop(row, col, e);
                    }}
                    onMouseLeave={handleResizeCancel}
                    style={{ 
                      height: '100%',
                      width: `${(window.gridPosition.width || 1) * CELL_SIZE - 2}px`,
                      cursor: selectedWindowId === window.id ? 'move' : 'pointer',
                      border: selectedWindowId === window.id ? '2px solid #C8EDFC' : (isMultiCellWindow ? '1px solid #333333' : 'none'),
                      backgroundColor: isMultiCellWindow ? '#0a0a0a' : 'transparent',
                      boxSizing: 'border-box',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      zIndex: 10
                    }}
                  >
                    {renderWindow(window)}
                    {selectedWindowId === window.id && window.type === 'office-notes' && (
                      <>
                        {canResize(window, 'left') && (
                          <div
                            onMouseDown={(e) => handleResizeStart(window.id, 'left', e)}
                            onMouseUp={handleResizeEnd}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '8px',
                              cursor: 'ew-resize',
                              backgroundColor: 'rgba(200, 237, 252, 0.3)',
                              zIndex: 10
                            }}
                          />
                        )}
                        {canResize(window, 'right') && (
                          <div
                            onMouseDown={(e) => handleResizeStart(window.id, 'right', e)}
                            onMouseUp={handleResizeEnd}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: '8px',
                              cursor: 'ew-resize',
                              backgroundColor: 'rgba(200, 237, 252, 0.3)',
                              zIndex: 10
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {showAddMenu && (
        <div style={{
          position: 'fixed',
          left: cursorPosition.x + 20,
          top: cursorPosition.y,
          zIndex: 1000
        }}>
          {WINDOW_OPTIONS.map((option, idx) => (
            <div
              key={option.type}
              style={{
                color: idx === selectedMenuIndex ? '#C8EDFC' : '#666666',
                fontSize: '10px',
                fontWeight: 'normal',
                textTransform: 'uppercase'
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {showNoteInput && (
        <div style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#1a1a1a',
          border: '2px solid #C8EDFC',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 0 20px rgba(200, 237, 252, 0.3)',
          zIndex: 1002,
          width: '400px',
          maxWidth: '90%',
          maxHeight: '80%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{
            color: '#C8EDFC',
            fontSize: '10px',
            fontWeight: 'normal',
            textTransform: 'uppercase',
            marginBottom: '5px'
          }}>
            ADD NOTE
          </div>
          <textarea
            autoFocus
            style={{
              width: '100%',
              minHeight: '150px',
              backgroundColor: '#2a2a2a',
              color: '#C8EDFC',
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '12px',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleNoteSubmit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowNoteInput(false);
                setNoteText('');
              }
            }}
            placeholder="Enter note text... (Ctrl/Cmd+Enter to submit, Esc to cancel)"
          />
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setShowNoteInput(false);
                setNoteText('');
              }}
              style={{
                padding: '5px 15px',
                backgroundColor: 'transparent',
                color: '#C8EDFC',
                border: '1px solid #666666',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '10px',
                textTransform: 'uppercase',
                opacity: 0.7
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            >
              CANCEL
            </button>
            <button
              onClick={handleNoteSubmit}
              disabled={!noteText.trim() || isProcessingNote}
              style={{
                padding: '5px 15px',
                backgroundColor: isProcessingNote || !noteText.trim() ? '#333333' : '#C8EDFC',
                color: isProcessingNote || !noteText.trim() ? '#666666' : '#000000',
                border: 'none',
                borderRadius: '2px',
                cursor: isProcessingNote || !noteText.trim() ? 'not-allowed' : 'pointer',
                fontSize: '10px',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            >
              {isProcessingNote ? 'PROCESSING...' : 'SUBMIT'}
            </button>
          </div>
                  </div>
        )}

      {showMeditationInput && (
        <div style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#1a1a1a',
          border: '2px solid #C8EDFC',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 0 20px rgba(200, 237, 252, 0.3)',
          zIndex: 1002,
          width: '400px',
          maxWidth: '90%',
          maxHeight: '80%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{
            color: '#C8EDFC',
            fontSize: '10px',
            fontWeight: 'normal',
            textTransform: 'uppercase',
            marginBottom: '5px'
          }}>
            ADD MEDITATION
          </div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={meditationTitle}
            onChange={(e) => setMeditationTitle(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#2a2a2a',
              color: '#C8EDFC',
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '12px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              marginBottom: '10px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setShowMeditationInput(false);
                setMeditationText('');
                setMeditationTitle('');
              }
            }}
          />
          <textarea
            autoFocus
            style={{
              width: '100%',
              minHeight: '150px',
              backgroundColor: '#2a2a2a',
              color: '#C8EDFC',
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '12px',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            value={meditationText}
            onChange={(e) => setMeditationText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleMeditationSubmit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowMeditationInput(false);
                setMeditationText('');
                setMeditationTitle('');
              }
            }}
            placeholder="Enter meditation text... (Ctrl/Cmd+Enter to submit, Esc to cancel)"
          />
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setShowMeditationInput(false);
                setMeditationText('');
                setMeditationTitle('');
              }}
              style={{
                padding: '5px 15px',
                backgroundColor: 'transparent',
                color: '#C8EDFC',
                border: '1px solid #666666',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '10px',
                textTransform: 'uppercase',
                opacity: 0.7
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            >
              CANCEL
            </button>
            <button
              onClick={handleMeditationSubmit}
              disabled={!meditationText.trim() || isCreatingMeditation}
              style={{
                padding: '5px 15px',
                backgroundColor: isCreatingMeditation || !meditationText.trim() ? '#333333' : '#C8EDFC',
                color: isCreatingMeditation || !meditationText.trim() ? '#666666' : '#000000',
                border: 'none',
                borderRadius: '2px',
                cursor: isCreatingMeditation || !meditationText.trim() ? 'not-allowed' : 'pointer',
                fontSize: '10px',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            >
              {isCreatingMeditation ? 'CREATING...' : 'SUBMIT'}
            </button>
          </div>
        </div>
      )}

      {office && (
        <div style={{
          position: 'fixed',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          color: '#C8EDFC',
          fontSize: '10px',
          fontWeight: 'normal',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          {office.id} {office.name}
        </div>
      )}
    </div>
  );
};
