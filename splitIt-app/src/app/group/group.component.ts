import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../users.service';
import { Group } from '../models/group.model';
import { AuthService } from '../auth.service';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  createForm: FormGroup;
  errorMessage: string = '';
  groupId: string = '';
  members$!: any;
  groupDetails!: Group;
  currentUser: any;
  currentUserEmail: string = '';
  balanceWithNames!: any;
  showRadioButtons: boolean = false;
  selectedBalance: any;
  settleSelectedBalance() { }

  constructor(private fb: FormBuilder,
    private groupService: GroupService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private authService: AuthService) {
    this.createForm = this.fb.group({
      email: ['', Validators.required],
    });


  }

  ngOnInit() {
    this.route.params.subscribe(res => this.groupId = res['groupId']);
    this.currentUser = this.usersService.getUserDetailsByEmail(this.authService.getCurrentUser() || '').subscribe((response) => {
      this.currentUser = response
    })
    this.fetchGroupDetails()
    this.groupService.refreshRequired.subscribe(response => {
      this.fetchGroupDetails();
    })
  }


  private fetchGroupDetails() {
    this.groupService.getGroupDetails(this.groupId).subscribe({
      next: (response) => {
        this.groupDetails = response
        console.log(this.groupDetails.balance)
        const membersArray: { name: any; id: any; email: any; balance: any }[] = []

        const memberDetailObservables = this.groupDetails.members.map((memberDetails: any) => {
          return this.usersService.getUserDetails(memberDetails.memberId);
        });

        forkJoin(memberDetailObservables).subscribe((memberResponses) => {
          this.groupDetails.members.forEach((memberDetails: any, index: number) => {
            const response = memberResponses[index];
            if (this.currentUser && response.email == this.currentUser.email) {
              this.currentUser.balance = memberDetails.memberBalance;
            }
            const member = {
              name: response.name,
              id: response.id,
              email: response.email,
              balance: memberDetails.memberBalance,
            };
            membersArray.push(member);
          });

          const memberDetailsMap = new Map(
            membersArray.map((member: any) => [member.id, member.name])
          );

          const balancesWithNames = this.groupDetails.balance.map((balanceItem: any) => {
            const fromMember = memberDetailsMap.get(balanceItem.from) || balanceItem.from;
            const toMember = memberDetailsMap.get(balanceItem.to) || balanceItem.to;

            return {
              from: fromMember,
              to: toMember,
              balance: balanceItem.balance,
            };
          });
          this.members$ = membersArray;
          this.balanceWithNames = balancesWithNames;
        });
      },

      error: (error) => {
        this.errorMessage = error.error.message;
        console.error('Error adding user to group:', error);
      }
    });
  }

  onAddUser() {
    if (this.createForm.valid) {
      const userEmail = this.createForm.value.email
      this.groupService.addUserToGroup(this.groupId, userEmail).subscribe({
        next: (response) => {
          console.log('User added to the group successfully');
          this.errorMessage = '';
          this.createForm.reset();
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          console.error('Error adding user to group:', error);
        }
      });
    }
  }
}
