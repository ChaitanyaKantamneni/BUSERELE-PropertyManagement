import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { FooterComponent } from '../../Main/footer/footer.component';
import { ApiServicesService } from '../../api-services.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule, NgClass, ReactiveFormsModule, NgIf, RouterLink,NgClass,FooterComponent],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  signupform!: FormGroup; 
  submited: boolean = false;
  registredsuccesfull: string = '';
  // public clr: any = { red: false, green: false };
  clr = { red: false, green: false }; 
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false; 
  constructor(private http: HttpClient,private router:Router,private apiurls: ApiServicesService) { }

  ngOnInit(): void {
    this.signupform = new FormGroup({
      FirstName: new FormControl('', Validators.required),
       LastName: new FormControl('', Validators.required),
      Mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), 
      Email: new FormControl('', [Validators.required, Validators.email]),
      // Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      Password: new FormControl('', [
        Validators.required,
        // Validators.minLength(6),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$') 
      ]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  }
  // passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
  //   const password = formGroup.get('Password')?.value;
  //   const confirmPassword = formGroup.get('ConfirmPassword')?.value;
  //   return password === confirmPassword ? null : { passwordMismatch: true };
  // }
  

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible; 
  }
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible; 
  }

  signup() {
    if (this.signupform.invalid) {
      this.submited = true;
      return; 
    }

    const data = {
      name: this.signupform.get('FirstName')?.value,
      email: this.signupform.get('Email')?.value,
      mobileNo: this.signupform.get('Mobile')?.value,
      password: this.signupform.get('Password')?.value,
      rollId: '2',
      LastName: this.signupform.get('LastName')?.value,
      CreatedBy:this.signupform.get('Email')?.value

          // isActive: 'true',
      // createdBy: 1, 
      // createdDate: new Date().toISOString(),
      // createdIP: '127.0.0.1'
    };

    this.submited = true;
    // this.http.post('https://localhost:7190/api/Users/ins_users', data, {
    //   headers: { 'Content-Type': 'application/json' }
    // }).subscribe({
    //   next: (result: any) => {
    //     if (result.statusCode === 200) {
    //       // this.registredsuccesfull = result.message;
    //       this.registredsuccesfull = 'Registration Successful!';
    this.apiurls.post('ins_users', data).subscribe({
      next: (result: any) => {
        if (result.statusCode === 200) {
          this.registredsuccesfull = 'Registration Successful!';
          this.clr = { red: false, green: true };
          // setTimeout(() => {
          //   this.router.navigate(['/signin']);  
          // }, 1000);
         this.router.navigate(['/signin']);  

        } else {
         this.registredsuccesfull = 'Registration failed!';
          this.registredsuccesfull = result.message; 
          this.clr = { red: true, green: false };
        }
      },
      // error: (error) => {
      //   console.error('Error:', error);
      //   this.registredsuccesfull = error.error;
      //   this.clr = { red: true, green: false };
      // }
      error: (error) => {
        console.error('Error:', error);
        const errorMessage = error?.error?.error || 'An unexpected error occurred.';
        this.registredsuccesfull = errorMessage;
        this.clr = { red: true, green: false };
      }
    });
  }

}
