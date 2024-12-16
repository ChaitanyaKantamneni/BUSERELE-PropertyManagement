import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';
import { SafeHtml,DomSanitizer } from '@angular/platform-browser';

// interface propertyDet{
//   propertyID:string,
//   propertyimage:string,
//   propertyprice:string,
//   propertyname:string,
//   propertyaddress:string,
//   propertyarea:string,
//   propertybeds:string,
//   propertybathrooms:string,
//   propertytype:string
// }

interface PropertyDet {
  propertyID: string;
  propertyImages: string[]; // Array to hold image URLs
  propertyPrice: string;
  propertyName: string;
  propertyAddress: string;
  propertyArea: string;
  propertyBeds: string;
  propertyBathrooms: string;
  propertyType: string;
}

@Component({
  selector: 'app-view-property',
  standalone: true,
  imports: [HttpClientModule, NgFor, TopNav1Component, FooterComponent,ReactiveFormsModule,NgIf],
  templateUrl: './view-property.component.html',
  styleUrl: './view-property.component.css'
})
export class ViewPropertyComponent implements OnInit {
  constructor(public apiurl:HttpClient,private route: ActivatedRoute, public router:Router,private sanitizer: DomSanitizer ){

  }
  selectedPropertyID: string | null = '';
  userEnquiryform:FormGroup=new FormGroup({
    name:new FormControl(''),
    email:new FormControl(''),
    phone:new FormControl(''),
    message:new FormControl('')
  })

  userReviewform:FormGroup=new FormGroup({
    useremail:new FormControl(''),
    username:new FormControl(''),
    usernumber:new FormControl(''),
    usermessage:new FormControl('')
  })
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.selectedPropertyID = params.get('propertyID');
    });
    
    if (this.selectedPropertyID) {
      this.loadPropertyDetailsByPropertyID(this.selectedPropertyID || '');
    } else {
      alert("No Properties Available with this Property Type.");
      this.router.navigate(['/home']);
    }
  }

  //propertydetails:PropertyDet[]=[];
  propertydetails: any[] = [];
  iframeHtml: SafeHtml | null = null;
  isLoading: boolean = false;

  loadPropertyDetailsByPropertyID(propertyID: string) {
    this.isLoading=true;
    this.apiurl.get<any>(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propertyID}`)
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);

          if (response && response.images && Array.isArray(response.images) && response.images.length > 0) {
            // Process all images and create an array of image URLs
            const imageUrls = response.images.map((img: any) => this.processImage(img));
            
            let propertyBadge = '';
            let propertyBadgeColor = '';
            
            if (response.availabilityOptions === '1') {
              propertyBadge = 'For Sell';
              propertyBadgeColor = 'red';
            } else if (response.availabilityOptions === '2') {
              propertyBadge = 'For Rent';
              propertyBadgeColor = 'green';
            }

            let PropertyFacing='';
            if(response.propertyFacing === '1'){
              PropertyFacing='North';
            }
            else if (response.propertyFacing === '2') {
              PropertyFacing='South';
            }
            else if (response.propertyFacing === '3') {
              PropertyFacing='East';
            }
            else if (response.propertyFacing === '4') {
              PropertyFacing='West';
            }
            else{
              PropertyFacing='N/A';
            }

            this.propertydetails = [{
              propertyID: response.propID || 'N/A',
              propertyName: response.propname || 'Unknown Property',
              propertyPrice: response.propertyTotalPrice || 'Price not available',
              propertyAddress: response.address || 'Address not available',
              propertyArea: response.totalArea || 'Area not available',
              propertyBeds: response.noOfBedrooms || 'Beds not available',
              propertyBathrooms: response.noOfBathrooms || 'Bathrooms not available',
              propertyType: response.propertyType || 'Unknown Type',
              propertyImages: imageUrls, // Set the array of image URLs
              propertyparking:response.noOfParkings,
              propertyfacing:PropertyFacing,
              propertyAvailability:propertyBadge,
              propertyBadgeColor: propertyBadgeColor,
              propertyCity:response.city,
              propertyZipCode:response.zipCode,
              GmapUrl:response.googleLocationurl
            }];

            if (response.googleLocationurl) {
              this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(response.googleLocationurl);
            }

            this.selectedImage = this.propertydetails[0]?.propertyImages[0] || null;
            this.isLoading=false;
          } else {
            alert("No Properties Available with this Property Type.");
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          if (error.status === 404) {
            alert("No Properties Available with this Property Type.");
            this.router.navigate(['/home']);
          } else {
            alert("An error occurred while fetching property details.");
          }
        }
      );
  }

  processImage(image: any): string {
    let propertyImage = 'assets/images/img1.png'; // Default image if not found

    if (image && image.fileData) {
      try {
        const byteCharacters = atob(image.fileData);
        const byteArray = new Uint8Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: image.mimeType });
        propertyImage = URL.createObjectURL(blob);
        console.log(propertyImage);
      } catch (error) {
        console.error('Error decoding image data:', error);
      }
    }

    return propertyImage;
  }
  
  reviewformsubmit() {
    console.log("Submitting review form...");
    const userId = localStorage.getItem('email');
    console.log("User ID:", userId);

    const data = {
        propID: this.selectedPropertyID,
        userID: userId, // Will be null if `userId` is not found
        useremail: this.userReviewform.get('useremail')?.value,
        username: this.userReviewform.get('username')?.value,
        usernumber: this.userReviewform.get('usernumber')?.value,
        usermessage: this.userReviewform.get('usermessage')?.value,
        status:'0'
    };

    console.log("Form Data:", data);

    this.apiurl.post('https://localhost:7190/api/Users/InsUserReviews', data, {
        headers: { 'Content-Type': 'application/json' }
    }).subscribe({
        next: (response: any) => {
            alert('The review has been successfully submitted. We appreciate your valuable feedback.');
        },
        error: (error) => {
            alert('Failed to submit review. Try again later...!');
        }
    });
}

selectedImage: string | null = null;
selectMainImage(image: string) {
  // Logic to set the main image, you might need to store the selected image in a variable
  this.selectedImage = image;
  console.log(this.selectedImage)
}

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
      this.router.navigate(['/home']);
      this.sendEmail();
    },
    error: (error) => {
      console.error("Error details:", error);
      alert('Failed to submit enquiry. Try again later...!');
      this.router.navigate(['/home']);
    },
    complete: () => {
      console.log("Request completed");
    }
  });
}

sendEmail() {
  const templateParams = {
    to_name: this.userEnquiryform.get('name')?.value, // Change to actual recipient name or use a form value
    to_email: this.userEnquiryform.get('email')?.value, // Recipient email address
    from_name: 'BUSERELE Property Management',
    message: 'Thank you for your enquiry. We will contact you soon.',
  };

  // Send the email using EmailJS
  emailjs.send(
    'service_47jdkyq', 
    'template_0szrprh', 
    templateParams,
    'uZT6kwr7RPQM3n5lj'
  ).then(response => {
    console.log('Email sent successfully:', response);
    alert('Email sent successfully!');
  }).catch(error => {
    console.error('Error sending email:', error);
    alert('Failed to send email. Please try again later.');
  });
}

}
