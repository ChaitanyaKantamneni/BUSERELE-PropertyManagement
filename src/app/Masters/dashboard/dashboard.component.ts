import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule,RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(public route:Router){}
  ngOnInit(): void {
    if(! localStorage.getItem("email")){
      this.route.navigate(['/signin'])
    }
  }

  isSubmenuVisible = false;

    toggleSubmenu() {
        this.isSubmenuVisible = !this.isSubmenuVisible;
    }

    logout(){
      this.route.navigate(['/signin'])
      localStorage.clear();
    }
}
