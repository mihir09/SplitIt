import {
  Component,
  Inject,
  ChangeDetectorRef
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { UsersService } from '../users.service';
import { AuthService } from '../auth.service';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterState } from '@angular/router';
import { InvitationService } from '../invitation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),

  ]
})
export class HomeComponent {
  groups: any[] = [];
  invitations: any[] = [];
  showCreateGroup: boolean = false;
  currentUser: string = '';
  settledGroups: any[] = [];
  unsettledGroups: any[] = [];
  activeSection = 'unsettled';
  isSidebarExpanded = true;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private invitationsService: InvitationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loadUserGroups();
    this.handleRouteEvents();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()!;
    this.usersService.getUserInvitations(this.currentUser).subscribe({
      next: (invitations) => {
        this.invitations = invitations;
      },
      error: (error) => {
        console.error('Error fetching invitations:', error);
      }
    });
  }

  loadUserGroups() {
    this.currentUser = this.authService.getCurrentUser()!;
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.settledGroups = [];
    this.unsettledGroups = [];

    this.usersService.getUserGroups(this.currentUser).subscribe({
      next: (groups) => {
        this.groups = groups;
        groups.forEach((group: any) => {
          const user = group.members.find((m: any) => m.memberId === userId || m.memberId?._id === userId);
          const balance = parseFloat(user?.memberBalance || '0');
          group.currentUserBalance = balance;

          if (Math.abs(balance) < 0.01) {
            this.settledGroups.push(group);
          } else {
            this.unsettledGroups.push(group);
          }
        });
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
        });
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

  acceptInvitation(invitationId: string) {
    this.invitationsService.acceptInvitation(invitationId, this.currentUser).subscribe({
      next: (response) => {
        this.router.navigate(['group', response.groupId]);
      },
      error: (error) => {
        console.error('Error ', error.error.message);
      }
    });
  }

  declineInvitation(invitationId: string) {
    this.invitationsService.declineInvitation(invitationId, this.currentUser).subscribe({
      next: () => {
        this.invitations = this.invitations.filter(invitation => invitation._id !== invitationId);
        this.usersService.getUserInvitations(this.currentUser).subscribe({
          next: (invitations) => {
            this.invitations = invitations;
          },
          error: (error) => {
            console.error('Error fetching invitations:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error ', error.error.message);
      }
    });
  }

  getAbs(value: number): number {
    return Math.abs(value);
  }
}
