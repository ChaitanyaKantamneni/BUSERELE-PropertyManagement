import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule,RouterLink,NgIf,NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    if(! localStorage.getItem("email")){
      this.router.navigate(['/signin'])
    }
  }

  
  isExpanded = true;
  toggleSidebar() {
    this.isExpanded = !this.isExpanded; 
  }

  logout() {
    this.router.navigate(['/signin'])
    localStorage.clear();
  }
    
  
}
