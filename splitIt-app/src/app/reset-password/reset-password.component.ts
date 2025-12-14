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

  // UI-related properties for glassmorphic design
  isResetting = false;
  spinnerMessage = "Processing...";
  
  emailTouched: boolean = false;
  otpTouched: boolean = false;
  passwordTouched: boolean = false;
  
  isUnlockingEmail: boolean = false;
  isUnlockingOtp: boolean = false;
  wasEmailDisabled: boolean = true;
  wasOtpDisabled: boolean = true;

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

  // Validation getters for UI
  get isEmailValid(): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
    return emailPattern.test(this.formData.email);
  }

  get isEmailFormValid(): boolean {
    return !!(this.formData.email && this.isEmailValid);
  }

  get isOtpFormValid(): boolean {
    return !!(this.formData.otp && this.formData.newPassword);
  }

  // Watch for form validation changes for unlock animations
  ngDoCheck(): void {
    // Email form unlock animation
    if (this.wasEmailDisabled && this.isEmailFormValid && !this.resetComplete) {
      this.isUnlockingEmail = true;
      setTimeout(() => {
        this.isUnlockingEmail = false;
      }, 600);
    }
    this.wasEmailDisabled = !this.isEmailFormValid;

    // OTP form unlock animation
    if (this.wasOtpDisabled && this.isOtpFormValid && this.resetComplete) {
      this.isUnlockingOtp = true;
      setTimeout(() => {
        this.isUnlockingOtp = false;
      }, 600);
    }
    this.wasOtpDisabled = !this.isOtpFormValid;
  }

  // Blur handlers for form fields
  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onOtpBlur(): void {
    this.otpTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  sendResetOTP(): void {
    this.errorMessage = '';
    this.isResetting = true;
    this.spinnerMessage = 'Sending OTP to your email...';

    this.resetPasswordService.sendResetOTP(this.formData.email).subscribe(
      (response: any) => {
        console.log(response);
        this.isResetting = false;
        this.resetComplete = true;
      },
      (error: any) => {
        console.error('Error occurred:', error);
        this.isResetting = false;
        this.errorMessage = error.error.message || 'An error occurred while sending the reset OTP.';
      }
    );
  }

  resetPassword(): void {
    this.errorMessage = '';
    if (this.resetComplete) {
      this.isResetting = true;
      this.spinnerMessage = 'Resetting your password...';

      this.resetPasswordService.resetPassword(this.formData).subscribe(
        (response: any) => {
          console.log(response);
          this.isResetting = false;
          this.passwordResetSuccess = true;
        },
        (error: any) => {
          console.error('Error occurred:', error);
          this.isResetting = false;
          this.errorMessage = error.error.message || 'An error occurred while resetting the password.';
        }
      );
    }
    else {
      this.errorMessage = 'Please generate new OTP and try again.'
    }
  }
}
