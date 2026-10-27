import { API_BASE_URL } from './api.config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private baseUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) { }

  getUserGroups(userEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userEmail}/groups`);
  }

  getUserDetails(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  getUserDetailsByEmail(userEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/email/${userEmail}`);
  }

  getUserInvitations(userEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invitations/${userEmail}`);
  }
}
