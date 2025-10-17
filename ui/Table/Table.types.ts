export interface TableProps {
  columns: Array<{ key: string; label: string; sortable?: boolean }>;
  data: Array<Record<string, any>>;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}
