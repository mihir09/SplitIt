import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from 'src/app/expense.service';

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
  searchTerm: string = '';
  startDate!: Date | null;
  endDate!: Date | null;

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.fetchExpenses();
    this.expenseService.refreshRequired.subscribe(response =>{
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

      const expenseData ={
        ...this.expenseForm.value, 
        groupId :this.groupId 
      }

      const payerId = expenseData.payer;
      const payer = this.members.find(member => member.id === payerId);
      let payerName = ''
      if (payer) {
        payerName = payer.name;
      }
      expenseData.payerName = payerName

      if (!expenseData.expenseDate){
        expenseData.expenseDate = new Date()
      }

      this.expenseService.addExpense(expenseData).subscribe(
        (response) => {
          console.log('Expense added successfully');
          this.expenseForm.reset();
        },
        (error) => {
          console.error('Error adding expense:', error);
        }
      );
    }
  }
  
  fetchExpenses() {
    this.expenseService.getExpensesOfGroup(this.groupId).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
      },
      error: (error) => {
        console.error('Error fetching expenses', error);
      },
    });
  }

  clearDateRange(){
    this.startDate = null;
    this.endDate = null;
  }
}
