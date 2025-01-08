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
  signupform!: FormGroup; // Non-null assertion
  submited: boolean = false;
  registredsuccesfull: string = '';
  public clr: any = { red: false, green: false };

  constructor(private apiurl: HttpClient,public routes:Router) { }

  ngOnInit(): void {
    // Initialize form controls and validation
    this.signupform = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.email]),
      OTP:new FormControl('',[Validators.required]),
      Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator });
  }

  // Password match validator
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Signup method
  // signup() {
  //   if (this.signupform.invalid) {
  //     this.submited = true;
  //     return; // Prevent submission if the form is invalid
  //   }

  //   const data = {
  //     name: this.signupform.get('FirstName')?.value,
  //     email: this.signupform.get('Email')?.value,
  //     mobileNo: this.signupform.get('Mobile')?.value,
  //     password: this.signupform.get('Password')?.value,
  //     rollId: '2',
  //     LastName: this.signupform.get('LastName')?.value
  //   };

  //   this.submited = true;
  //   this.http.post('https://localhost:7190/api/Users/ins_users', data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   }).subscribe({
  //     next: (result: any) => {
  //       if (result.statusCode === 200) {
  //         this.registredsuccesfull = result.message;
  //         this.clr = { red: false, green: true };
  //       } else {
  //         this.registredsuccesfull = 'Registration failed!';
  //         this.clr = { red: true, green: false };
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error:', error);
  //       this.registredsuccesfull = error.error;
  //       this.clr = { red: true, green: false };
  //     }
  //   });
  // }

  passwordVisible: boolean = false;
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;  // Toggle the visibility
  }

  otpVerified:boolean=false;
  sendOTPClick() {
    const data = {
      email: this.signupform.get('Email')?.value.toString()
    };
  
    this.apiurl.post('https://localhost:7190/api/Users/SendOTP', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.passwordChangeStatus = "An OTP has been sent to your email. Please check your inbox and enter the code to proceed.";
          this.isUpdateModalOpen = true;
        }
        else{
          this.passwordChangeStatus=response.message;
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
        console.error("Error details:", error);
      }
    });
  }
  
  isUpdateModalOpen:boolean = false;
  passwordChangeStatus:string="";
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }

  // Handle "OK" button click
  handleOk() {
    this.UpdatecloseModal();
  }

  changePassword(){
    const data = {
      email: this.signupform.get('Email')?.value.toString(),
      otp: this.signupform.get('OTP')?.value.toString(),
      newPassword: this.signupform.get('Password')?.value.toString(),
    };
  
    // Call the API endpoint to verify the OTP
    this.apiurl.post('https://localhost:7190/api/Users/ChangePassword', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // OTP verified successfully
          this.passwordChangeStatus = response.message;
          this.isUpdateModalOpen = true;
          this.routes.navigate(['/signin']);
        } else { 
          // OTP validation failed
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
    // Prepare the data to send in the request body
    const data = {
      email: this.signupform.get('Email')?.value.toString(),
      otp: this.signupform.get('OTP')?.value.toString(),
      newPassword: this.signupform.get('Password')?.value.toString(),
    };
  
    // Call the API endpoint to verify the OTP
    this.apiurl.post('https://localhost:7190/api/Users/VerifyOTP', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          // OTP verified successfully
          this.passwordChangeStatus = "OTP verified";
          this.isUpdateModalOpen = true;
          this.otpVerified = true;
        } else {
          // OTP validation failed
          this.passwordChangeStatus = response.message;
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
        console.error("Error details:", error);
      }
    });
  }
  
}
