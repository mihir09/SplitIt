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
});