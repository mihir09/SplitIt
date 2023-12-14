import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expensesUrl = 'https://gray-angry-dalmatian.cyclic.app/api/expenses';
  private groupUrl = 'https://gray-angry-dalmatian.cyclic.app/api/groups';
  private _refreshRequired = new Subject<void>();

  constructor(private http: HttpClient, private groupService: GroupService) { }

  addExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.expensesUrl}`, expenseData)
  } 

  getExpensesOfGroup(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.groupUrl}/${groupId}/expenses`);
  }

  deleteExpense(expenseId: string): Observable<any> {
    const url = `${this.expensesUrl}/${expenseId}`;
    return this.http.delete(url);
  }

  editExpense(expenseId: string, expenseData: any, oldExpenseData: any): Observable<any> {
    const editUrl = `${this.expensesUrl}/${expenseId}`;
    const combinedData = {expenseData:expenseData, oldExpenseData:oldExpenseData}
    return this.http.put(editUrl, combinedData);
  }
  
}