import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule,HttpClientModule,FormsModule,ReactiveFormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  

  constructor(private router: Router,private http: HttpClient) {
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

  openGoogleMaps(): void {
    const googleMapsUrl = 'https://www.google.com/maps/place/GVR+Infosystems+Pvt.+Ltd/@17.4784881,78.4725568,666m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bcb9be6a16fede3:0x4c28311053c6b9fe!8m2!3d17.4784881!4d78.4751317!16s%2Fg%2F11lgl_5zq6?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D';
    
    window.open(googleMapsUrl, '_blank');
  }
  // email: string = '';
  email: string = '';
  isUpdateModalOpen: boolean = false;
  subscriptionStatus: string = '';
  // subscribeMail() {
  //   const requestBody = {
  //     email: this.email
  //   };

  //   this.http.post(`https://localhost:7190/api/Users/subscribe`, requestBody)
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Subscription successful!', response);
  //         // Show a success message or redirect the user if needed
  //       },
  //       error: (err) => {
  //         console.error('Subscription failed!', err);
  //         // Handle the error (show a user-friendly message)
  //       }
  //     });
  // }

  subscribeMail(): void {
    if (!this.email) {
      this.subscriptionStatus = 'Please enter a valid email.';
      this.isUpdateModalOpen = true;
      return;
    }

    const requestBody = { email: this.email };
    
    this.http.post(`https://localhost:7190/api/Users/subscribe`, requestBody).subscribe({
      next: (response) => {
        console.log('Subscription successful!', response);
        this.subscriptionStatus = 'Subscription successful!';
        this.isUpdateModalOpen = true;
        this.email = '';
      },
      error: (err) => {
        console.error('Subscription failed!', err);
        this.subscriptionStatus = 'Subscription failed. Please try again.';
        this.isUpdateModalOpen = true;
      }
    });
  }

  UpdatecloseModal(): void {
    this.isUpdateModalOpen = false;
  }

  handleOk(): void {
    this.isUpdateModalOpen = false;
  }

}
