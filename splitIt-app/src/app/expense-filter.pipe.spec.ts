import { ExpenseFilterPipe } from './expense-filter.pipe';

describe('ExpenseFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new ExpenseFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
