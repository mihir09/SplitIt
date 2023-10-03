import { Component, OnInit} from '@angular/core';
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
  members$!: any;
  groupDetails$!: Group;

  constructor(private fb: FormBuilder, 
    private groupService: GroupService, 
    private usersService: UsersService,
    private route: ActivatedRoute) {
    this.createForm = this.fb.group({
      email: ['', Validators.required],
    });
    
     
  }

  ngOnInit() {
    this.route.params.subscribe(res => this.groupId = res['groupId']);
    this.fetchGroupDetails()
    this.groupService.refreshRequired.subscribe(response =>{
      this.fetchGroupDetails();
    })
  }

  private fetchGroupDetails(){
    this.groupService.getGroupDetails(this.groupId).subscribe({
        next: (response) => {
        this.groupDetails$ = response
        const membersArray: { name: any; id: any; email: any; }[] = []
        this.groupDetails$.members.map((memberId: any)=> {

          this.usersService.getUserDetails(memberId).subscribe((response) => {
            
            const member = {name:response.name, id:response.id, email:response.email}
            membersArray.push(member)
          })
        })
        this.members$ = membersArray;
        console.log(this.groupDetails$)
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
