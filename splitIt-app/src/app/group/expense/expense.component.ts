import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from 'src/app/group.service';
import { UsersService } from 'src/app/users.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent {
  expenseForm!: FormGroup;
  @Input() members: any[] = [];
  @Input() groupId: String = '';
  expenses: any[] = [];
  constructor(private fb: FormBuilder, private groupService: GroupService, private usersService: UsersService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.fetchExpenses();
    this.groupService.refreshRequired.subscribe(response =>{
      this.fetchExpenses();
    })
  }

  initializeForm(): void {
    this.expenseForm = this.fb.group({
      expenseName: ['', Validators.required],
      payer: ['', Validators.required],
      expenseDate: [new Date()],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onAddExpense() {
    if (this.expenseForm.valid) {
      console.log(this.expenseForm.value.payer)
      const expenseData ={
        ...this.expenseForm.value, 
        groupId :this.groupId 
      }

      const payerId = expenseData.payer;
      const payer = this.members.find(member => member.id === payerId);

      if (payer) {
        expenseData.payerName = payer.name;
      }
      this.groupService.addExpense(expenseData).subscribe(
        (response) => {
          console.log('Expense added successfully', response);
          this.expenseForm.reset();
        },
        (error) => {
          console.error('Error adding expense:', error);
        }
      );
    }
  }
  
  fetchExpenses() {
    this.groupService.getExpensesOfGroup(this.groupId).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        console.log(expenses)
      },
      error: (error) => {
        console.error('Error fetching expenses', error);
      },
    });
  }
}
