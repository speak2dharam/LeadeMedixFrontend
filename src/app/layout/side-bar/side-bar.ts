import { Component, EventEmitter, Input, OnInit, Output, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth-service';
import { buildPermissionsFromRoles } from '../../core/models/role-permissions';
import { MenuNode } from '../menu.model';
import { SIDEBAR_MENU } from '../menu.config';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {
  @Input() isOpen = true;
  @Input() isMobile = false;
  @Output() itemNavigate = new EventEmitter<void>();

  hovered = signal(false);
  expandedKeys = signal<Set<string>>(new Set<string>());
  activeUrl = signal('');
  permissionSet = signal<Set<string>>(new Set<string>());

  menuItems = computed(() => this.filterMenuByPermission(SIDEBAR_MENU, this.permissionSet()));

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.activeUrl.set(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeUrl.set(event.urlAfterRedirects);
        this.expandActiveParents();
      });

    this.permissionSet.set(buildPermissionsFromRoles(this.authService.getUserRoles()));
    this.expandActiveParents();
  }

  onMouseEnter() {
    if (!this.isMobile) {
      this.hovered.set(true);
    }
  }

  onMouseLeave() {
    if (!this.isMobile) {
      this.hovered.set(false);
    }
  }

  isExpanded(): boolean {
    return this.isMobile || this.hovered();
  }

  toggleMenu(label: string) {
    this.expandedKeys.update(current => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  isMenuOpen(label: string): boolean {
    return this.expandedKeys().has(label) || this.isParentRouteActive(label);
  }

  isRouteActive(route?: string): boolean {
    if (!route) {
      return false;
    }
    const url = this.activeUrl();
    return url === route || url.startsWith(`${route}/`);
  }

  isParentRouteActive(label: string): boolean {
    const menu = this.menuItems().find(node => node.label === label);
    if (!menu?.children) {
      return false;
    }
    return menu.children.some(child => this.isRouteActive(child.route));
  }

  onItemClick() {
    if (this.isMobile) {
      this.itemNavigate.emit();
    }
  }

  getIconClass(label: string): string {
    const map: Record<string, string> = {
      Dashboard: 'bi-grid-fill',
      Leads: 'bi-people-fill',
      Hospitals: 'bi-hospital-fill',
      Treatments: 'bi-capsule-pill',
      Masters: 'bi-gear-fill',
      Users: 'bi-person-badge-fill',
      Reports: 'bi-bar-chart-fill',
    };
    return map[label] ?? 'bi-circle-fill';
  }

  private expandActiveParents() {
    const activeParents = this.menuItems()
      .filter(item => item.children?.some(child => this.isRouteActive(child.route)))
      .map(item => item.label);
    this.expandedKeys.set(new Set(activeParents));
  }

  private filterMenuByPermission(nodes: MenuNode[], permissions: Set<string>): MenuNode[] {
    const filtered: MenuNode[] = [];

    for (const node of nodes) {
      if (node.permission && !permissions.has(node.permission)) {
        continue;
      }

      if (!node.children || node.children.length === 0) {
        filtered.push(node);
        continue;
      }

      const visibleChildren = this.filterMenuByPermission(node.children, permissions);
      if (visibleChildren.length > 0) {
        filtered.push({
          ...node,
          children: visibleChildren,
        });
      }
    }

    return filtered;
  }
}
