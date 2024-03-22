import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  sendResetOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/reset-password`, { email });
  }

  resetPassword(data: { email: string, otp: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/reset-password/verify`, data);
  }
}
