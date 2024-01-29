import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../../../group.service';
import { InvitationService } from '../../../invitation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.css']
})
export class AddMemberComponent implements OnInit {
  createForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  groupId: string = '';
  members: any = [];

  constructor(private fb: FormBuilder,
    private groupService: GroupService,
    private invitationService: InvitationService,
    private authService: AuthService,
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
      const userEmail = this.createForm.value.email;
      const senderEmail = this.authService.getCurrentUser();
      this.invitationService.sendInvitation(senderEmail!, userEmail, this.groupId).subscribe({
        next: (response) => {
          this.successMessage = 'Invitation sent successfully to ' + userEmail;
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
