import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideBar } from '../side-bar/side-bar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet,Header,SideBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit{
  sidebarOpen = signal(true);
  isMobile = signal(false);
  ngOnInit() {
    this.checkScreen();
  }
  checkScreen() {
    const mobile = window.innerWidth < 992;
    this.isMobile.set(mobile);
    this.sidebarOpen.set(!mobile);
  }
  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreen();
  }
}
