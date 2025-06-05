import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [RouterOutlet,ReactiveFormsModule,RouterLink,NgIf,NgClass],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
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
