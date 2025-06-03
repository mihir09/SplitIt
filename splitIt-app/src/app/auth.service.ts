import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://split-it-server.onrender.com/api';

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

  isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    this.router.navigate(['/login'])
  }

  getCurrentUser(){
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail){
      return userEmail;
    }
    return this.logout();
  }

  getCurrentUserId(): string | null {
    const token = localStorage.getItem('token');
    console.log(token)
    if (!token) return null;
  
    try {
      const decoded: any = jwtDecode(token);
      console.log(decoded)
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

