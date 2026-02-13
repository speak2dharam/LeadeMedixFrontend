import { Component, Input, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  children?: MenuItem[];
}
@Component({
  selector: 'app-side-bar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {
  @Input() isOpen = true;
  expandedIndex = signal<number | null>(null);
  activeParentIndex = signal<number | null>(null);
  menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'assets/img/svg/home-button.svg'
  },
  {
    label: 'Users',
    icon: 'assets/img/svg/home-button.svg',
    children: [
      { label: 'All Users', route: '/users', icon: 'assets/img/svg/home-button.svg' },
      { label: 'Add User', route: '/users/user-detail', icon: 'assets/img/svg/home-button.svg' }
    ]
  },
  {
    label: 'Products',
    icon: 'assets/img/svg/home-button.svg',
    children: [
      { label: 'Manage Category', route: '/category', icon: 'assets/img/svg/home-button.svg' },
      { label: 'Manage Product', route: '/product', icon: 'assets/img/svg/home-button.svg' }
    ]
  }
];


  constructor(private router:Router) {}
   ngOnInit() {

    this.setActiveParent(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setActiveParent(event.urlAfterRedirects);
      });
  }
  toggleMenu(index: number) {
    this.expandedIndex.update(v => v === index ? null : index);
  }
  setActiveParent(url: string) {

    this.menuItems.forEach((item, index) => {

      if (item.children) {

        const match = item.children.find(child =>
          url.startsWith(child.route!)
        );

        if (match) {
          this.expandedIndex.set(index);
          this.activeParentIndex.set(index);
        }
      }
    });
  }
  isParentActive(index: number): boolean {
    return this.activeParentIndex() === index;
  }
}
