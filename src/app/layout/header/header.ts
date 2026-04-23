import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  profileOpen = signal(false);
  notificationsOpen = signal(false);
  unreadCount = signal(3);
  userName = signal('User');
  userEmail = signal('');

  notifications = [
    'New lead assigned to your queue.',
    'Today follow-up reminder is pending.',
    'Weekly reports are ready to review.',
  ];

  constructor(
    private eref: ElementRef,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user?.name) {
      this.userName.set(user.name);
    }
    if (user?.email) {
      this.userEmail.set(user.email);
    }
  }

  toggleProfile() {
    this.profileOpen.update(v => !v);
    this.notificationsOpen.set(false);
  }

  toggleNotifications() {
    this.notificationsOpen.update(v => !v);
    this.profileOpen.set(false);
    this.unreadCount.set(0);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.forceLogout(false);
        this.router.navigateByUrl('/auth/login');
      },
      error: () => {
        this.authService.forceLogout();
      },
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.eref.nativeElement.contains(event.target)) {
      this.profileOpen.set(false);
      this.notificationsOpen.set(false);
    }
  }
}
