import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Expense } from 'src/app/expense.model';
import { ExpenseService } from 'src/app/expense.service';
import { GroupService } from 'src/app/group.service';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent {
  members: any[] = [];
  groupId!: string | null;
  expenses!: Expense[];
  searchTerm: string = '';
  expenseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private groupService: GroupService,
    private route: ActivatedRoute) {
    this.expenseForm = this.fb.group({
      expenseName: ['', Validators.required],
      payer: ['', Validators.required],
      expenseDate: [new Date()],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      console.log(params['groupId'])
      this.fetchMembers();
      console.log(this.groupId, this.members)
    });
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

  onAddExpense() {
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
}
