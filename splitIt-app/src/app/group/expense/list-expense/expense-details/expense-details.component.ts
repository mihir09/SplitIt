import { Component, Inject} from '@angular/core';
import { GroupService } from 'src/app/group.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-expense-details',
  templateUrl: './expense-details.component.html',
  styleUrls: ['./expense-details.component.css'],
})
export class ExpenseDetailsComponent {
  expense: any;
  members: any = [];
  participants: any[] = [];
  participantsArray: any[] = [];

  constructor(private groupService: GroupService,
    public dialogRef: MatDialogRef<ExpenseDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.expense = data.expense;
    this.groupService.getMembers(this.expense.groupId).subscribe({
      next: (response) => {
        this.members = response;
        this.participants = this.expense.participants
        this.updateParticipantsDetails();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }


  private updateParticipantsDetails(): void {
    Object.entries(this.participants).forEach(([participantId, contributionAmount]: [string, any]): void => {
      const participant = this.members.find((member: any) => member.id === participantId);
      const participantName = participant ? participant.name : 'Unknown';
      this.participantsArray.push({ name: participantName, amount: contributionAmount || 0 });
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
