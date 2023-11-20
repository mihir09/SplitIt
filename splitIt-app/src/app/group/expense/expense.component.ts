import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from 'src/app/expense.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements AfterViewInit {
  expenseForm!: FormGroup;
  @Input() members: any[] = [];
  @Input() groupId: String = '';
  expenses: any[] = [];
  searchTerm: string = '';
  startDate!: Date | null;
  endDate!: Date | null;
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['expenseDate', 'expenseName', 'payerName', 'amount'];
  expenseList = new MatTableDataSource<any>([]);

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.fetchExpenses();
    this.expenseService.refreshRequired.subscribe(response =>{
      this.fetchExpenses();
    })
  }
  ngAfterViewInit(): void {
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
        this.expenseList = new MatTableDataSource(expenses)
        this.expenseList.paginator = this.paginator;
        this.expenseList.sort = this.sort;
        this.expenseList.filterPredicate = this.expenseFilter();
      },
      error: (error) => {
        console.error('Error fetching expenses', error);
      },
    });
  }

  applyFilterExpense(): void {
    console.log("expense filter called")
    const filterValue = this.searchTerm.toLowerCase();
    const filterObj: any = {searchTerm : filterValue, startDate: this.startDate, endDate:this.endDate};
    this.expenseList.filter = filterObj;
  }

  expenseFilter(): (data: any, filter: any) => boolean {
    const filterFunction = (data: any, filter: any): boolean => {
      console.log("expensFilter running")
      const searchText = filter.searchTerm;
      const isExpenseNameMatch = data.expenseName.toLowerCase().includes(searchText);
      const isPayerNameMatch = data.payerName.toLowerCase().includes(searchText);
      const isAmountMatch = data.amount.toString().includes(searchText);
      var dateCheck = false;
      var isDateInRange = false
      if (filter.startDate && filter.endDate) {
        isDateInRange = this.isDateInRange(data.expenseDate, filter.startDate, filter.endDate);
        dateCheck = true
      }

      return (filter? (isExpenseNameMatch || isPayerNameMatch || isAmountMatch) : true) && (dateCheck? isDateInRange : true);
    };

    return filterFunction;
  }

  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    console.log(date, startDate, endDate)
    const isoDateString = date
    date = new Date(isoDateString);

    console.log(date);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  }

  clearDateRange(){
    this.startDate = null;
    this.endDate = null;
    this.applyFilterExpense();
  }
}
