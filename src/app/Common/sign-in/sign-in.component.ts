import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule,NgClass,NgIf,HttpClientModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit {

  constructor(public http:HttpClient,public routes:Router){}
  ngOnInit(): void {
    
  }

  LoginForms:any=new FormGroup({
    email:new FormControl(),
    password:new FormControl()
  })

  public loginsuccesfull:boolean=false;
  public LoginStatus:string="";
  public messageColor:any={red:false,green:false};

  get form(){
    return this.LoginForms.controls;
  }
  loginform(){

    const data={
      email:this.LoginForms.get('email').value,
      password:this.LoginForms.get('password').value
    }
    this.loginsuccesfull=true;
    console.log(this.LoginForms);

    this.http.post("https://localhost:7190/api/Users/login",data,{headers:{'Content-Type': 'application/json'}
    }).subscribe({
      next: (result: any) => {
        this.LoginStatus=result.message;
        this.messageColor={red:false,green:true};
        if (result.user.rollId === "1") {

          localStorage.setItem("email", this.LoginForms.get('email').value);
          let sessionTimeoutId: any;
          const sessionTimeoutDuration = 30 * 60 * 1000;

          function resetSessionTimeout() {
            clearTimeout(sessionTimeoutId);
            sessionTimeoutId = setTimeout(() => {
              localStorage.clear();
              console.log("Session expired, localStorage cleared.");
            }, sessionTimeoutDuration);
          }
          window.addEventListener('click', resetSessionTimeout);
          window.addEventListener('keydown', resetSessionTimeout);
          resetSessionTimeout();
          setTimeout(() => {
            this.routes.navigate(['/dashboard']);
          }, 3000);
        }else {
          this.LoginStatus="Login Failed Please try again!";
          this.messageColor={red:true,green:false};
          this.routes.navigate(['/signin']);
        }
      },
      error: (error) => {
          console.error('Error:', error);
          this.LoginStatus=error.error;
          this.messageColor={red:true,green:false};
      },
      complete: () => {
          console.log('Request completed');
      }
    });
  }
}
