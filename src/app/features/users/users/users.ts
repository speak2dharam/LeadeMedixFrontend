import { Component, computed, effect, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user-service';
import { UserResponseDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private usersService = inject(UserService);

  // paging state
  pageNumber = signal(1);
  pageSize = signal(10);
  search = signal('');

  // data state
  loading = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  users = signal<UserResponseDto[]>([]);
  totalCount = signal(0);
  totalPages = signal(0);

  // derived
  canPrev = computed(() => this.pageNumber() > 1);
  canNext = computed(() => this.pageNumber() < this.totalPages());

  constructor() {
    // auto-load whenever paging/search changes
    effect(() => {
      // effect tracks signals used inside
      void this.loadUsers();
    });
  }

  async loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.message.set(null);

    this.usersService
      .getUsers({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
        search: this.search(),
      })
      .subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            this.error.set(res.message || 'Failed to load users');
            return;
          }
          console.log(res)
          this.users.set(res.data.items ?? []);
          this.totalCount.set(res.data.totalCount ?? 0);
          this.totalPages.set(res.data.totalPages ?? 1);
          this.message.set(res.message || null);
        },
        error: (err) => {
          // your interceptor should refresh & retry automatically if 401
          this.error.set(err?.error?.message || 'Something went wrong');
        },
        complete: () => this.loading.set(false),
      });
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.pageNumber.set(1);
  }

  prev() {
    if (!this.canPrev()) return;
    this.pageNumber.set(this.pageNumber() - 1);
  }

  next() {
    if (!this.canNext()) return;
    this.pageNumber.set(this.pageNumber() + 1);
  }

  changePageSize(value: string) {
    const size = Number(value);
    this.pageSize.set(Number.isFinite(size) && size > 0 ? size : 10);
    this.pageNumber.set(1);
  }
}
