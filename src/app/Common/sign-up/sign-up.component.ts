import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,NgClass,NgIf,HttpClientModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {

  constructor(public http:HttpClient){}
  ngOnInit(): void {
    
  }

  signupform:any= new FormGroup({
    name:new FormControl(),
    email:new FormControl(),
    phone:new FormControl(),
    pswd:new FormControl()
  })

  public submited:boolean=false;
  get form(){
    return this.signupform.controls
  }
  signup(){
    const data=new FormData()
    data.append("name",this.signupform.name)
    data.append("email",this.signupform.email)
    data.append("mobileNo",this.signupform.phone)
    data.append("password",this.signupform.pswd)
    data.append("rollId",'1')
    
    this.submited=true;
    this.http.post("https://localhost:7190/api/Users/ins_users",data).subscribe((result:any)=>{
      console.log(result);
    })
  }
}
