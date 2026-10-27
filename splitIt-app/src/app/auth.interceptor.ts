import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE_URL } from './api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(API_BASE_URL + '/')) return next.handle(request);
    const publicRoute = ['/login', '/register', '/reset-password', '/reset-password/verify'].some(path => request.url === API_BASE_URL + path);
    const token = localStorage.getItem('token');
    const authenticated = token && !publicRoute ? request.clone({setHeaders:{Authorization:`Bearer ${token}`}}) : request;
    return next.handle(authenticated).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !publicRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        this.router.navigate(['/login']);
      }
      return throwError(() => error);
    }));
  }
}
