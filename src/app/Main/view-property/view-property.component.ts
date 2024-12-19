import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';
import { SafeHtml,DomSanitizer } from '@angular/platform-browser';

interface Amenity {
  id: string;
  name: string;
}
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
  propertyVideos:string[];
  propertyPrice: string;
  propertyName: string;
  propertyAddress: string;
  propertyArea: string;
  propertyBeds: string;
  propertyBathrooms: string;
  propertyType: string;
  propertydescription:string;
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

  propertytypes:any[]=[{
    icon:'fa-building',
    name:'Apartments/Flats',
    propertyType:'1',
    propertiesCount:''
  },
  {
    icon:'fa-landmark',
    name:'Villa',
    propertyType:'2',
    propertiesCount:''
  },
  {
    icon:'fa-home',
    name:'Home',
    propertyType:'3',
    propertiesCount:''
  },
  {
    icon:'fa-hotel',
    name:'Office Space',
    propertyType:'4',
    propertiesCount:''
  },
  {
    icon:'fa-city',
    name:'Commercial Space',
    propertyType:'5',
    propertiesCount:''
  },
  {
    icon:'fa-building',
    name:'Studio Apartment',
    propertyType:'6',
    propertiesCount:''
  }
  ]

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

    this.loadFeaturedPropertyDetails();
  }

  //propertydetails:PropertyDet[]=[];
  propertydetails: any[] = [];
  FeaturedProperties:any[]=[];
  iframeHtml: SafeHtml | null = null;
  isLoading: boolean = false;
  isLoadingFeaProperty: boolean = false;
  selectedAmenities:any[]=[];

  loadPropertyDetailsByPropertyID(propertyID: string) {
    this.isLoading=true;
    this.apiurl.get<any>(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propertyID}`)
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);

          if (response && response.images && Array.isArray(response.images) && response.images.length > 0) {
            // Process all images and create an array of image URLs
            const imageUrls = response.images.map((img: any) => this.processImage(img));
            const VideoUrls=response.videos.map((video:any)=>this.processVideo(video));
            
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

            const selectedAmenitiesString = response.aminities || '';
      this.selectedAmenities = selectedAmenitiesString.split(',')
  .map((amenity: string): Amenity => {
    const [id, name] = amenity.trim().split(' - ');  // Split by " - " to get id and name
    return { id, name };  // Return as an object of type Amenity
  })
  .filter((amenity: Amenity) => amenity.id && amenity.name);

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
              propertyVideos:VideoUrls,
              propertyparking:response.noOfParkings,
              propertyfacing:PropertyFacing,
              propertyAvailability:propertyBadge,
              propertyBadgeColor: propertyBadgeColor,
              propertyCity:response.city,
              propertyZipCode:response.zipCode,
              GmapUrl:response.googleLocationurl,
              propertydescription:response.description,
            }];

            if (response.googleLocationurl) {
              console.log(response.googleLocationurl);
              this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(response.googleLocationurl);
            }

            this.selectedImage = this.propertydetails[0]?.propertyImages[0] || null;
            this.selectedVideo=this.propertydetails[0]?.propertyVideos[0]||null;
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

  loadFeaturedPropertyDetails() {
    this.isLoadingFeaProperty=true;
    const minLoadingTime = 1000;

    const loadingTimer = setTimeout(() => {
      this.isLoadingFeaProperty = false;
    }, minLoadingTime);
    this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnFeaturedProperty')
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);
  
          // Map the API response to the propertydetails array
          this.FeaturedProperties = response.map((property: any) => {
            let propertyImage: string = ''; // Default image if no valid image found
  
            // Log the whole property object for inspection
            console.log('Full Property:', property);
  
            // Check if 'images' exists and is an array
            if (property.images && Array.isArray(property.images) && property.images.length > 0) {
              console.log('Property Images:', property.images);
  
              // Process the first image in the array
              const firstImage = property.images[0];
  
              if (firstImage.fileData) {
                console.log('First Image File Data:', firstImage.fileData);
  
                try {
                  // Decode the Base64 string into raw binary data
                  const byteCharacters = atob(firstImage.fileData);
                  const byteArray = new Uint8Array(byteCharacters.length);
  
                  // Copy the binary data into the byteArray
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                  }
  
                  // Create a Blob from the byteArray
                  const blob = new Blob([byteArray], { type: firstImage.mimeType });
  
                  // Create an object URL from the Blob
                  propertyImage = URL.createObjectURL(blob);
  
                  // Log the URL for verification
                  console.log('Generated Image URL:', propertyImage);
                } catch (error) {
                  console.error('Error decoding first image data:', error);
                }
              } else {
                propertyImage='assets/images/img1.png';
              }
            } else {
              console.log('images property is missing, not an array, or empty.');
            }

            let propertyBadge = '';
            let propertyBadgeColor = '';
            if (property.availabilityOptions === '1') {
              propertyBadge = 'For Sell';
              propertyBadgeColor = 'red';
            } else if (property.availabilityOptions === '2') {
              propertyBadge = 'For Rent';
              propertyBadgeColor = 'green';
            }

            let PropertyFacing='';
            if(property.propertyFacing === '1'){
              PropertyFacing='North';
            }
            else if (property.propertyFacing === '2') {
              PropertyFacing='South';
            }
            else if (property.propertyFacing === '3') {
              PropertyFacing='East';
            }
            else if (property.propertyFacing === '4') {
              PropertyFacing='West';
            }
            else{
              PropertyFacing='N/A';
            }
  
            // Return the final object for each property
            return {
              propertyID: property.propID || 'N/A',  // Default value if undefined
              propertyname: property.propname || 'Unknown Property',  // Default value if undefined
              propertyprice: property.propertyTotalPrice || 'Price not available',  // Default value if undefined
              propertyaddress: property.address || 'Address not available',  // Default value if undefined
              propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
              propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
              propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
              propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
              propertytypeName: this.getPropertyTypeName(property.propertyType),
              propertyimage: propertyImage,  // Set the first converted Blob URL or default image URL
              propertyparking:property.noOfParkings,
              propertyfacing:PropertyFacing,
              propertyAvailability:propertyBadge,
              propertyBadgeColor: propertyBadgeColor
            };
          });
          clearTimeout(loadingTimer);
          this.isLoadingFeaProperty=false;
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
  }

  convertToCrores(value: number): string {
    if (value >= 10000000) {
      // Convert to crores and format with 2 decimal places
      return (value / 10000000).toFixed(2) + 'Cr';
    } else if (value >= 100000) {
      // Convert to lakhs and format with 2 decimal places
      return (value / 100000).toFixed(2) + 'L';
    } else {
      // Return the value as-is if it's less than 1 lakh
      return value.toString();
    }
  }

  getPropertyTypeName(propertyTypeId: string): string {
    const propertyType = this.propertytypes.find(pt => pt.propertyType === propertyTypeId);
    return propertyType ? propertyType.name : 'Unknown Type';
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

  processVideo(video: any): string {

    let propertyVideo='';
    if (video && video.fileData) {
      try {
        const byteCharacters = atob(video.fileData);
        const byteArray = new Uint8Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: video.mimeType });
        propertyVideo = URL.createObjectURL(blob);
        console.log(propertyVideo);
      } catch (error) {
        console.error('Error decoding image data:', error);
      }
    }

    return propertyVideo;
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
selectedVideo:string|null=null;
selectMainImage(image: string) {
  // Logic to set the main image, you might need to store the selected image in a variable
  this.selectedImage = image;
  console.log(this.selectedImage)
}
selectMainVideo(video: string) {
  // Logic to set the main image, you might need to store the selected image in a variable
  this.selectedVideo = video;
  console.log(this.selectedVideo)
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
