import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { GroupService } from 'src/app/group.service';
import { Group } from 'src/app/models/group.model';
import { UsersService } from 'src/app/users.service';

@Component({
  selector: 'app-list-balance',
  templateUrl: './list-balance.component.html',
  styleUrls: ['./list-balance.component.css']
})
export class ListBalanceComponent {
  groupId: string = '';
  members$!: any;
  groupDetails!: Group;
  currentUser: any;
  balanceWithNames!: any;
  settle: boolean = false;
  selectedBalance: any;
  loading: boolean = true;

  constructor(
    private groupService: GroupService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private authService: AuthService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.currentUser = this.usersService.getUserDetailsByEmail(this.authService.getCurrentUser() || '').subscribe((response) => {
        this.currentUser = response
      })
      this.fetchGroupDetails()
    });
  }

  private fetchGroupDetails() {
    this.groupService.getGroupDetailsWithMembers(this.groupId).subscribe({
      next: (groupDetails) => {
        this.groupDetails = groupDetails;
        this.members$ = this.groupDetails.members;
        this.balanceWithNames = this.groupDetails.balancesWithNames;
        this.members$.map((member: any) => {
          if (member.email == this.currentUser.email) {
            this.currentUser.balance = member.balance;
          }
        })
        this.loading = false;

      },
      error: (error) => {
        console.error('Error fetching group details', error);
      },
    });
  }

  confirmState = {
    open: false,
    title: '', message: '', confirmLabel: 'Confirm',
    tone: 'primary' as 'primary' | 'danger',
    action: () => { },
  };

  private ask(opts: Partial<typeof this.confirmState> & { action: () => void }) {
    this.confirmState = { ...this.confirmState, open: true, ...opts };
  }
  onConfirmYes() { this.confirmState.open = false; this.confirmState.action(); }
  onConfirmNo() { this.confirmState.open = false; }


  confirmSettleBalance(index: number): void {
    this.ask({
      title: 'Settle this balance?',
      message: 'This marks the amount as paid and updates everyone\'s totals.',
      confirmLabel: 'Settle', tone: 'primary',
      action: () => { this.loading = true; this.settleSelectedBalance(index); },
    });
  }

  settleSelectedBalance(index: any) {
    const transactionId = this.groupDetails.balance[index]._id;
    this.groupService.settleBalance(this.groupId, transactionId).subscribe({
      next: (response) => {
        this.fetchGroupDetails()
      },
      error: (error) => {
        console.error('Error settling balance:', error);
      }
    });
  }
}
