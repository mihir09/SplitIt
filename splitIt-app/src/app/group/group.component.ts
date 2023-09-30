import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../users.service';
import { Group } from '../models/group.model';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {
  createForm: FormGroup;
  errorMessage: string = '';
  groupId: string = '';
  members: any[] = [];
  groupDetails!: Group;
  constructor(private fb: FormBuilder, 
    private groupService: GroupService, 
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router) {
    this.createForm = this.fb.group({
      email: ['', Validators.required],
    });

    this.route.params.subscribe(res => this.groupId = res['groupId']);
    
    this.groupService.getGroupDetails(this.groupId).subscribe({
      next: (response) => {
        this.groupDetails = response
        this.groupDetails.members.map( memberId =>
        this.usersService.getUserDetails(memberId).subscribe({
          next: (response) => {
            this.members.push(response)
          },
          error: (error) => {
            console.error('Error fetching group details', error);
          }
        }))
      },
      error: (error) => {
        console.error('Error fetching group details', error);
      }
    });
     
  }

  ngOnInit() {
  }

  onAddUser() {
    if (this.createForm.valid) {
      const userEmail = this.createForm.value.email
      this.groupService.addUserToGroup(this.groupId, userEmail).subscribe({
        next: (response) => {
          console.log('User added to the group successfully');
          this.errorMessage = '';
          this.createForm.reset();
          this.router.navigate(['/group', this.groupId]).then(()=> window.location.reload());
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          console.error('Error adding user to group:', error);
        }
      });
    }
  }
}
