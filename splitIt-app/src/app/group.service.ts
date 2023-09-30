import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from './models/group.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private baseUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient, private authService: AuthService) { }

  createGroup(groupData: any): Observable<Group> {
    groupData = {
      ...groupData,
      creatorEmailId : this.authService.getCurrentUser()
    }
    return this.http.post<Group>(`${this.baseUrl}`, groupData);
  }
  
  addUserToGroup(groupId: string, userEmail: string): Observable<any> {
  
    return this.http.post(`${this.baseUrl}/${groupId}/addUserByEmail`, {
      userEmail
    });
  }

  getGroupDetails(groupId: string): Observable<Group>{
    return this.http.get<Group>(`${this.baseUrl}/${groupId}`)
  }
  
}
