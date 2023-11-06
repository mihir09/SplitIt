import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';

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

  getToken() {
    return localStorage.getItem('token');
  }

}

