import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private apiUrl = 'http://localhost:3000/api';
  // private apiUrl = 'https://split-it-server.onrender.com/api';

  constructor(private http: HttpClient) { }

  sendResetOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email });
  }

  resetPassword(data: { email: string, otp: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password/verify`, data);
  }
}
