import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expensesUrl = 'https://split-it-server.onrender.com/api/expenses';
  private groupUrl = 'https://split-it-server.onrender.com/api/groups';
  private _refreshRequired = new Subject<void>();

  constructor(private http: HttpClient, private groupService: GroupService) { }

  addExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.expensesUrl}`, expenseData)
  } 

  getExpensesOfGroup(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.groupUrl}/${groupId}/expenses`);
  }
  
}