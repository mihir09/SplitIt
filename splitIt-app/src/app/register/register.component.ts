import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  formData = { username: '', email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.formData).subscribe({
      next : (response: any) => {
        localStorage.setItem('token', response.token)
        this.router.navigate(['/'])
        // console.log('Registration successful', response);
      },
      error :(error) => {
        console.error('Registration failed:', error.error.message);
      }
    });
  }
}
