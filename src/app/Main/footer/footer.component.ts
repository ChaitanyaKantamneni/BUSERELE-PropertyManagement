import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        window.scrollTo(0, 0);  // Scroll to top after navigation
      });
  }
  showEmailSelector = false;
  // makeCall() {
  //   const phoneNumber = "+918688802505";
  //   window.location.href = `tel:${phoneNumber}`;
  // }

  // openEmailClient() {
  //   const email = "info@buserele.com";
  //   window.location.href = `mailto:${email}`;
  // }

  makeCall() {
    const phoneNumber = "+918688802505";
    window.location.href = `tel:${phoneNumber}`;
  }

  // Function to open the email client
  openEmailClient() {
    const email = "info@buserele.com";
    window.location.href = `mailto:${email}`;
  }
  openEmailSelector() {
    this.showEmailSelector = true;
  }
  closeEmailSelector() {
    this.showEmailSelector = false;
  }


}
