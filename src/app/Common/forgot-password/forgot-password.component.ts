import { NgClass, NgIf,NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { response } from 'express';
import { FooterComponent } from "../../Main/footer/footer.component";
import { ApiServicesService } from '../../api-services.service';

interface navlists{
  navname:string,
  navurl:string
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule, ReactiveFormsModule, NgClass, RouterLink, NgIf, FooterComponent,NgFor],
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
  passwordVisible: boolean = false;
  confirmPasswordVisible = false;  
  otpVerified:boolean=false;
  isUpdateModalOpen:boolean = false;
  passwordChangeStatus:string="";
  constructor(private apiurl: HttpClient,public routes:Router,private apiurls: ApiServicesService) { }

  ngOnInit(): void {
    this.signupform = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]),
      OTP:new FormControl('',[Validators.required]),
      Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator });
  }

  public navitems:navlists[]=[{
    navname:'HOME',
    navurl:'/'
  },
  {
    navname:'ABOUT',
    navurl:'/about-us'
  },
  {
    navname:'CONTACT',
    navurl:'/contact-us'
  }
  ];

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

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
  
       const formData = new FormData();
       formData.append('email', email);
       formData.append('Flag', '5');

   
    this.apiurls.post('Tbl_Users_CRUD_Operations', formData).subscribe({
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
        this.passwordChangeStatus = "Email was not registered. Please try again later.";
        this.isUpdateModalOpen = true;
      }
    });
  }
  
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }

  handleOk() {
    this.UpdatecloseModal();
  }

  changePassword(){  
    const formData = new FormData();
    formData.append('email', this.signupform.get('Email')?.value.toString());
    formData.append('newPassword', this.signupform.get('Password')?.value.toString());
    formData.append('Flag', '6');
    
    this.apiurls.post('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (response: any) => {
        this.passwordChangeStatus = response.message;
        this.isUpdateModalOpen = true;
        if (response.statusCode === 200) {
          this.routes.navigate(['/signin']);
        } else { 
          this.passwordChangeStatus = response.message;
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
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
    this.apiurls.post('VerifyOTP', data).subscribe({
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
        this.passwordChangeStatus = "Otp was invalid. Please try again.";
        this.isUpdateModalOpen = true;
      }
    });
  }   
}
