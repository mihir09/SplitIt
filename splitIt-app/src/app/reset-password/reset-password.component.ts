import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordService } from './../reset-password.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  formData = { email: '', otp: '', newPassword: '' };
  errorMessage: string = '';
  resetComplete = false;
  passwordResetSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private resetPasswordService: ResetPasswordService
  ) { }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const otp = this.route.snapshot.queryParamMap.get('otp');
    if (email && otp) {
      this.formData.email = email;
      this.formData.otp = otp;
      this.resetComplete = true;
    }
  }

  sendResetOTP(): void {
    this.errorMessage='';
    this.resetPasswordService.sendResetOTP(this.formData.email).subscribe(
      (response: any) => {
        console.log(response);
        this.resetComplete = true;
      },
      (error: any) => {
        console.error('Error occurred:', error);
        this.errorMessage = error.error.message || 'An error occurred while sending the reset OTP.';
      }
    );
  }

  resetPassword(): void {
    this.errorMessage='';
    if (this.resetComplete) {
      this.resetPasswordService.resetPassword(this.formData).subscribe(
        (response: any) => {
          console.log(response);
          this.passwordResetSuccess = true;
        },
        (error: any) => {
          console.error('Error occurred:', error);
          this.errorMessage = error.error.message || 'An error occurred while resetting the password.';
        }
      );
    }
    else{
      this.errorMessage = 'Please generate new OTP and try again.'
    }
  }
}
