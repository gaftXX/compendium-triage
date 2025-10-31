import React from 'react';
import { Regulation } from '../types/firestore';
import { UniversalSpreadsheet } from './UniversalSpreadsheet';

interface RegulationsSpreadsheetProps {
  data: Regulation[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClose?: () => void;
  onResizeToMaxWidth?: () => void;
  onResizeToDefault?: () => void;
  isElectron?: boolean;
}

export const RegulationsSpreadsheet: React.FC<RegulationsSpreadsheetProps> = ({
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
      dataType="regulations"
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

export default RegulationsSpreadsheet;


