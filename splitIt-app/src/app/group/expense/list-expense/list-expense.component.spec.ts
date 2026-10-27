import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { ExpenseService } from 'src/app/expense.service';
import { ListExpenseComponent } from './list-expense.component';
describe('expense list pagination and filtering',()=>{
  let fixture:ComponentFixture<ListExpenseComponent>, page:ListExpenseComponent, response:Subject<any[]>;
  beforeEach(async()=>{
    response=new Subject();
    await TestBed.configureTestingModule({declarations:[ListExpenseComponent],imports:[FormsModule,MatTableModule,MatPaginatorModule,MatSortModule,NoopAnimationsModule],providers:[{provide:ExpenseService,useValue:{getExpensesOfGroup:()=>response}},{provide:ActivatedRoute,useValue:{queryParams:of({groupId:'test'})}},{provide:Router,useValue:{}},{provide:MatDialog,useValue:{}}],schemas:[NO_ERRORS_SCHEMA]}).compileComponents();
    fixture=TestBed.createComponent(ListExpenseComponent);page=fixture.componentInstance;fixture.detectChanges();
  });
  function load(){response.next(Array.from({length:12},(_,i)=>({_id:String(i),expenseName:i===11?'Dinner':'Expense '+i,payerName:'Alex',amount:i+1,expenseDate:'2026-10-27'})));fixture.detectChanges();tick();fixture.detectChanges();}
  it('connects pagination after the loading view is replaced',fakeAsync(()=>{
    load();expect(page.expenseList.paginator).toBeTruthy();expect(page.expenseList.paginator!.length).toBe(12);
    expect(fixture.nativeElement.textContent).toContain('1 – 5 of 12');
    let visible:any[]=[];page.visibleExpenses.subscribe(rows=>visible=rows);
    (page.expenseList.paginator as MatPaginator).nextPage();tick();fixture.detectChanges();expect(visible.length).toBe(5);expect(visible[0]._id).toBe('5');
    fixture.destroy();tick();
  }));
  it('searches all rows and resets the current page',fakeAsync(()=>{
    load();(page.expenseList.paginator as MatPaginator).nextPage();page.searchTerm='dinner';page.applyFilterExpense();tick();fixture.detectChanges();
    expect(page.expenseList.filteredData.length).toBe(1);expect(page.expenseList.paginator!.pageIndex).toBe(0);expect(fixture.nativeElement.textContent).toContain('1 – 1 of 1');
    fixture.destroy();tick();
  }));
  it('sorts amounts numerically after loading',fakeAsync(()=>{
    load();page.expenseList.sort!.active='amount';page.expenseList.sort!.direction='desc';page.expenseList.sort!.sortChange.emit({active:'amount',direction:'desc'});tick();
    let visible:any[]=[];page.visibleExpenses.subscribe(rows=>visible=rows);tick();expect(visible[0].amount).toBe(12);
    fixture.destroy();tick();
  }));
});
