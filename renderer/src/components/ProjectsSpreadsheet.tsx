import React from 'react';
import { Project } from '../types/firestore';
import { UniversalSpreadsheet } from './UniversalSpreadsheet';

interface ProjectsSpreadsheetProps {
  data: Project[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClose?: () => void;
  onResizeToMaxWidth?: () => void;
  onResizeToDefault?: () => void;
  isElectron?: boolean;
}

export const ProjectsSpreadsheet: React.FC<ProjectsSpreadsheetProps> = ({
  data,
  loading = false,
  error = null,
  onRefresh,
  onClose,
  onResizeToMaxWidth,
  onResizeToDefault,
  isElectron = false
}) => {
  return (
    <UniversalSpreadsheet
      data={data}
      dataType="projects"
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      onClose={onClose}
      onResizeToMaxWidth={onResizeToMaxWidth}
      onResizeToDefault={onResizeToDefault}
      isElectron={isElectron}
    />
  );
};

export default ProjectsSpreadsheet;


