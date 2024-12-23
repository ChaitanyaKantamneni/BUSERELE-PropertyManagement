// import { NgClass, NgIf, NgStyle } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormControl, FormGroup, FormsModule } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
// import { RouterLink } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';

// @Component({
//   selector: 'app-sign-up',
//   standalone: true,
//   imports: [ReactiveFormsModule, RouterLink, NgClass, NgIf, HttpClientModule, FormsModule,NgStyle],
//   templateUrl: './sign-up.component.html',
//   styleUrl: './sign-up.component.css'
// })
// export class SignUpComponent implements OnInit {

//   constructor(public http: HttpClient) {}
  
//   ngOnInit(): void {}

//   signupform: any = new FormGroup({
//     fname: new FormControl(),
//     lname:new FormControl(),
//     email: new FormControl(),
//     phone: new FormControl(),
//     pswd: new FormControl(),
//     cpsw:new FormControl()
//   });

//   public submited: boolean = false;
//   passwordValue: string = '';
//   confirmPasswordValue: string = '';
//   registredsuccesfull:any='';
//   messageColor:any={red:false,green:false};

//   get form() {
//     return this.signupform.controls;
//   }

//   signup() {
//     const data = {
//       Name: this.signupform.get('fname').value,
//       Email: this.signupform.get('email').value,
//       MobileNo: this.signupform.get('phone').value,
//       Password: this.signupform.get('pswd').value,
//       RollId: '2',
//       LastName:this.signupform.get('lname').value,
//       IsActive:'1'
//     };

//     this.submited = true;
//     this.http.post("https://localhost:7190/api/Users/ins_users", data, {
//       headers: { 'Content-Type': 'application/json' }
//     }).subscribe({
//       next: (result: any) => {
//         if (result.message == "Registration successful!") {
//           this.registredsuccesfull = result.Message; 
//           this.messageColor ={red:false,green:true};
//         } else {
//           this.registredsuccesfull = "Registration failed!"; 
//           this.messageColor = {red:true,green:false};
//         }
//       },
//       error: (error) => {
//         console.error('Error:', error);
//         this.registredsuccesfull=error.error;
//         this.messageColor={red:true,green:false};
//       },
//       complete: () => {
//         console.log('Request completed');
//       }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [HttpClientModule, NgClass, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

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
}
