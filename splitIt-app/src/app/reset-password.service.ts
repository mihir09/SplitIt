import { API_BASE_URL } from './api.config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) { }

  sendResetOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email });
  }

  resetPassword(data: { email: string, otp: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password/verify`, data);
  }
}
