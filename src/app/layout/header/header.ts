import { Component, ElementRef, EventEmitter, HostListener, Output, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();

  profileOpen = signal(false);
  constructor(private eref: ElementRef) {}
  toggleProfile() {
    this.profileOpen.update(v => !v);
  }
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.eref.nativeElement.contains(event.target)) {
      this.profileOpen.set(false);
    }
  }
}
