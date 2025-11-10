import React, { useState, useEffect, useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import { subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { Project, Client } from '../../../types/firestore';

const convertTimestampToDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
  return null;
};

interface ProjectsTimelineWindowProps {
  officeId: string | null;
  onClose: () => void;
}

interface TimelineProject extends Project {
  startDate: Date;
  endDate: Date | null;
  budget: number;
  clientName?: string;
}

export const ProjectsTimelineWindow: React.FC<ProjectsTimelineWindowProps> = ({ officeId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Map<string, Client>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYearRange, setSelectedYearRange] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    if (!officeId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<Project>(
      'projects',
      (snapshot) => {
        try {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];

          const filteredProjects = projectsData.filter(p => p.officeId === officeId);
          filteredProjects.sort((a, b) => {
            const aStart = a.timeline.startDate?.toMillis() || 0;
            const bStart = b.timeline.startDate?.toMillis() || 0;
            return aStart - bStart;
          });

          setProjects(filteredProjects);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
        includeMetadataChanges: false,
        onError: (err) => {
          setError(err.message);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [officeId]);

  useEffect(() => {
    if (projects.length === 0) return;

    const clientIds = new Set<string>();
    projects.forEach(p => {
      if (p.clientId) {
        clientIds.add(p.clientId);
      }
    });

    if (clientIds.size === 0) return;

    const unsubscribe = subscribeToCollectionUpdates<Client>(
      'clients',
      (snapshot) => {
        try {
          const clientsMap = new Map<string, Client>();
          snapshot.docs.forEach(doc => {
            const client = { id: doc.id, ...doc.data() } as Client;
            if (clientIds.has(client.id)) {
              clientsMap.set(client.id, client);
            }
          });
          setClients(clientsMap);
        } catch (err) {
          console.error('Error loading clients:', err);
        }
      },
      {
        includeMetadataChanges: false,
        onError: (err) => {
          console.error('Error subscribing to clients:', err);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [projects]);

  const timelineData = useMemo(() => {
    if (projects.length === 0) return null;

    const processedProjects: TimelineProject[] = projects
      .filter(p => p.timeline?.startDate)
      .map(p => {
        const startDate = convertTimestampToDate(p.timeline.startDate);
        const endDate = p.timeline.actualCompletion 
          ? convertTimestampToDate(p.timeline.actualCompletion)
          : p.timeline.expectedCompletion 
          ? convertTimestampToDate(p.timeline.expectedCompletion)
          : null;
        
        if (!startDate) return null;
        
        const client = p.clientId ? clients.get(p.clientId) : undefined;

        return {
          ...p,
          startDate,
          endDate,
          budget: p.financial?.budget || 0,
          clientName: client?.clientName
        };
      })
      .filter((p): p is TimelineProject => p !== null);

    if (processedProjects.length === 0) return null;

    const allDates = processedProjects.flatMap(p => {
      const dates = [p.startDate];
      if (p.endDate) dates.push(p.endDate);
      return dates;
    });

    if (allDates.length === 0) return null;

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const minYear = minDate.getFullYear();
    const maxYear = maxDate.getFullYear();

    const yearRange = selectedYearRange || { start: minYear, end: maxYear };

    return {
      projects: processedProjects,
      minDate,
      maxDate,
      yearRange,
      totalBudget: processedProjects.reduce((sum, p) => sum + p.budget, 0),
      maxBudget: Math.max(...processedProjects.map(p => p.budget), 0)
    };
  }, [projects, clients, selectedYearRange]);

  const getYearPosition = (date: Date, yearRange: { start: number; end: number }, width: number): number => {
    const totalDays = (yearRange.end - yearRange.start + 1) * 365.25;
    const daysSinceStart = (date.getTime() - new Date(yearRange.start, 0, 1).getTime()) / (1000 * 60 * 60 * 24);
    return (daysSinceStart / totalDays) * width;
  };

  const getYearWidth = (startDate: Date, endDate: Date | null, yearRange: { start: number; end: number }, width: number): number => {
    if (!endDate) {
      const today = new Date();
      endDate = today > startDate ? today : startDate;
    }
    const totalDays = (yearRange.end - yearRange.start + 1) * 365.25;
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max((daysDiff / totalDays) * width, 2);
  };

  if (!officeId) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        NO OFFICE SELECTED
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        LOADING...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        ERROR: {error}
      </div>
    );
  }

  if (!timelineData || timelineData.projects.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        NO PROJECTS FOUND
      </div>
    );
  }

  const timelineWidth = 300;
  const timelineHeight = Math.max(250, timelineData.projects.length * 20 + 150);
  const yearMarkerHeight = 50;
  const projectBarHeight = 14;
  const projectSpacing = 3;
  const budgetBarMaxHeight = 35;

  const clientColors = new Map<string, string>();
  const uniqueClients = Array.from(new Set(timelineData.projects.map(p => p.clientName).filter(Boolean))) as string[];
  const colorPalette = ['#C8EDFC', '#7FD4E8', '#4FB3D1', '#2A8FA5', '#1A5F73'];
  uniqueClients.forEach((client, idx) => {
    clientColors.set(client, colorPalette[idx % colorPalette.length]);
  });

  const budgetByYear = new Map<number, number>();
  timelineData.projects.forEach(p => {
    const year = p.startDate.getFullYear();
    budgetByYear.set(year, (budgetByYear.get(year) || 0) + p.budget);
  });
  const maxBudgetByYear = Math.max(...Array.from(budgetByYear.values()), 1);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      fontSize: '10px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      color: '#C8EDFC',
      padding: '10px',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: '10px' }}>
        TIMELINE ({timelineData.projects.length} PROJECTS)
      </div>

      <div style={{ marginBottom: '10px', fontSize: '8px', opacity: 0.7 }}>
        {timelineData.yearRange.start} - {timelineData.yearRange.end}
      </div>

      <div style={{ 
        position: 'relative',
        width: `${timelineWidth}px`,
        minHeight: `${timelineHeight}px`,
        marginBottom: '20px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${yearMarkerHeight}px`,
          borderBottom: '1px solid #333333'
        }}>
          {Array.from({ length: timelineData.yearRange.end - timelineData.yearRange.start + 1 }, (_, i) => {
            const year = timelineData.yearRange.start + i;
            const x = getYearPosition(new Date(year, 0, 1), timelineData.yearRange, timelineWidth);
            return (
              <div
                key={year}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: 0,
                  height: '100%',
                  borderLeft: '1px solid #333333',
                  paddingLeft: '4px',
                  fontSize: '8px',
                  color: '#666666'
                }}
              >
                {year}
              </div>
            );
          })}
        </div>

        <div style={{
          position: 'absolute',
          top: `${yearMarkerHeight + 10}px`,
          left: 0,
          right: 0,
          height: `${budgetBarMaxHeight}px`,
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px'
        }}>
          {Array.from(budgetByYear.entries()).map(([year, budget]) => {
            const height = (budget / maxBudgetByYear) * budgetBarMaxHeight;
            const x = getYearPosition(new Date(year, 0, 1), timelineData.yearRange, timelineWidth);
            return (
              <div
                key={year}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  bottom: 0,
                  width: '20px',
                  height: `${height}px`,
                  backgroundColor: '#4FB3D1',
                  opacity: 0.6
                }}
                title={`${year}: ${budget.toLocaleString()}`}
              />
            );
          })}
        </div>

        <div style={{
          position: 'absolute',
          top: `${yearMarkerHeight + budgetBarMaxHeight + 20}px`,
          left: 0,
          right: 0
        }}>
          {timelineData.projects.map((project, idx) => {
            const startX = getYearPosition(project.startDate, timelineData.yearRange, timelineWidth);
            const width = getYearWidth(project.startDate, project.endDate, timelineData.yearRange, timelineWidth);
            const top = idx * (projectBarHeight + projectSpacing);
            const projectColor = project.clientName 
              ? clientColors.get(project.clientName) || '#C8EDFC'
              : '#666666';
            
            const statusColor = project.status === 'completed' ? '#4FB3D1' :
                               project.status === 'construction' ? '#7FD4E8' :
                               project.status === 'planning' ? '#C8EDFC' :
                               '#666666';

            return (
              <div
                key={project.id}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${startX}px`,
                  width: `${width}px`,
                  height: `${projectBarHeight}px`,
                  backgroundColor: statusColor,
                  opacity: 0.8,
                  border: '1px solid #333333',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '4px',
                  fontSize: '8px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                title={`${project.projectName} | ${project.startDate.getFullYear()}-${project.endDate?.getFullYear() || 'ongoing'} | Budget: ${project.budget.toLocaleString()} | Client: ${project.clientName || 'N/A'}`}
              >
                {width > 40 && project.projectName}
              </div>
            );
          })}
        </div>

        <div style={{
          position: 'absolute',
          top: `${yearMarkerHeight + budgetBarMaxHeight + timelineData.projects.length * (projectBarHeight + projectSpacing) + 30}px`,
          left: 0,
          right: 0,
          fontSize: '8px',
          color: '#666666'
        }}>
          <div style={{ marginBottom: '5px', color: '#C8EDFC', opacity: 0.8 }}>BUDGET ALLOCATION BY YEAR</div>
          <div style={{ marginBottom: '5px', color: '#C8EDFC', opacity: 0.8 }}>PROJECT TIMELINES</div>
          {uniqueClients.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginBottom: '5px', color: '#C8EDFC', opacity: 0.8 }}>CLIENT RELATIONSHIPS:</div>
              {uniqueClients.map(client => {
                const clientProjects = timelineData.projects.filter(p => p.clientName === client);
                const clientBudget = clientProjects.reduce((sum, p) => sum + p.budget, 0);
                return (
                  <div key={client} style={{ marginLeft: '10px', marginBottom: '2px', color: clientColors.get(client) }}>
                    {client} ({clientProjects.length} projects, {clientBudget.toLocaleString()})
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 'auto', fontSize: '8px', color: '#666666', marginTop: '10px' }}>
        <div>TOTAL BUDGET: {timelineData.totalBudget.toLocaleString()}</div>
        <div style={{ marginTop: '5px' }}>PROJECTS: {timelineData.projects.length}</div>
        <div style={{ marginTop: '5px' }}>TIMEFRAME: {timelineData.yearRange.start} - {timelineData.yearRange.end}</div>
      </div>
    </div>
  );
};

