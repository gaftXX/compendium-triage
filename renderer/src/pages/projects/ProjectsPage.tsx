import React, { useState, useEffect } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { Project } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';
import { UniversalSpreadsheet } from '../../components/UniversalSpreadsheet';

// Global cache that persists across component unmounts
let cachedProjects: Project[] = [];
let isCachedDataLoaded = false;

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(cachedProjects);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const [isFullWidth, setIsFullWidth] = useState(true);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await firestoreOperations.queryProjects();
      
      if (result.success && result.data) {
        // Update both local state and global cache
        setProjects(result.data);
        cachedProjects = result.data;
        isCachedDataLoaded = true;
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't loaded data before (check global cache)
    if (!isCachedDataLoaded) {
      fetchProjects();
    }
  }, []);

  // Set to full width when page opens
  useEffect(() => {
    if (isElectron && isFullWidth) {
      resizeToMaxWidth();
    }
  }, [isElectron, isFullWidth, resizeToMaxWidth]);

  // Keyboard listener for Shift+W to toggle width
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'W' && e.shiftKey) {
        if (isFullWidth) {
          resizeToDefault();
          setIsFullWidth(false);
        } else {
          resizeToMaxWidth();
          setIsFullWidth(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isElectron, isFullWidth, resizeToMaxWidth, resizeToDefault]);

  return (
    <UniversalSpreadsheet
      data={projects}
      dataType="projects"
      loading={loading}
      error={error}
      onRefresh={fetchProjects}
      onClose={handleClose}
      onResizeToMaxWidth={resizeToMaxWidth}
      onResizeToDefault={resizeToDefault}
      isElectron={isElectron}
    />
  );
};
