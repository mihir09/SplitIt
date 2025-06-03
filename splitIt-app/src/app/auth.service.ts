import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://split-it-server.onrender.com/api';

  private currentUserEmailSubject = new BehaviorSubject<string | null>(localStorage.getItem('userEmail'));
  public currentUserEmail$ = this.currentUserEmailSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    window.addEventListener('onload', () => {
      localStorage.removeItem('token');
    });
  }

  register(user: any) {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  login(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  setCurrentUser(email: string | null) {
    if (email) {
      localStorage.setItem('userEmail', email);
    } else {
      localStorage.removeItem('userEmail');
    }
    this.currentUserEmailSubject.next(email);
  }


  isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    this.setCurrentUser(null);
    this.router.navigate(['/login'])
  }

  getCurrentUser(): string | null {
    const current = this.currentUserEmailSubject.value;
  
    if (current) {
      return current;
    }
  
    const stored = localStorage.getItem('userEmail');
    if (stored) {
      this.setCurrentUser(stored);
      return stored;
    }
  
    return null;
  }
  

  getCurrentUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

}

