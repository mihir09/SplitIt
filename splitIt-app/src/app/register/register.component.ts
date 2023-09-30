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
  errorMessage: string =''
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.formData).subscribe({
      next : (response: any) => {
        localStorage.setItem('token', response.token)
        localStorage.setItem('userEmail', this.formData.email)
        this.errorMessage='';
        this.router.navigate(['/'])
        // console.log('Registration successful', response);
      },
      error :(error) => {
        this.errorMessage = error.error.message;
        console.error('Registration failed:', error.error.message);
      }
    });
  }
}
