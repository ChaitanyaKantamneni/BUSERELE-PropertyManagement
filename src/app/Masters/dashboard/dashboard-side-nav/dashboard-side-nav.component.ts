import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-side-nav',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,NgIf,NgClass],
  templateUrl: './dashboard-side-nav.component.html',
  styleUrl: './dashboard-side-nav.component.css'
})
export class DashboardSideNavComponent implements OnInit {
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
