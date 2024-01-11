import { Component, Inject } from '@angular/core';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterState } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  groups: any[] = [];
  showCreateGroup: boolean = false;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
    ) {
    this.loadUserGroups();
    this.handleRouteEvents();
  }

  ngOnInit(): void {
  }

  loadUserGroups() {
    this.usersService.getUserGroups(this.authService.getCurrentUser()!).subscribe({
      next : (groups) => {
        this.groups = groups;
      },
      error: (error) => {
        console.error('Error loading user groups:', error.error.message);
      }
    });
  }

  toggleCreateGroup() {
    this.showCreateGroup = !this.showCreateGroup;
  }

  handleRouteEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const title = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
        gtag('event', 'page_view', {
          page_title: title,
          page_path: event.urlAfterRedirects,
          page_location: this.document.location.href
        })
      }
    });
  }

  getTitle(state: RouterState, parent: ActivatedRoute): string[] {
    const data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data['title']) {
      data.push(parent.snapshot.data['title']);
    }
    if (state && parent && parent.firstChild) {
      data.push(...this.getTitle(state, parent.firstChild));
    }
    return data;
  }

}
