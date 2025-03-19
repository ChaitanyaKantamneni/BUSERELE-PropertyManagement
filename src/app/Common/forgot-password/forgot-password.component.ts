import { NgClass, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { response } from 'express';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [HttpClientModule,ReactiveFormsModule,NgClass,RouterLink,NgIf],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  signupform!: FormGroup; 
  submited: boolean = false;
  registredsuccesfull: string = '';
  public clr: any = { red: false, green: false };
  

  otpSent: boolean = false;
  timeLeft: number = 60; 
  interval: any;
  otpExpired: boolean = false;


  constructor(private apiurl: HttpClient,public routes:Router) { }

  ngOnInit(): void {
    this.signupform = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]),
      OTP:new FormControl('',[Validators.required]),
      Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  }


  passwordVisible: boolean = false;
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;  
  }

  otpVerified:boolean=false;

  startTimer() {
    this.timeLeft = 60; 
    this.otpExpired = false;
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.otpExpired = true;
        clearInterval(this.interval);
      }
    }, 1000);
  }
  
  sendOTPClick() {
   
    const email = this.signupform.get('Email')?.value;
  
    if (!email || !this.signupform.get('Email')?.valid) {
      this.passwordChangeStatus = "Please enter a valid email address.";
      this.isUpdateModalOpen = true;
      return;
    }
  
    const data = { email: email.toString() };
  
    this.apiurl.post('https://localhost:7190/api/Users/SendOTP', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode === "200") {
          this.passwordChangeStatus = "An OTP has been sent to your email. Please check your inbox and enter the code to proceed.";
        } else {
          this.passwordChangeStatus = "OTP Sent To Email.";
        }
        this.isUpdateModalOpen = true; 
        this.otpSent = true;
        this.otpExpired = false;
        this.startTimer();
      },
      error: (error) => {
        console.error("Error details:", error);
        this.passwordChangeStatus = "Email was not registered. Please try again later.";
        this.isUpdateModalOpen = true;
      }
    });
  }
  
  // sendOTPClick() {
  //   const data = {
  //     email: this.signupform.get('Email')?.value.toString()
  //   };

  //   this.apiurl.post('https://localhost:7190/api/Users/SendOTP', data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   }).subscribe({
  //     next: (response: any) => {
  //       if (response.statusCode === "200") {
  //         this.passwordChangeStatus = "An OTP has been sent to your email. Please check your inbox and enter the code to proceed.";
  //         this.isUpdateModalOpen = true;
  //       } else {
  //         this.passwordChangeStatus = "Otp Sent To Email.";
  //         this.isUpdateModalOpen = true; 
  //       }
  //     },
  //     error: (error) => {
  //       console.error("Error details:", error);
  //       this.passwordChangeStatus = "Email Was Not Register. Please try again later.";
  //       this.isUpdateModalOpen = true; 
  //     }
  //   });
  // }

  isUpdateModalOpen:boolean = false;
  passwordChangeStatus:string="";
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }


  handleOk() {
    this.UpdatecloseModal();
  }

  changePassword(){
    const data = {
      email: this.signupform.get('Email')?.value.toString(),
      otp: this.signupform.get('OTP')?.value.toString(),
      newPassword: this.signupform.get('Password')?.value.toString(),
    };
  
    this.apiurl.post('https://localhost:7190/api/Users/ChangePassword', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.passwordChangeStatus = response.message;
          this.isUpdateModalOpen = true;
          this.routes.navigate(['/signin']);
        } else { 
          this.passwordChangeStatus = response.message;
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
        console.error("Error details:", error);
      }
    });
  }
  verifyOTPClick() {
    if (!this.otpSent) {
      this.passwordChangeStatus = "Please send OTP before verifying.";
      this.isUpdateModalOpen = true;
      return;
    }
  
    if (this.otpExpired) {
      this.passwordChangeStatus = "OTP has expired. Please request a new one.";
      this.isUpdateModalOpen = true;
      return;
    }
  
    if (!this.signupform.get('OTP')?.value) {
      this.passwordChangeStatus = "Please enter an OTP.";
      this.isUpdateModalOpen = true;
      return;
    }
  
    const data = {
      email: this.signupform.get('Email')?.value.toString(),
      otp: this.signupform.get('OTP')?.value.toString(),
      newPassword: this.signupform.get('Password')?.value.toString(),
    };
  
    this.apiurl.post('https://localhost:7190/api/Users/VerifyOTP', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.passwordChangeStatus = "OTP verified successfully.";
          this.isUpdateModalOpen = true;
          this.otpVerified = true;
        } else {
          this.passwordChangeStatus = "OTP was wrong. Please enter the correct OTP.";
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
        console.error("Error details:", error);
        this.passwordChangeStatus = "Otp was invalid. Please try again.";
        this.isUpdateModalOpen = true;
      }
    });
  }
  
  // verifyOTPClick() {
  //   if (this.otpExpired) {
  //     this.passwordChangeStatus = "OTP has expired. Please request a new one.";
  //     this.isUpdateModalOpen = true;
  //     return;
  //   }

  //   if (!this.signupform.get('OTP')?.value) {
  //     this.passwordChangeStatus = "Please enter an OTP.";
  //     this.isUpdateModalOpen = true;
  //     return;
  //   }
  //   // if (this.signupform.invalid) {
  //   //   this.passwordChangeStatus = "Please enter all required fields before proceeding.";
  //   //   this.isUpdateModalOpen = true; 
  //   //   return; 
  //   // }
  
  //   const data = {
  //     email: this.signupform.get('Email')?.value.toString(),
  //     otp: this.signupform.get('OTP')?.value.toString(),
  //     newPassword: this.signupform.get('Password')?.value.toString(),
  //   };
  
  //   this.apiurl.post('https://localhost:7190/api/Users/VerifyOTP', data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   }).subscribe({
  //     next: (response: any) => {
  //       if (response.statusCode === 200) {
  //         this.passwordChangeStatus = "OTP verified";
  //         this.isUpdateModalOpen = true;
  //         this.otpVerified = true;
  //       } else {
  //         this.passwordChangeStatus = response.message;
  //         this.isUpdateModalOpen = true;
  //       }
  //     },
  //     error: (error) => {
  //       console.error("Error details:", error);
  //     }
  //   });
  // }
  
  // verifyOTPClick() {
  //   const data = {
  //     email: this.signupform.get('Email')?.value.toString(),
  //     otp: this.signupform.get('OTP')?.value.toString(),
  //     newPassword: this.signupform.get('Password')?.value.toString(),
  //   };
  
  //   this.apiurl.post('https://localhost:7190/api/Users/VerifyOTP', data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   }).subscribe({
  //     next: (response: any) => {
  //       if (response.statusCode === 200) {
  //         this.passwordChangeStatus = "OTP verified";
  //         this.isUpdateModalOpen = true;
  //         this.otpVerified = true;
  //       } else {
  //         this.passwordChangeStatus = response.message;
  //         this.isUpdateModalOpen = true;
  //       }
  //     },
  //     error: (error) => {
  //       console.error("Error details:", error);
  //     }
  //   });
  // }
  
}
