import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, NgIf, HttpClientModule, FormsModule,NgStyle],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {

  constructor(public http: HttpClient) {}
  
  ngOnInit(): void {}

  signupform: any = new FormGroup({
    name: new FormControl(),
    email: new FormControl(),
    phone: new FormControl(),
    pswd: new FormControl()
  });

  public submited: boolean = false;
  passwordValue: string = '';
  confirmPasswordValue: string = '';
  registredsuccesfull:any='';
  messageColor:any={red:false,green:false};

  get form() {
    return this.signupform.controls;
  }

  signup() {
    const data = {
      name: this.signupform.get('name').value,
      email: this.signupform.get('email').value,
      mobileNo: this.signupform.get('phone').value,
      password: this.signupform.get('pswd').value,
      rollId: '2'
    };

    this.submited = true;
    this.http.post("https://localhost:7190/api/Users/ins_users", data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (result: any) => {
        if (result.message == "Registration successful!") {
          this.registredsuccesfull = result.Message; 
          this.messageColor ={red:false,green:true};
        } else {
          this.registredsuccesfull = "Registration failed!"; 
          this.messageColor = {red:true,green:false};
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.registredsuccesfull=error.error;
        this.messageColor={red:true,green:false};
      },
      complete: () => {
        console.log('Request completed');
      }
    });
  }
}
