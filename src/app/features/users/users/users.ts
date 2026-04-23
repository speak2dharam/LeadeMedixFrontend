import { Component, effect, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user-service';
import { UserResponseDto } from '../../../core/models/user.model';
import { Datatable } from '../../../core/datatable/datatable';
import { DatatableColumn, DatatableQuery } from '../../../core/datatable/datatable.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [Datatable],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private usersService = inject(UserService);
  private usersRequestSub: Subscription | null = null;

  query = signal<DatatableQuery>({
    pageNumber: 1,
    pageSize: 10,
    search: '',
    sortBy: undefined,
    sortDir: undefined,
  });

  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<UserResponseDto[]>([]);
  totalRecords = signal(0);
  totalPages = signal(0);

  columns: DatatableColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'mobile', header: 'Mobile', sortable: true },
    { key: 'isActive', header: 'Active', sortable: true },
  ];

  constructor() {
    effect((onCleanup) => {
      const currentQuery = this.query();
      this.loadUsers(currentQuery);
      onCleanup(() => {
        this.usersRequestSub?.unsubscribe();
      });
    });
  }

  onQueryChange(nextQuery: DatatableQuery) {
    this.query.set(nextQuery);
  }

  fullName(user: UserResponseDto): string {
    const firstName = user.firstName?.trim() ?? '';
    const lastName = user.lastName?.trim() ?? '';
    return `${firstName} ${lastName}`.trim() || '-';
  }

  private loadUsers(query: DatatableQuery) {
    this.loading.set(true);
    this.error.set(null);
    this.usersRequestSub?.unsubscribe();

    this.usersRequestSub = this.usersService
      .getUsers({
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        search: query.search,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
      })
      .subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            this.error.set(res.message || 'Failed to load users');
            this.users.set([]);
            this.totalRecords.set(0);
            this.totalPages.set(1);
            return;
          }

          this.users.set(res.data.data ?? []);
          this.totalRecords.set(res.data.totalRecords ?? 0);
          this.totalPages.set(res.data.totalPages ?? 1);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Something went wrong');
          this.users.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(1);
        },
        complete: () => this.loading.set(false),
      });
  }
}
