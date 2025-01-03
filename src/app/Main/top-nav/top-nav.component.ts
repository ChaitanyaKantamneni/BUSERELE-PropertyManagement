import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface navlists{
  navname:string,
  navurl:string
}
@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [NgFor,RouterModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent implements OnInit {

  constructor(public route:RouterModule,public routes:Router){}
  ngOnInit(): void {
    
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
  },
  
];

signinORsignup(){
  this.routes.navigate(['/signin'])
}
}
