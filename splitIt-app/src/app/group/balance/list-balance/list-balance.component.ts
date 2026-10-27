import { forkJoin, finalize } from 'rxjs';
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

  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.fetchGroupDetails();
    });
  }

  fetchGroupDetails() {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      user: this.usersService.getUserDetailsByEmail(this.authService.getCurrentUser() || ''),
      group: this.groupService.getGroupDetailsWithMembers(this.groupId)
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: ({user, group}) => {
        this.currentUser = user;
        this.groupDetails = group;
        this.members$ = group.members;
        this.balanceWithNames = group.balancesWithNames;
        this.currentUser.balance = this.members$.find((m:any) => m.id === user.id)?.balance || 0;
      },
      error: () => { this.errorMessage = 'Could not load balances. Please try again.'; }
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
    if (this.loading) return;
    this.ask({
      title: 'Record this payment?',
      message: `${this.balanceWithNames[index].from} paid ${this.balanceWithNames[index].to} $${Number(this.balanceWithNames[index].balance).toFixed(2)}. Record this payment? No money is transferred by SplitIt.`,
      confirmLabel: 'Record payment', tone: 'primary',
      action: () => { this.loading = true; this.settleSelectedBalance(index); },
    });
  }

  settleSelectedBalance(index: any) {
    const transactionId = this.groupDetails.balance[index]._id;
    this.errorMessage = '';
    this.groupService.settleBalance(this.groupId, transactionId).subscribe({
      next: (response) => {
        this.fetchGroupDetails()
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Could not record payment. Please refresh balances before trying again.';
      }
    });
  }
}
