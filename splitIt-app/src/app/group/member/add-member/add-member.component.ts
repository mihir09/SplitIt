import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../../../group.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.css']
})
export class AddMemberComponent implements OnInit {
  createForm: FormGroup;
  errorMessage: string = '';
  groupId: string = '';
  members: any = [];

  constructor(private fb: FormBuilder,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router) {
    this.createForm = this.fb.group({
      email: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.groupService.getMembers(this.groupId).subscribe({
        next: (response) => {
          console.log(response)
          this.members = response
        },
        error: (error) => {
          console.log(error)
        }
      })
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
          this.router.navigate(['group', this.groupId, 'add-expense'], { queryParams: { groupId: this.groupId } });
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          console.error('Error adding user to group:', error);
        }
      });
    }
  }
}
