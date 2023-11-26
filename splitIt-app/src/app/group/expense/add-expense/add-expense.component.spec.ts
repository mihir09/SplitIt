import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpenseComponent } from './add-expense.component';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExpenseComponent]
    });
    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
