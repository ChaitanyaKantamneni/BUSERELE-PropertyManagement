import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import emailjs from 'emailjs-com';
import { TopNav1Component } from '../top-nav-1/top-nav-1.component';
import { FooterComponent } from "../footer/footer.component";
import { CommonModule, NgClass } from '@angular/common';
import { ApiServicesService } from '../../api-services.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  providers: [ApiServicesService],
  imports: [RouterLink, FormsModule, HttpClientModule, ReactiveFormsModule, TopNav1Component, FooterComponent,CommonModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent  implements OnInit {
 
  constructor( public apiurl:HttpClient,public routes:Router,private fb: FormBuilder,private apiurls: ApiServicesService){}
  ngOnInit(): void {
    this.userEnquiryform = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      // email: new FormControl('', [
      //   Validators.required,
      //   Validators.email,
      //   Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$') 
      // ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      
      phone: new FormControl(''),
      message: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/\S{10,}/)])
    });
    
  }

  restrictGmail(event: any) {
    let inputValue: string = event.target.value;
    const domain = "@gmail.com";
    if (inputValue.includes(domain)) {
      let parts = inputValue.split(domain);
      event.target.value = parts[0].replace(/[^a-zA-Z0-9._%+-]/g, '') + domain; 
      this.userEnquiryform.get('email')?.setValue(event.target.value);
    }
  }

  userEnquiryform:FormGroup=new FormGroup({
    name:new FormControl('',[Validators.required, Validators.minLength(3)]),
    email:new FormControl('',[Validators.required, Validators.email]),
    phone:new FormControl(''),
    message:new FormControl('',[Validators.required, Validators.minLength(10)])
  })

  OnlyNumbersAllowed(event: any): void {
    const regex = /^[0-9]*$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }
  
  isModalVisible: boolean = false;  
  enquiryformsubmit() {
    this.userEnquiryform.markAllAsTouched();
  
    if (this.userEnquiryform.invalid) {
      this.propertyInsStatus = 'Please fill out the form correctly before submitting.';
      this.isUpdateModalOpen  = true;
      return;
    }
  
    const data = {
      name: this.userEnquiryform.get('name')?.value.toString(),
      email: this.userEnquiryform.get('email')?.value.toString(),
      phone: this.userEnquiryform.get('phone')?.value.toString(),
      message: this.userEnquiryform.get('message')?.value.toString()
    };
      this.apiurls.post('InsUserEnquiry', data).subscribe({
    next: (response: any) => {
      this.propertyInsStatus = 'We have received your enquiry. Our team will contact you soon...!';
      this.isUpdateModalOpen = true;
      },
      error: (error) => {
        console.error("Error details:", error);
        this.propertyInsStatus = 'Failed to submit enquiry. Try again later...!';
        this.isUpdateModalOpen = true;
      },
      complete: () => {
        console.log("Request completed");
      }
    });
  }
  
  propertyInsStatus: string = ''; 
  isUpdateModalOpen:boolean = false;
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }

  handleOk() {
    this.userEnquiryform.reset();

    this.UpdatecloseModal();
  }
  openGoogleMaps(): void {
    const googleMapsUrl = 'https://www.google.com/maps/place/GVR+Infosystems+Pvt.+Ltd/@17.4784881,78.4725568,666m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bcb9be6a16fede3:0x4c28311053c6b9fe!8m2!3d17.4784881!4d78.4751317!16s%2Fg%2F11lgl_5zq6?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D';
    
    window.open(googleMapsUrl, '_blank');
  }
  
}
