import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formData = { email: '', password:'' };
  errorMessage: string = '';
  errorType: string = '';
  isLoggingIn = false;
  spinnerMessage = "Logging you in to splitit.";
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
    return !!(this.formData.email && this.formData.password && this.isEmailValid);
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

    this.isLoggingIn = true;
    this.spinnerMessage = 'Please wait... '+ this.spinnerMessage;

    this.authService.login(this.formData).subscribe({
      next : (response: any)=> { 
        this.isLoggingIn = false;
        localStorage.setItem('token', response.token)
        localStorage.setItem('userEmail', this.formData.email)
        this.authService.setCurrentUser(this.formData.email);
        this.errorMessage='';
        this.router.navigate(['/'])
        // console.log('Login successful')
      },
      error: (error) => {
        this.isLoggingIn = false;
        if (error.error.type && error.error.type=='incorrect_password'){
          this.errorType = error.error.type;
        }
        let suggestion = '';
        if (error.error.suggestion)
        {
          suggestion = error.error.suggestion
        }

        this.errorMessage = error.error.message + ' ' + suggestion;
        
        console.error('Login failed:', error.error.message);
      }
    });
  }
}
