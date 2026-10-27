import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { AddExpenseComponent } from './add-expense.component';
import { BubbleDragDirective } from './bubble-drag.directive';
import { ExpenseService } from 'src/app/expense.service';
import { GroupService } from 'src/app/group.service';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;

  const members = [
    { id: 'm1', email: 'mpate125@ucr.edu', name: 'M Patel' },
    { id: 'm2', email: 'mj7774542@gmail.com', name: 'MJ Two' },
    { id: 'm3', email: 'mj7771820@gmail.com', name: 'MJ Three' },
  ];

  const groupServiceStub = { getMembers: () => of(members) };
  const expenseServiceStub = { addExpense: () => of({}), editExpense: () => of({}) };
  const routeStub = { queryParams: of({ groupId: 'g1' }), snapshot: { queryParams: {} } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExpenseComponent, BubbleDragDirective],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: GroupService, useValue: groupServiceStub },
        { provide: ExpenseService, useValue: expenseServiceStub },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // ignore app-loading-spinner, app-calculator, ng-lottie
    });
    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads members and includes everyone by default', () => {
    expect(component.members.length).toBe(3);
    expect(component.participants.length).toBe(3);
  });

  it('gates the name step until a name is entered', () => {
    expect(component.canProceed(0)).toBeFalse();
    component.expenseForm.patchValue({ expenseName: 'Dinner' });
    expect(component.canProceed(0)).toBeTrue();
  });

  it('splits equally by default', () => {
    component.expenseForm.patchValue({ expenseName: 'Dinner', amount: '90', payer: 'm1' });
    const breakdown = component.reviewBreakdown();
    expect(breakdown.every((b) => b.owes === 30)).toBeTrue();
  });

  it('validates an unequal split must add up to the total', () => {
    component.expenseForm.patchValue({ amount: '100', payer: 'm1' });
    component.toggleSplitType('unequal');
    component.participantAmounts = { m1: 50, m2: 30, m3: 10 };
    expect(component.isTotalAmountValid()).toBeFalse();
    component.participantAmounts = { m1: 50, m2: 30, m3: 20 };
    expect(component.isTotalAmountValid()).toBeTrue();
  });
  it('keeps quick entry collapsed on mobile and includes the desktop split preview', () => {
    expect(component.previewOpen).toBeFalse();
    expect(fixture.nativeElement.querySelector('#expense-split-preview')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[formControlName="expenseName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[formControlName="amount"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('select[formControlName="payer"]')).toBeTruthy();
  });
  it('allocates every cent in the preview and initializes advanced split options', () => {
    component.expenseForm.patchValue({expenseName:'Dinner', amount:10, payer:'m1'});
    expect(component.reviewBreakdown().map(row=>row.owes)).toEqual([3.34,3.33,3.33]);
    component.toggleSplitType('shares');expect(component.isTotalAmountValid()).toBeTrue();
    component.toggleSplitType('percentages');expect(component.isTotalAmountValid()).toBeTrue();
  });
  it('does not save an empty or zero-value expense', () => {
    const save=spyOn(component,'onAddExpense');component.onAddOrUpdateExpense();expect(save).not.toHaveBeenCalled();
    component.expenseForm.patchValue({expenseName:'Dinner',amount:0,payer:'m1'});component.onAddOrUpdateExpense();expect(save).not.toHaveBeenCalled();
  });
});