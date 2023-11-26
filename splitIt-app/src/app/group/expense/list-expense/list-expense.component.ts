import { Component, OnInit, ViewChild} from '@angular/core';
import { ExpenseService } from 'src/app/expense.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

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
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['expenseDate', 'expenseName', 'payerName', 'amount'];
  expenseList = new MatTableDataSource<any>([]);

  constructor(private expenseService: ExpenseService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      console.log(params['groupId'])
      this.fetchExpenses();
      console.log(this.groupId, this.members)
    });
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

