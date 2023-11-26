import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBalanceComponent } from './list-balance.component';

describe('ListBalanceComponent', () => {
  let component: ListBalanceComponent;
  let fixture: ComponentFixture<ListBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListBalanceComponent]
    });
    fixture = TestBed.createComponent(ListBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
