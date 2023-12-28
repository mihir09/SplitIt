import { Component, OnInit, ViewChild} from '@angular/core';
import { ExpenseService } from 'src/app/expense.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/expense.model';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseDetailsComponent } from './expense-details/expense-details.component';

@Component({
  selector: 'app-list-expense',
  templateUrl: './list-expense.component.html',
  styleUrls: ['./list-expense.component.css']
})
export class ListExpenseComponent implements OnInit {
  members: any[] = [];
  groupId!: string;
  expenses: any[] = [];
  searchTerm: string = '';
  startDate!: Date | null;
  endDate!: Date | null;
  loading: boolean = true;
  selectedExpense: any | undefined;
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['expenseDate', 'expenseName', 'payerName', 'amount', 'actions'];
  expenseList = new MatTableDataSource<any>([]);

  constructor(private expenseService: ExpenseService, 
    private route: ActivatedRoute, 
    private router: Router,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.fetchExpenses();
    });
  }

 
  fetchExpenses() {
    this.expenseService.getExpensesOfGroup(this.groupId).subscribe({
      next: (expenses) => {
        this.expenseList = new MatTableDataSource(expenses)
        this.expenseList.paginator = this.paginator;
        this.expenseList.sort = this.sort;
        this.expenseList.filterPredicate = this.expenseFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching expenses', error);
      },
    });
  }

  applyFilterExpense(): void {
    const filterValue = this.searchTerm.toLowerCase();
    const filterObj: any = {searchTerm : filterValue, startDate: this.startDate, endDate:this.endDate};
    this.expenseList.filter = filterObj;
  }

  expenseFilter(): (data: any, filter: any) => boolean {
    const filterFunction = (data: any, filter: any): boolean => {
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
    const isoDateString = date
    date = new Date(isoDateString);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  }

  clearDateRange(){
    this.startDate = null;
    this.endDate = null;
    this.applyFilterExpense();
  }

  deleteExpense(expense: any): void {
    const confirmDelete = confirm('Are you sure you want to delete this expense?');
    if (confirmDelete) {
      this.loading = true;
      this.expenseService.deleteExpense(expense._id).subscribe({
        next: (res) => {
          console.log(res.message)
          this.fetchExpenses();
        },
        error: (error) => {
          console.error('Error deleting expense', error);
        },
      });
    }
  }

  editExpense(expense: any) {
    const expenseString = JSON.stringify(expense);
    this.router.navigate(['group', this.groupId, 'add-expense'], {
      queryParams: {
        mode: 'edit',
        expense: expenseString,
        groupId: this.groupId
      },
    });
  }

  showExpenseDetails(expense: Expense): void {
    this.selectedExpense = expense;
    const dialogRef = this.dialog.open(ExpenseDetailsComponent, {
      width: '400px',
      data: { expense: expense }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

