import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseDetailsComponent } from './expense-details.component';

describe('ExpenseDetailsComponent', () => {
  let component: ExpenseDetailsComponent;
  let fixture: ComponentFixture<ExpenseDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseDetailsComponent]
    });
    fixture = TestBed.createComponent(ExpenseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
