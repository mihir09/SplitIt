import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private baseUrl = 'https://split-it-server.onrender.com/api/users';

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
}
