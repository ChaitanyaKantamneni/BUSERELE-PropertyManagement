import { CommonModule, NgFor, NgIf } from '@angular/common';
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
  propertySpecificdescription:string;
}

@Component({
  selector: 'app-view-property',
  standalone: true,
  imports: [HttpClientModule, NgFor, TopNav1Component, FooterComponent,ReactiveFormsModule,NgIf,CommonModule],
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
    
    this.intervalId = setInterval(() => {
      this.loadProperties();  // Update displayed properties every 30 seconds
    }, 30000);
  }

  //propertydetails:PropertyDet[]=[];
  propertydetails: any[] = [];
  FeaturedProperties:any[]=[];
  iframeHtml: SafeHtml | null = null;
  isLoading: boolean = false;
  isLoadingFeaProperty: boolean = false;
  selectedAmenities:any[]=[];



  isShareMenuVisible = false;


  toggleShareMenu() {
    this.isShareMenuVisible = !this.isShareMenuVisible;
  }
  shareOnWhatsApp() {
    const message = 'Check this out!';
    const url = encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${message}%20${url}`;
    window.open(whatsappUrl, '_blank');
  }
  shareOnInstagram() {
    alert('Sharing on Instagram (this is a placeholder)');
  }

  shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank');
  }



  loadPropertyDetailsByPropertyID(propertyID: string) {
    this.isLoading=true;
    this.apiurl.get<any>(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propertyID}`)
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);

          if (response) {
            // Process all images and create an array of image URLs
            let imageUrls = [];
            let floorImages = [];

            if (response.images && Array.isArray(response.images) && response.images.length > 0) {
              imageUrls = response.images.map((img: any) => this.processImage(img));  // Ensure image URLs are processed
            }
            else {
              imageUrls = ['assets/images/img1.png'];
            }
            
            if (response.floorImages && Array.isArray(response.floorImages) && response.floorImages.length > 0) {
              floorImages = response.floorImages.map((img: any) => this.processImage(img));  // Process floor images
            }
            else {
              floorImages = [];
            }
            

            // const allImages = [...imageUrls, ...floorImages];
            const allImages = [...imageUrls, ...floorImages].sort((a, b) => {
              const orderA = a.imageOrder ? parseInt(a.imageOrder, 10) : 0;
              const orderB = b.imageOrder ? parseInt(b.imageOrder, 10) : 0;
              return orderA - orderB; // Ascending order
            });
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
            
            let propertyForBadge = '';
            if (response.propertyFor === '1') {
              propertyForBadge = 'For Buy';
              propertyBadgeColor = 'green';
            } else if (response.propertyFor === '2') {
              propertyForBadge = 'For Sale';
              propertyBadgeColor = 'red';
            }
            else if(response.propertyFor === '3') {
              propertyForBadge = 'For Rent';
              propertyBadgeColor = 'blue';
            }
            else if(response.propertyFor === '4') {
              propertyForBadge = 'For Lease';
              propertyBadgeColor = 'orange';
            }

            let PropertyFacingDB='';
            if(response.propertyFacing === '1'){
              PropertyFacingDB='North';
            }
            else if (response.propertyFacing === '2') {
              PropertyFacingDB='South';
            }
            else if (response.propertyFacing === '3') {
              PropertyFacingDB='East';
            }
            else if (response.propertyFacing === '4') {
              PropertyFacingDB='West';
            }
            else{
              PropertyFacingDB='N/A';
            }

            let PropertyStatusDB='';
            if(response.propertyStatus === '1'){
              PropertyStatusDB='Ready To Move';
            }
            else if (response.propertyStatus === '2') {
              PropertyStatusDB='Under Construction';
            }
            else{
              PropertyStatusDB='N/A';
            }

            const selectedAmenitiesString = response.aminities || '';
      this.selectedAmenities = selectedAmenitiesString.split(',')
  .map((amenity: string): Amenity => {
    const [id, name] = amenity.trim().split(' - ');  // Split by " - " to get id and name
    return { id, name };  // Return as an object of type Amenity
  })
  .filter((amenity: Amenity) => amenity.id && amenity.name);


  const formattedPossessionDate = this.formatDate(response.possessionDate);
  const formattedListDate = this.formatDate(response.listDate);


            this.propertydetails = [{
              propertyID: response.propID || 'N/A',
              propertyName: response.propname || 'Unknown Property',
              propertyPrice: response.propertyTotalPrice || 'Price not available',
              propertyAddress: response.address || 'Address not available',
              propertyArea: response.totalArea || 'Area not available',
              propertyBeds: response.noOfBedrooms || 'Beds not available',
              propertyBathrooms: response.noOfBathrooms || 'Bathrooms not available',
              propertyType: response.propertyTypeName || 'Unknown Type',
              propertyImages: allImages, // Set the array of image URLs
              propertyVideos:VideoUrls,
              propertyparking:response.noOfParkings,
              propertyfacing:PropertyFacingDB,
              propertyAvailability:propertyBadge,
              propertyBadgeColor: propertyBadgeColor,
              propertyCity:response.cityName,
              propertyZipCode:response.zipCode,
              GmapUrl:response.googleLocationurl,
              propertydescription:response.description,
              propertyspecificDescription:response.specificDescription,
              developedby:response.developedby,
              mobileNumber:response.mobileNumber,
              emailID:response.emailID,
              country:response.countryName,
              state:response.stateName,
              nearBy:response.nearBy,
              reraCertificateNumber:response.reraCertificateNumber,
              propertyApprovedBy:response.propertyApprovedBy,
              propertyFor:propertyForBadge,
              propertyStatus:PropertyStatusDB,
              totalBlocks:response.totalBlocks,
              totalFloors:response.totalFloors,
              noOfFlats:response.noOfFlats,
              blockName:response.blockName,
              propertyOnWhichFloor:response.propertyOnWhichFloor,
              noOfBalconies:response.noOfBalconies,
              propertyFacing:PropertyFacingDB,
              buildYear:response.buildYear,

              // possessionDate:response.possessionDate,
              // listDate:response.listDate,
              

              possessionDate: formattedPossessionDate,
              listDate: formattedListDate,

              propname:response.propname,
              landMark:response.landMark,
              amenitiesCharges:response.amenitiesCharges,
              websiteurl:response.websiteurl,
              pinteresturl:response.pinteresturl,
              facebookurl:response.facebookurl,
              twitterurl:response.twitterurl,
            }];

            if (response.googleLocationurl) {
              console.log(response.googleLocationurl);
              this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(response.googleLocationurl);
            }

            this.selectedImage = this.propertydetails[0]?.propertyImages[0] || null;
            console.log('selected Image',this.selectedImage);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  // loadFeaturedPropertyDetails() {
  //   this.isLoadingFeaProperty=true;
  //   const minLoadingTime = 1000;

  //   const loadingTimer = setTimeout(() => {
  //     this.isLoadingFeaProperty = false;
  //   }, minLoadingTime);
  //   this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnFeaturedProperty')
  //     .subscribe(
  //       (response: any[]) => {
  //         console.log('API Response:', response);
  
  //         // Map the API response to the propertydetails array
  //         this.FeaturedProperties = response.map((property: any) => {
  //           let propertyImage: string = ''; // Default image if no valid image found
  
  //           // Log the whole property object for inspection
  //           console.log('Full Property:', property);
  
  //           // Check if 'images' exists and is an array
  //           if (property.images && Array.isArray(property.images) && property.images.length > 0) {
  //             console.log('Property Images:', property.images);
  
  //             // Process the first image in the array
  //             const firstImage = property.images[0];
  
  //             if (firstImage.fileData) {
  //               console.log('First Image File Data:', firstImage.fileData);
  
  //               try {
  //                 // Decode the Base64 string into raw binary data
  //                 const byteCharacters = atob(firstImage.fileData);
  //                 const byteArray = new Uint8Array(byteCharacters.length);
  
  //                 // Copy the binary data into the byteArray
  //                 for (let i = 0; i < byteCharacters.length; i++) {
  //                   byteArray[i] = byteCharacters.charCodeAt(i);
  //                 }
  
  //                 // Create a Blob from the byteArray
  //                 const blob = new Blob([byteArray], { type: firstImage.mimeType });
  
  //                 // Create an object URL from the Blob
  //                 propertyImage = URL.createObjectURL(blob);
  
  //                 // Log the URL for verification
  //                 console.log('Generated Image URL:', propertyImage);
  //               } catch (error) {
  //                 console.error('Error decoding first image data:', error);
  //               }
  //             } else {
  //               propertyImage='assets/images/img1.png';
  //             }
  //           } else {
  //             console.log('images property is missing, not an array, or empty.');
  //           }

  //           let propertyBadge = '';
  //           let propertyBadgeColor = '';
  //           if (property.availabilityOptions === '1') {
  //             propertyBadge = 'For Sell';
  //             propertyBadgeColor = 'red';
  //           } else if (property.availabilityOptions === '2') {
  //             propertyBadge = 'For Rent';
  //             propertyBadgeColor = 'green';
  //           }

  //           let PropertyFacing='';
  //           if(property.propertyFacing === '1'){
  //             PropertyFacing='North';
  //           }
  //           else if (property.propertyFacing === '2') {
  //             PropertyFacing='South';
  //           }
  //           else if (property.propertyFacing === '3') {
  //             PropertyFacing='East';
  //           }
  //           else if (property.propertyFacing === '4') {
  //             PropertyFacing='West';
  //           }
  //           else{
  //             PropertyFacing='N/A';
  //           }
  
  //           // Return the final object for each property
  //           return {
  //             propertyID: property.propID || 'N/A',  // Default value if undefined
  //             propertyname: property.propname || 'Unknown Property',  // Default value if undefined
  //             propertyprice: property.propertyTotalPrice || 'Price not available',  // Default value if undefined
  //             propertyaddress: property.address || 'Address not available',  // Default value if undefined
  //             propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
  //             propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
  //             propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
  //             propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
  //             propertytypeName: this.getPropertyTypeName(property.propertyType),
  //             propertyimage: propertyImage,  // Set the first converted Blob URL or default image URL
  //             propertyparking:property.noOfParkings,
  //             propertyfacing:PropertyFacing,
  //             propertyAvailability:propertyBadge,
  //             propertyBadgeColor: propertyBadgeColor
              
  //           };
  //         });
  //         clearTimeout(loadingTimer);
  //         this.isLoadingFeaProperty=false;
  //       },
  //       (error) => {
  //         console.error('Error fetching property details:', error);
  //       }
  //     );
  // }

  // convertToCrores(value: number): string {
  //   if (value >= 10000000) {
  //     return (value / 10000000).toFixed(2) + 'Cr';
  //   } else if (value >= 100000) {
  //     return (value / 100000).toFixed(2) + 'L';
  //   } else {
  //     return value.toString();
  //   }
  // }

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

// enquiryformsubmit() {
//   const data = {
//     name: this.userEnquiryform.get('name')?.value.toString(),
//     email: this.userEnquiryform.get('email')?.value.toString(),
//     phone: this.userEnquiryform.get('phone')?.value.toString(),
//     message: this.userEnquiryform.get('message')?.value.toString()
//   };

//   this.apiurl.post('https://localhost:7190/api/Users/InsUserEnquiry', data, {
//     headers: { 'Content-Type': 'application/json' }
//   }).subscribe({
//     next: (response: any) => {
//       alert('We have received your enquiry. Our team will contact you soon...!');
//       this.router.navigate(['/home']);
//       // this.sendEmail();
//     },
//     error: (error) => {
//       console.error("Error details:", error);
//       alert('Failed to submit enquiry. Try again later...!');
//       this.router.navigate(['/home']);
//     },
//     complete: () => {
//       console.log("Request completed");
//     }
//   });
// }

isUpdateModalOpen: boolean = false;
propertyInsStatus: string = '';
enquiryformsubmit() {
  const data = {
    name: this.userEnquiryform.get('name')?.value.toString(),
    email: this.userEnquiryform.get('email')?.value.toString(),
    phone: this.userEnquiryform.get('phone')?.value.toString(),
    message: this.userEnquiryform.get('message')?.value.toString(),
    propID: this.propertydetails.length > 0 ? this.propertydetails[0].propertyID : '', 
    propName: this.propertydetails.length > 0 ? this.propertydetails[0].propertyName : '',
    propLocation: this.propertydetails.length > 0 ? this.propertydetails[0].landMark : ''
    
  };

  this.apiurl.post('https://localhost:7190/api/Users/UsersEnquiryForProperty', data, {
    headers: { 'Content-Type': 'application/json' }
  }).subscribe({
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

sanitizeHtml(content: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(content);  
}







convertToCrores(value: number | string): string {
  if (!value) return 'N/A'; // Handle empty or undefined value

  // If value is a range (e.g., "14000000-20000000"), split and process
  if (typeof value === 'string' && value.includes('-')) {
    const [min, max] = value.split('-').map(Number);
    return this.formatPrice(min) + ' - ' + this.formatPrice(max);
  }

  // Handle single price
  return this.formatPrice(Number(value));
}

formatPrice(value: number): string {
  if (value >= 10000000) {
    return (value / 10000000).toFixed(2) + 'Cr'; // Convert to Crores
  } else if (value >= 100000) {
    return (value / 100000).toFixed(2) + 'L'; // Convert to Lakhs
  } else {
    return value.toString(); // Leave as-is for smaller numbers
  }
}

propertyKeys = [
  'propertyID', 'developedby', 'propname', 'mobileNumber', 'emailID', 
  'landMark', 'country', 'state', 'nearBy', 'reraCertificateNumber', 
  'propertyApprovedBy', 'propertyType', 'propertyFor', 'propertyStatus',
  'propertyFacing', 'totalBlocks', 'totalFloors', 'noOfFlats', 
  'blockName', 'propertyOnWhichFloor', 'propertyBeds', 'propertyBathrooms', 
  'noOfBalconies', 'propertyparking', 'amenitiesCharges', 'buildYear', 
  'possessionDate', 'listDate'
];

getLabel(key: string): string {
  const labels: { [key: string]: string } = {
    'propertyID': 'Property ID',
    'developedby': 'Developed By',
    'propname': 'Property Title',
    'mobileNumber': 'Mobile Number',
    'emailID': 'Email ID',
    'landMark': 'Landmark',
    'country': 'Country',
    'state': 'State',
    'nearBy': 'Nearby',
    'reraCertificateNumber': 'Certificate Number',
    'propertyApprovedBy': 'Approved By',
    'propertyType': 'Property Type',
    'propertyFor': 'Property For',
    'propertyStatus': 'Property Status',
    'propertyFacing': 'Property Facing',
    'totalBlocks': 'Total Blocks',
    'totalFloors': 'Total Floors',
    'noOfFlats': 'No. of Flats',
    'blockName': 'Block Name',
    'propertyOnWhichFloor': 'Property Floor',
    'propertyBeds': 'Bedrooms',
    'propertyBathrooms': 'Bathrooms',
    'noOfBalconies': 'Balconies',
    'propertyparking': 'Parking',
    'amenitiesCharges': 'Amenities Charges',
    'buildYear': 'Build Year',
    'possessionDate': 'Possession Date',
    'listDate': 'List Date'
  };
  
  return labels[key] || key; // Default to the key if no label is found
}

getValueStyle(key: string): any {
  // You can customize styling based on the property key if needed
  if (key === 'emailID') {
    return { 'text-align': 'center' }; // Example style for emailID
  }
  return {}; // No special style
}



displayedProperties: any[] = [];
currentIndex = 0;
intervalId: any;
isLoadingFeaProperty1 = false;
loadProperties(): void {
  const propertiesToDisplay = this.FeaturedProperties.slice(this.currentIndex, this.currentIndex + 3);
  this.displayedProperties = propertiesToDisplay;
  this.currentIndex = (this.currentIndex + 3) % this.FeaturedProperties.length;
}
ngOnDestroy(): void {
  if (this.intervalId) {
    clearInterval(this.intervalId); // Cleanup the interval on destroy
  }
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
          let propertyImage: string = 'assets/images/img1.png'; // Default image if no valid image found
          let defaultPropImage: string = 'assets/images/img1.png';

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

          if (property.image && property.image.fileData) {
            const firstImage = property.image;

            try {
              // Decode the Base64 string into raw binary data
              const byteCharacters = atob(firstImage.fileData);
              const byteArray = new Uint8Array(byteCharacters.length);

              // Copy the binary data into the byteArray
              for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
              }

              // Create a Blob from the byteArray
              const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Set MIME type to 'image/jpeg' if it's a JPEG image

              // Create an object URL from the Blob
              defaultPropImage = URL.createObjectURL(blob);

              // Log the URL for verification
              console.log('Generated Default Image URL:', defaultPropImage);
            } catch (error) {
              console.error('Error decoding default image data:', error);
            }
          }

          let propertyBadge = '';
          let propertyBadgeColor = '';
          
          if (property.propertyFor === '1') {
            propertyBadge = 'For Buy';
            propertyBadgeColor = 'green';
          } else if (property.propertyFor === '2') {
            propertyBadge = 'For Sale';
            propertyBadgeColor = 'red';
          }
          else if(property.propertyFor === '3') {
            propertyBadge = 'For Rent';
            propertyBadgeColor = 'blue';
          }
          else if(property.propertyFor === '4') {
            propertyBadge = 'For Lease';
            propertyBadgeColor = 'orange';
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
            propertyaddress: property.landMark || 'Address not available',  // Default value if undefined
            propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
            propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
            propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
            propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
            propertytypeName: this.getPropertyTypeName(property.propertyType),
            propertyimage: propertyImage,  // Set the first converted Blob URL or default image URL
            defaultPropImage:defaultPropImage,
            propertyparking:property.noOfParkings,
            propertyfacing:PropertyFacing,
            propertyAvailability:propertyBadge,
            propertyBadgeColor: propertyBadgeColor,
            propertyNearBy:property.nearBy
          };
        });
        clearTimeout(loadingTimer);
        this.isLoadingFeaProperty=false;
      },
      (error) => {
        console.error('Error fetching property details:', error);
        this.FeaturedProperties=[];
        this.isLoadingFeaProperty=false;
      }
    );
}
}
