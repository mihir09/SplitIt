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
  errorMessage: string = '';
  isRegistering = false;
  spinnerMessage = "Setting up your account.";
  
  usernameTouched: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  
  isUnlocking: boolean = false;
  wasDisabled: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  get isEmailValid(): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
    return emailPattern.test(this.formData.email);
  }

  get isFormValid(): boolean {
    return !!(this.formData.username && this.formData.email && this.formData.password && this.isEmailValid);
  }

  // Watch for form validation changes to trigger unlock animation
  ngDoCheck(): void {
    if (this.wasDisabled && this.isFormValid) {
      this.isUnlocking = true;
      setTimeout(() => {
        this.isUnlocking = false;
      }, 600);
    }
    this.wasDisabled = !this.isFormValid;
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
    if (!this.isFormValid) {
      return;
    }

    this.isRegistering = true;
    this.spinnerMessage = 'Please wait... ' + this.spinnerMessage;

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
        this.errorMessage = error.error.message;
        console.error('Registration failed:', error.error.message);
      }
    });
  }
}