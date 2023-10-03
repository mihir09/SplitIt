import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../users.service';
import { Group } from '../models/group.model';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit{
  createForm: FormGroup;
  errorMessage: string = '';
  groupId: string = '';
  members$!: Observable<any[]>;
  groupDetails!: Group;
  constructor(private fb: FormBuilder, 
    private groupService: GroupService, 
    private usersService: UsersService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef) {
    this.createForm = this.fb.group({
      email: ['', Validators.required],
    });
    
     
  }

  ngOnInit() {
    this.route.params.subscribe(res => this.groupId = res['groupId']);
    this.fetchGroupDetails()
  }

  private fetchGroupDetails(){
    this.groupService.getGroupDetails(this.groupId).subscribe({
      next: (response) => {
        this.groupDetails = response
        const memberObservables = this.groupDetails.members.map(memberId =>
          this.usersService.getUserDetails(memberId)
        );
        this.members$ = forkJoin(memberObservables);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching group details', error);
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
          this.fetchGroupDetails()
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          console.error('Error adding user to group:', error);
        }
      });
      this.cdr.detectChanges();
    }
  }
}
