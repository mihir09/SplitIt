import { Component, ElementRef, AfterViewInit, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('scrollToTopButton') scrollToTopButton!: ElementRef;

  ngAfterViewInit() {
    this.scrollToTopButton.nativeElement.style.display = 'none';
  }

  title = 'splitIt-app';

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY;

    if (scrollPosition >= 100) {
      this.scrollToTopButton.nativeElement.style.display = 'block'
    } else {
      this.scrollToTopButton.nativeElement.style.display = 'none'
    }

  }

}
