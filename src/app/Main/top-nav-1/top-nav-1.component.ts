import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface navlists{
  navname:string,
  navurl:string
}

@Component({
  selector: 'app-top-nav-1',
  standalone: true,
  imports: [NgFor,RouterModule,NgIf],
  templateUrl: './top-nav-1.component.html',
  styleUrl: './top-nav-1.component.css'
})
export class TopNav1Component implements OnInit {
  LoginSuccesful:boolean=false;
  constructor(public route:RouterModule,public routes:Router){}
  ngOnInit(): void {
    let RollID=localStorage.getItem("RollID");
    if(RollID!=null){
      this.LoginSuccesful=true;
    }
  }
  public navitems:navlists[]=[{
    navname:'Home',
    navurl:'/'
  },
  {
    navname:'About',
    navurl:'/about-us'
  },
  {
    navname:'Contact',
    navurl:'/contact-us'
  }
  ];

  signinORsignup(){
    this.routes.navigate(['/signin'])
  }

  dashboardClick(){
    let RollID=localStorage.getItem("RollID");
    if(RollID=="1"){
      this.routes.navigate(['/dashboard']);
    }
    else if(RollID=="2"){
      this.routes.navigate(['/UserDashboard']);
    }
  }
}
