export type SortDirection = 'asc' | 'desc';

export interface DatatableQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDirection;
}

export interface DatatableColumn {
  key: string;
  header: string;
  sortable?: boolean;
}
