import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-side-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-side-nav.component.html',
  styleUrl: './dashboard-side-nav.component.css'
})
export class DashboardSideNavComponent implements OnInit {
  constructor(private routes:Router){}
  ngOnInit(): void {
  }
    isSubmenuVisible = false;

    toggleSubmenu() {
        this.isSubmenuVisible = !this.isSubmenuVisible;
    }

    logout(){
      this.routes.navigate(['/signin'])
      localStorage.clear();
    }
}
