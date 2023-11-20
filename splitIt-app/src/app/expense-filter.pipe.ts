import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseFilter'
})
export class ExpenseFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, startDate: Date, endDate: Date): any[] {
    console.log(startDate, endDate)
    if (!items) {
      return items;
    }
    searchText = searchText.toLowerCase()
    return items.filter(item => {
      const isExpenseNameMatch = item.expenseName.toLowerCase().includes(searchText);
      const isPayerNameMatch = item.payerName.toLowerCase().includes(searchText);
      const isAmountMatch = item.amount.toString().includes(searchText);
      var dateCheck = false;
      var isDateInRange = false
      if (startDate && endDate) {
        isDateInRange = this.isDateInRange(item.expenseDate, startDate, endDate);
        dateCheck = true
      }

      return (isExpenseNameMatch || isPayerNameMatch || isAmountMatch) && (dateCheck? isDateInRange : true);
    });
  }

  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    console.log(date, startDate, endDate)
    const isoDateString = date
    date = new Date(isoDateString);

    console.log(date);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  }
}
