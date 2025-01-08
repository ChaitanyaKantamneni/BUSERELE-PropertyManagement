import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import emailjs from 'emailjs-com';
import { TopNav1Component } from '../top-nav-1/top-nav-1.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [RouterLink,FormsModule,HttpClientModule,ReactiveFormsModule,TopNav1Component],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent  {

  constructor( public apiurl:HttpClient,public routes:Router){}
  Email:string='gvrinfosystem@gmail.com';

  name: string = '';
  email: string = '';
  message: string = '';
  phone:string='';


  // onSubmit() {
  //   console.log('Form submitted!');
  //   console.log(`Name: ${this.name}`);
  //   console.log(`Email: ${this.email}`);
  //   console.log(`Message: ${this.message}`);
  //   alert('Thank you for your message. We will get back to you shortly.');
  //   this.name = '';
  //   this.email = '';
  //   this.message = '';
  // }

  userEnquiryform:FormGroup=new FormGroup({
    name:new FormControl(''),
    email:new FormControl(''),
    phone:new FormControl(''),
    message:new FormControl('')
  })
  
  enquiryformsubmit() {
    const data = {
      name: this.userEnquiryform.get('name')?.value.toString(),
      email: this.userEnquiryform.get('email')?.value.toString(),
      phone: this.userEnquiryform.get('phone')?.value.toString(),
      message: this.userEnquiryform.get('message')?.value.toString()
    };
  
    this.apiurl.post('https://localhost:7190/api/Users/InsUserEnquiry', data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        alert('We have received your enquiry. Our team will contact you soon...!');
        this.routes.navigate(['/home']);
        // this.sendEmail();
      },
      error: (error) => {
        console.error("Error details:", error);
        alert('Failed to submit enquiry. Try again later...!');
        this.routes.navigate(['/home']);
      },
      complete: () => {
        console.log("Request completed");
      }
    });
  }

  
}
