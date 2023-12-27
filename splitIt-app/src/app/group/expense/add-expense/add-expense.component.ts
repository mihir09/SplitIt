import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/expense.model';
import { ExpenseService } from 'src/app/expense.service';
import { GroupService } from 'src/app/group.service';
import { DatePipe } from '@angular/common';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent {
  mode: 'add' | 'edit' = 'add';
  members: any[] = [];
  groupId!: string | null;
  expenses!: Expense[];
  expenseForm: FormGroup;
  expensetoEdit: any;
  participants: any[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe) {
    this.expenseForm = this.fb.group({
      expenseName: ['', Validators.required],
      payer: ['', Validators.required],
      participants: [[]],
      expenseDate: [new Date().toISOString().split('T')[0]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.groupId = params['groupId'];
        return this.fetchMembers().pipe(
          catchError(error => {
            console.error('Error fetching members:', error);
            return of([]);
          }),
          finalize(() => {
            if (this.route.snapshot.queryParams['mode'] === 'edit' && this.route.snapshot.queryParams['expense']) {
              this.expensetoEdit = JSON.parse(this.route.snapshot.queryParams['expense']);
              this.mode = 'edit';
              this.populateFormWithExpenseData(this.expensetoEdit);
            }
          })
        );
      })
    )
    .subscribe();
  }

  populateFormWithExpenseData(expense: any): void {
    const expenseDate = new Date(expense.expenseDate).toISOString().split('T')[0];
    let participants: any = [];
    Object.keys(expense.participants).forEach(participantId => {
      let memberDetails = this.members.find(member => member.id === participantId);
      participants.push(memberDetails);
    });
    this.expenseForm.setValue({
      expenseName: expense.expenseName,
      payer: expense.payer,
      expenseDate: expenseDate,
      description: expense.description,
      amount: expense.amount,
      participants: participants,
    });
    this.participants = participants
  }

  fetchMembers() {
    if (this.groupId) {
      return this.groupService.getMembers(this.groupId).pipe(
        tap(members => {
          this.members = members;
          this.participants = members;
        })
      );
    } else {
      return of([]);
    }
  }

  canAddExpense(): boolean {
    const payerId = this.expenseForm.get('payer')?.value;
    return this.participants.length >= 1 && this.participants.some(participant => participant.id !== payerId);
  }

  onAddOrUpdateExpense() {
    if (this.expenseForm.valid && this.canAddExpense()) {
      const expenseData = {
        ...this.expenseForm.value,
        groupId: this.groupId
      }
      const payerId = expenseData.payer;
      const payer = this.members.find(member => member.id === payerId);
      let payerName = ''
      if (payer) {
        payerName = payer.name;
      }
      expenseData.payerName = payerName
      let participants:any = {}
      this.participants.forEach((participant) => { 
        participants[participant.id] = 0
      });

      expenseData.participants = participants
      expenseData.amount = parseFloat(expenseData.amount.toFixed(2));
      if (!expenseData.expenseDate) {
        expenseData.expenseDate = new Date().toISOString().split('T')[0]
      }
      if (this.mode === 'add') {
        this.onAddExpense(expenseData)
      }
      else {
        this.onUpdateExpense(expenseData)
      }
    }
  }
  onAddExpense(expenseData: any) {
    // console.log(expenseData)
    this.expenseService.addExpense(expenseData).subscribe(
      (response) => {
        // console.log('Expense added successfully');
        this.expenseForm.reset();
        this.router.navigate(['group', this.groupId, 'list-balance'], { queryParams: { groupId: this.groupId } });

      },
      (error) => {
        console.error('Error adding expense:', error);
      }
    );

  }

  onUpdateExpense(expenseData: any) {
    this.expenseService.editExpense(this.expensetoEdit._id, expenseData, this.expensetoEdit).subscribe(
      (response) => {
        // console.log('Expense edited successfully');
        this.expenseForm.reset();
        this.router.navigate(['group', this.groupId, 'list-balance'], { queryParams: { groupId: this.groupId } });
      },
      (error) => {
        console.error('Error editing expense:', error);
      }
    );
  }

  toggleParticipant(participantId: string): void {
    if (this.participants.find(participant => participant.id === participantId)){
      this.participants = this.participants.filter(participant => participant.id !== participantId);
    }
    else{
      const memberDetails = this.members.find(member => member.id === participantId)
      this.participants.push(memberDetails)
    }
  }

  isParticipantSelected(participantId: string): boolean {
    return this.participants.find(participant => participant.id === participantId);
  }
}
