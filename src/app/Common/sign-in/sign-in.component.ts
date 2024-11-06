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
        if (result.user.rollId === "1") {
          this.routes.navigate(['/home']); // Navigate to admin screen
      } else {
          this.routes.navigate(['/about']); // Navigate to user screen
      }
      },
      error: (error) => {
          console.error('Error:', error);
          this.LoginStatus=error.error;
      },
      complete: () => {
          console.log('Request completed');
      }
    });
  }
}
