import { Component, ElementRef, AfterViewInit, HostListener, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('scrollToTopButton') scrollToTopButton!: ElementRef;

  title = 'splitIt-app';
  showScrollButton: boolean = false;
  isSpinWheelModalOpen: boolean = false;

  ngAfterViewInit() {
    // Initial state handled by CSS and showScrollButton boolean
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSpinWheelModal(): void {
    this.isSpinWheelModalOpen = !this.isSpinWheelModalOpen;
    
    // Prevent body scroll when modal is open
    if (this.isSpinWheelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeSpinWheelModal(): void {
    this.isSpinWheelModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY;
    this.showScrollButton = scrollPosition >= 300;
  }

  // Close modal on ESC key
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isSpinWheelModalOpen) {
      this.closeSpinWheelModal();
    }
  }
}
