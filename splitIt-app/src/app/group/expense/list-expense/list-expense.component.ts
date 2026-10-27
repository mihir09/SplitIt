import { asyncScheduler, observeOn } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
export class ListExpenseComponent implements OnInit, OnDestroy {
  members: any[] = [];
  groupId!: string;
  expenses: any[] = [];
  searchTerm: string = '';
  startDate!: Date | null;
  endDate!: Date | null;
  loading: boolean = true;
  selectedExpense: any | undefined;

  @ViewChild(MatSort) set sort(value: MatSort) { this.expenseList.sort = value; }
  @ViewChild(MatPaginator) set paginator(value: MatPaginator) { this.expenseList.paginator = value; }

  displayedColumns: string[] = ['expenseDate', 'expenseName', 'payerName', 'amount', 'actions'];
  expenseList = new MatTableDataSource<any>([]);
  visibleExpenses = this.expenseList.connect().pipe(observeOn(asyncScheduler));
  errorMessage = '';

  constructor(private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog) { }

  ngOnDestroy(): void { this.expenseList.disconnect(); }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.fetchExpenses();
    });
  }


  fetchExpenses() {
    this.loading = true;
    this.errorMessage = '';
    this.expenseService.getExpensesOfGroup(this.groupId).subscribe({
      next: (expenses) => {
        this.expenseList.data = expenses;
        this.expenseList.filterPredicate = this.expenseFilter();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Could not load expenses. Please try again.';
      },
    });
  }

  applyFilterExpense(): void {
    const filterValue = this.searchTerm.toLowerCase();
    const filterObj: any = { searchTerm: filterValue, startDate: this.startDate, endDate: this.endDate };
    this.expenseList.filter = JSON.stringify(filterObj);
    this.expenseList.paginator?.firstPage();
  }

  expenseFilter(): (data: any, filter: string) => boolean {
    return (data, serialized) => {
      const filter = JSON.parse(serialized || '{}');
      const term = filter.searchTerm || '';
      const matches = [data.expenseName, data.payerName, data.amount].some(value => String(value ?? '').toLowerCase().includes(term));
      return matches && (!(filter.startDate && filter.endDate) || this.isDateInRange(data.expenseDate, new Date(filter.startDate), new Date(filter.endDate)));
    };
  }

  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    const isoDateString = date
    date = new Date(isoDateString);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  }

  clearDateRange() {
    this.startDate = null;
    this.endDate = null;
    this.applyFilterExpense();
  }

  confirmState = {
    open: false,
    title: '', message: '', confirmLabel: 'Confirm',
    tone: 'primary' as 'primary' | 'danger',
    action: () => { },
  };

  private ask(opts: Partial<typeof this.confirmState> & { action: () => void }) {
    this.confirmState = { ...this.confirmState, open: true, ...opts };
  }
  onConfirmYes() { this.confirmState.open = false; this.confirmState.action(); }
  onConfirmNo() { this.confirmState.open = false; }

  undoExpense(expense: any): void {
    this.ask({
      title: 'Undo this expense?',
      message: 'It will be removed and balances recalculated.',
      confirmLabel: 'Undo', tone: 'danger',
      action: () => {
        this.loading = true;
        this.expenseService.undoExpense(expense._id).subscribe({
          next: () => this.fetchExpenses(),
          error: () => { this.loading = false; this.errorMessage = 'Could not undo expense. Please try again.'; },
        });
      },
    });
  }

  deleteExpense(expense: any): void {
  this.ask({
    title: 'Delete this expense?',
    message: `"${expense.expenseName}" will be permanently removed.`,
    confirmLabel: 'Delete', tone: 'danger',
    action: () => {
      this.loading = true;
      this.expenseService.deleteExpense(expense._id).subscribe({
        next: () => this.fetchExpenses(),
        error: () => { this.loading = false; this.errorMessage = 'Could not delete expense. Please try again.'; },
      });
    },
  });
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
      // console.log('The dialog was closed');
    });
  }
}

