import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '../group.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css'],
})
export class CreateGroupComponent implements OnInit {
  createForm: FormGroup;

  constructor(private fb: FormBuilder, private groupService: GroupService, private authService: AuthService) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onCreateGroup() {
    if (this.createForm.valid) {
      const groupData = {
        ...this.createForm.value
      };
      this.groupService.createGroup(groupData).subscribe(
        (group) => {
          console.log('Group created successfully:', group);
          this.groupService.addUserToGroup(group._id, this.authService.getCurrentUser()!).subscribe(
            (response) => {
              console.log('User added to the group successfully');
            },
            (error) => {
              console.error('Error adding user to group:', error);
            }
          );
        },
        (error) => {
          console.error('Error creating group:', error);
        }
      );
    }
  }
}
