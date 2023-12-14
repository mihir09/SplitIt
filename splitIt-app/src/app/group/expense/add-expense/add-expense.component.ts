import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/expense.model';
import { ExpenseService } from 'src/app/expense.service';
import { GroupService } from 'src/app/group.service';
import { DatePipe } from '@angular/common';

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
      expenseDate: [new Date().toISOString().split('T')[0]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      console.log(params['groupId'])
      if (params['mode'] && params['mode'] === 'edit' && params['expense']) {
        this.expensetoEdit = JSON.parse(params['expense']);
        this.mode = 'edit';
        console.log(this.expensetoEdit)
        this.populateFormWithExpenseData(this.expensetoEdit);
      }
      this.fetchMembers();
      console.log(this.groupId, this.members)
    });
  }

  populateFormWithExpenseData(expense: Expense): void {
    const expenseDate = new Date(expense.expenseDate).toISOString().split('T')[0];
    this.expenseForm.setValue({
      expenseName: expense.expenseName,
      payer: expense.payer,
      expenseDate: expenseDate,
      description: expense.description,
      amount: expense.amount,
    });
    console.log('Form Value:', this.expenseForm.value);
  }

  fetchMembers() {
    if (this.groupId) {
      this.groupService.getMembers(this.groupId).subscribe(
        (members) => {
          this.members = members;
        },
        (error) => {
          console.error('Error fetching members:', error);
        }
      );
    }
  }
  onAddOrUpdateExpense() {
    if (this.expenseForm.valid) {

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

    this.expenseService.addExpense(expenseData).subscribe(
      (response) => {
        console.log('Expense added successfully');
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
        console.log('Expense edited successfully');
        this.expenseForm.reset();
        this.router.navigate(['group', this.groupId, 'list-balance'], { queryParams: { groupId: this.groupId } });
      },
      (error) => {
        console.error('Error editing expense:', error);
      }
    );
  }
}
