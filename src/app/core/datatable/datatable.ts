import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatatableColumn, DatatableQuery, SortDirection } from './datatable.model';

@Component({
  selector: 'app-datatable',
  imports: [CommonModule, FormsModule],
  templateUrl: './datatable.html',
  styleUrl: './datatable.css',
})
export class Datatable {
  @Input() title = '';
  @Input() columns: DatatableColumn[] = [];
  @Input() rows: unknown[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() totalRecords = 0;
  @Input() totalPages = 1;
  @Input() pageSizeOptions: number[] = [10, 20, 50];
  @Input() searchPlaceholder = 'Search...';
  @Input() query: DatatableQuery = { pageNumber: 1, pageSize: 10, search: '' };

  @Output() queryChange = new EventEmitter<DatatableQuery>();

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<{
    $implicit: unknown;
    columns: DatatableColumn[];
  }>;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  get canPrev(): boolean {
    return this.query.pageNumber > 1;
  }

  get canNext(): boolean {
    return this.query.pageNumber < this.totalPages;
  }

  get startEntry(): number {
    if (this.totalRecords === 0) {
      return 0;
    }
    return (this.query.pageNumber - 1) * this.query.pageSize + 1;
  }

  get endEntry(): number {
    if (this.totalRecords === 0) {
      return 0;
    }
    const currentPageCount = this.rows.length;
    return Math.min(this.startEntry + currentPageCount - 1, this.totalRecords);
  }

  get visiblePages(): number[] {
    const total = Math.max(1, this.totalPages);
    const current = Math.min(Math.max(1, this.query.pageNumber), total);
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(total, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }

  trackByRow = (_index: number, row: unknown) => {
    const id = (row as { id?: unknown })?.id;
    return typeof id === 'number' || typeof id === 'string' ? id : _index;
  };

  onSearchInput(value: string) {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.emitQuery({ search: value, pageNumber: 1 });
    }, 300);
  }

  changePageSize(value: string) {
    const pageSize = Number(value);
    this.emitQuery({
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
      pageNumber: 1,
    });
  }

  prev() {
    if (!this.canPrev) {
      return;
    }
    this.emitQuery({ pageNumber: this.query.pageNumber - 1 });
  }

  next() {
    if (!this.canNext) {
      return;
    }
    this.emitQuery({ pageNumber: this.query.pageNumber + 1 });
  }

  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.query.pageNumber) {
      return;
    }
    this.emitQuery({ pageNumber });
  }

  toggleSort(column: DatatableColumn) {
    if (!column.sortable) {
      return;
    }

    const currentSortBy = this.query.sortBy;
    const currentSortDir = this.query.sortDir;
    let nextSortBy: string | undefined = column.key;
    let nextSortDir: SortDirection | undefined = 'asc';

    if (currentSortBy === column.key && currentSortDir === 'asc') {
      nextSortDir = 'desc';
    } else if (currentSortBy === column.key && currentSortDir === 'desc') {
      nextSortBy = undefined;
      nextSortDir = undefined;
    }

    this.emitQuery({
      sortBy: nextSortBy,
      sortDir: nextSortDir,
      pageNumber: 1,
    });
  }

  sortIndicator(column: DatatableColumn): string {
    if (this.query.sortBy !== column.key) {
      return '';
    }
    return this.query.sortDir === 'desc' ? 'v' : '^';
  }

  resolveCell(row: unknown, key: string): string {
    const value = (row as Record<string, unknown>)?.[key];
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  private emitQuery(patch: Partial<DatatableQuery>) {
    const nextQuery: DatatableQuery = {
      ...this.query,
      ...patch,
    };
    this.queryChange.emit(nextQuery);
  }
}
