import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expensesUrl = 'http://localhost:3000/api/expenses';
  private groupUrl = 'http://localhost:3000/api/groups';
  private _refreshRequired = new Subject<void>();

  constructor(private http: HttpClient, private groupService: GroupService) { }

  get refreshRequired(){
    return this._refreshRequired;
  }
  

  addExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.expensesUrl}`, expenseData).pipe( tap(()=>{
      this.refreshRequired.next();
      this.groupService.refreshRequired.next();
    }));
  } 

  getExpensesOfGroup(groupId: String): Observable<any[]> {
    return this.http.get<any[]>(`${this.groupUrl}/${groupId}/expenses`);
  }
  
}