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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [HttpClientModule, NgClass,ReactiveFormsModule,NgIf],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  signupform!: FormGroup; // Non-null assertion
  submited: boolean = false;
  registredsuccesfull: string = '';
  messageColor: { red: boolean, green: boolean } = { red: false, green: false };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Initializing the form group with form controls
    this.signupform = new FormGroup(
      {
        fname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-z]+')]),
        lname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-z]+')]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
        pswd: new FormControl('', [Validators.required]),
        } // Use custom group-level validator
    );
  }

  // Custom validator function for password and confirm password match
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('pswd');
    const confirmPassword = group.get('cpsw');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true }; // Return error if passwords don't match
    }
    return null; // Return null if passwords match
  }

  signup() {
    if (this.signupform.invalid) {
      this.submited = true;
      return; // If form is invalid, prevent submission
    }

    const data = {
      name: this.signupform.get('fname')?.value,
      email: this.signupform.get('email')?.value,
      mobileNo: this.signupform.get('phone')?.value,
      password: this.signupform.get('pswd')?.value,
      rollId: '2',  // Example value, you can replace this with a dynamic one
      LastName: this.signupform.get('lname')?.value
    };

    this.submited = true;
    this.http.post('https://localhost:7190/api/Users/ins_users', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (result: any) => {
        if (result.StatusCode === 200) {
          this.registredsuccesfull = result.Message;
          this.messageColor = { red: false, green: true };
        } else {
          this.registredsuccesfull = 'Registration failed!';
          this.messageColor = { red: true, green: false };
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.registredsuccesfull = error.error;
        this.messageColor = { red: true, green: false };
      }
    });
  }
}
