import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../auth-form.css']
})
export class RegisterComponent {
  formData = { username: '', email: '', password: '' };
  errorMessage: string = '';
  isRegistering = false;

  usernameTouched: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  get isEmailValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.formData.email);
  }

  get isFormValid(): boolean {
    return !!(this.formData.username && this.formData.email && this.formData.password && this.isEmailValid);
  }


  onUsernameBlur(): void {
    this.usernameTouched = true;
  }

  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  onSubmit() {
    if (this.isRegistering) return;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.usernameTouched = true;
    if (!this.isFormValid) {
      return;
    }

    this.errorMessage = '';
    this.isRegistering = true;

    this.authService.register(this.formData).subscribe({
      next : (response: any) => {
        this.isRegistering = false;
        localStorage.setItem('token', response.token)
        localStorage.setItem('userEmail', this.formData.email)
        this.authService.setCurrentUser(this.formData.email);
        this.errorMessage='';
        this.router.navigate(['/'])
      },
      error :(error) => {
        this.isRegistering = false;
        this.errorMessage = error.error?.message || 'Could not create your account. Please try again.';
        console.error('Registration failed:', error.status);
      }
    });
  }
}
