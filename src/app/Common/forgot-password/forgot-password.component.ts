import { NgClass } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [HttpClientModule,ReactiveFormsModule,NgClass,RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  signupform!: FormGroup; // Non-null assertion
  submited: boolean = false;
  registredsuccesfull: string = '';
  public clr: any = { red: false, green: false };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Initialize form controls and validation
    this.signupform = new FormGroup({
      FirstName: new FormControl('', Validators.required),
      LastName: new FormControl('', Validators.required),
      Mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Added a pattern for mobile number validation
      Email: new FormControl('', [Validators.required, Validators.email]),
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
  signup() {
    if (this.signupform.invalid) {
      this.submited = true;
      return; // Prevent submission if the form is invalid
    }

    const data = {
      name: this.signupform.get('FirstName')?.value,
      email: this.signupform.get('Email')?.value,
      mobileNo: this.signupform.get('Mobile')?.value,
      password: this.signupform.get('Password')?.value,
      rollId: '2',
      LastName: this.signupform.get('LastName')?.value
    };

    this.submited = true;
    this.http.post('https://localhost:7190/api/Users/ins_users', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (result: any) => {
        if (result.statusCode === 200) {
          this.registredsuccesfull = result.message;
          this.clr = { red: false, green: true };
        } else {
          this.registredsuccesfull = 'Registration failed!';
          this.clr = { red: true, green: false };
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.registredsuccesfull = error.error;
        this.clr = { red: true, green: false };
      }
    });
  }

  passwordVisible: boolean = false;
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;  // Toggle the visibility
  }
}
