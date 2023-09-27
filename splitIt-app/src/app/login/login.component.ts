import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formData = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.formData).subscribe({
      next : (response: any)=> { 
        localStorage.setItem('token', response.token)
        this.router.navigate(['/'])
        // console.log('Login successful')
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
  });
  }
}
