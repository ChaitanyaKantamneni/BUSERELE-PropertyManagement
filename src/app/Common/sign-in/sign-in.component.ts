import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf, HttpClientModule,RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  constructor(public http: HttpClient, public routes: Router) {}

  ngOnInit(): void {
    // Clear localStorage on component initialization
    localStorage.clear();
    console.log("Local storage cleared on component initialization.");

    // Add session timeout listeners
    this.addSessionTimeoutListeners();
  }

  LoginForms: any = new FormGroup({
    email: new FormControl(),
    password: new FormControl()
  });

  public loginsuccesfull: boolean = false;
  public LoginStatus: string = "";
  public color = { red: false, green: false };
  public RollID:string="";

  get form() {
    return this.LoginForms.controls;
  }

  loginform() {
    const data = {
      email: this.LoginForms.get('email').value,
      password: this.LoginForms.get('password').value
    };
    this.loginsuccesfull = true;
    console.log(this.LoginForms);
    if(!localStorage.getItem('email')){
      this.routes.navigate(['/signin']);
    }
    this.http.post("https://localhost:7190/api/Users/login", data, { headers: { 'Content-Type': 'application/json' } })
      .subscribe({
        next: (result: any) => {
          this.LoginStatus = result.message;
          this.color = { red: false, green: true };
          if (result.user.rollId === "1") {
            this.RollID="1";
            localStorage.setItem("email", this.LoginForms.get('email').value);
            localStorage.setItem("RollID",this.RollID);
            setTimeout(() => {
              this.routes.navigate(['/dashboard']);
            }, 3000);
          } else if(result.user.rollId === "2"){
            this.RollID="2";
            localStorage.setItem("email", this.LoginForms.get('email').value);
            localStorage.setItem("RollID",this.RollID);
            setTimeout(() => {
              this.routes.navigate(['/UserDashboard']);
            }, 3000);
          }
          else {
            this.LoginStatus = "Login Failed. Please try again!";
            this.color = { red: true, green: false };
            this.routes.navigate(['/signin']);
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this.LoginStatus = error.error;
          this.color = { red: true, green: false };
        },
        complete: () => {
          console.log('Request completed');
        }
      });
  }

  private addSessionTimeoutListeners(): void {
    let sessionTimeoutId: any;
    const sessionTimeoutDuration = 30 * 60 * 1000; 

    const resetSessionTimeout = () => {
      clearTimeout(sessionTimeoutId);
      sessionTimeoutId = setTimeout(() => {
        localStorage.clear();
        console.log("Session expired, localStorage cleared.");
      }, sessionTimeoutDuration);
    };

    window.addEventListener('click', resetSessionTimeout);
    window.addEventListener('keydown', resetSessionTimeout);
    resetSessionTimeout();
  }

  passwordVisible: boolean = false;
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;  // Toggle the visibility
  }
}

