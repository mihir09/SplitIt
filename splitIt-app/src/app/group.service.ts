import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Group } from './models/group.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groupUrl = 'http://localhost:3000/api/groups';
  private _refreshRequired = new Subject<void>();

  constructor(private http: HttpClient, private authService: AuthService) { }

  get refreshRequired(){
    return this._refreshRequired;
  }

  createGroup(groupData: any): Observable<Group> {
    groupData = {
      ...groupData,
      creatorEmailId : this.authService.getCurrentUser()
    }
    return this.http.post<Group>(`${this.groupUrl}`, groupData);
  }
  
  addUserToGroup(groupId: string, userEmail: string): Observable<any> {
  
    return this.http.post(`${this.groupUrl}/${groupId}/addUserByEmail`, {
      userEmail
    }).pipe( tap(()=>{
      this.refreshRequired.next();
    }));
  }

  getGroupDetails(groupId: string): Observable<Group>{
    return this.http.get<Group>(`${this.groupUrl}/${groupId}`)
  }
  
}
