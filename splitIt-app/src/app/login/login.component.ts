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
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.formData).subscribe({
      next : (response: any)=> { 
        localStorage.setItem('token', response.token)
        localStorage.setItem('userEmail', this.formData.email)
        this.errorMessage='';
        this.router.navigate(['/'])
        // console.log('Login successful')
      },
      error: (error) => {
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
