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
  spinnerMessage = "Loggin In....";

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoggingIn = true;
    this.spinnerMessage = 'Using free server🥲.... This may take up to a minute or two ⏳';

    this.authService.login(this.formData).subscribe({
      next : (response: any)=> { 
        this.isLoggingIn = false;
        localStorage.setItem('token', response.token)
        localStorage.setItem('userEmail', this.formData.email)
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
