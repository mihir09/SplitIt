import { finalize } from 'rxjs';
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
  loadingMembers = true;
  isSending = false;
  showInviteButton: boolean = false;
  userEmailToInvite: string = '';

  constructor(private fb: FormBuilder,
    private groupService: GroupService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) {
    this.createForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.errorMessage = '';
      this.successMessage = '';
      this.loadingMembers = true;
      this.groupService.getMembers(this.groupId).pipe(finalize(() => this.loadingMembers = false)).subscribe({
        next: (response) => {
          this.members = response
        },
        error: (error) => {
          this.errorMessage = 'Could not load members. Please refresh and try again.';
        }
      })
    });

  }
  onAddUser() {
    if (this.isSending) return;
    this.createForm.markAllAsTouched();
    if (this.createForm.valid) {
      this.isSending = true;
      this.errorMessage = '';
      this.successMessage = '';
      const userEmail = this.createForm.value.email;
      const senderEmail = this.authService.getCurrentUser();
      this.invitationService.sendInvitation(senderEmail!, userEmail, this.groupId).pipe(finalize(() => this.isSending = false)).subscribe({
        next: (response) => {
          this.successMessage = 'Invitation sent successfully to ' + userEmail;
          this.errorMessage = '';
          this.createForm.reset();
        },
        error: (error) => {
          this.showInviteButton = false;
          switch (error.error.type) {
            case 'user_not_found':
              this.errorMessage = error.error.message + " " + (error.error.suggestion || '');
              this.showInviteButton = true;
              this.userEmailToInvite = userEmail;
              break;
            case 'user_already_present':
              this.errorMessage = error.error.message + " " + (error.error.suggestion || '');
              break;
            case 'user_already_invited':
              this.errorMessage = error.error.message + " " + (error.error.suggestion || '');
              break;

            case 'group_not_found':
              this.errorMessage = error.error.message + " " + (error.error.suggestion || '');
              break;

            case 'sender_not_found':
              this.errorMessage = error.error.message + " You will be logged out in 10 seconds. " + (error.error.suggestion || '');
              setTimeout(() => {
                this.authService.logout();
                this.router.navigate(['/login']);
              }, 10000);
              break;
            default:
              this.errorMessage = 'An unexpected error occurred.';
          }
          console.error('Error adding user to group:', error);
        }
      });
    }
  }

  onInvite(userEmail: string) {
    if (this.isSending) return;
    this.isSending = true;
    this.errorMessage = '';
    this.successMessage = '';
    const senderEmail = this.authService.getCurrentUser();
    this.showInviteButton = false;
    this.invitationService.inviteNewUser(senderEmail!, userEmail).pipe(finalize(() => this.isSending = false)).subscribe({
      next: (response) => {
        this.successMessage = 'Invitation sent successfully to ' + userEmail;
      },
      error: (error) => {
        console.error('Error sending invitation:', error);
        this.errorMessage = 'Error sending invite. Please try again.';
      }
    });
  }
}
