import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ApiServicesService } from '../../../api-services.service';

interface PropertyDet {
  propertyID: string;
  propertyImages: string[]; 
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

interface Amenity {
  id: string;
  name: string;
  icon:string
}
@Component({
  selector: 'app-viewpropertydashboard',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule, NgFor,ReactiveFormsModule,NgIf,CommonModule],
  templateUrl: './viewpropertydashboard.component.html',
  styleUrl: './viewpropertydashboard.component.css'
})
export class ViewpropertydashboardComponent {
  selectedPropertyID: string | null = '';
  propertydetails: any[] = [];
  FeaturedProperties:any[]=[];
  iframeHtml: SafeHtml | null = null;
  isLoading: boolean = false;
  isLoadingFeaProperty: boolean = false;
  selectedAmenities:any[]=[];
  isShareMenuVisible = false;
  displayedProperties: any[] = [];
  currentIndex = 0;
  intervalId: any;
  isLoadingFeaProperty1 = false;
  selectedImage: string | null = null;
  selectedVideo:string|null=null;
  selectedFloorImage :string|null=null;
  rating: number = 0;  
  stars: number[] = [1, 2, 3, 4, 5]; 
  hoveredRating: number = 0;  
  propID:string|null='';
  userID=localStorage.getItem('email');
  isUpdateModalOpen: boolean = false;
  propertyInsStatus: string = '';
  isLiked = true;  
  NoDataFound:string="";
  propertyList: any[] = []; 
  isVisible = false;  


  constructor(public apiurl:HttpClient,private route: ActivatedRoute, public router:Router,private sanitizer: DomSanitizer,private location: Location,private apiurls: ApiServicesService){}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const encodedID = params.get('propertyID');
  
      if (encodedID) {
        try {
          this.selectedPropertyID = atob(encodedID); 
          console.log('Decoded Property ID:', this.selectedPropertyID);
          this.loadPropertyDetailsByPropertyID(this.selectedPropertyID);
        } catch (e) {
          alert("Invalid Property ID");
          this.router.navigate(['/home']);
        }
      } else {
        alert("No Properties Available with this Property Type.");
        this.router.navigate(['/home']);
      }
  
      const wishlistState = localStorage.getItem('wishlist_' + this.selectedPropertyID);
      this.isLiked = wishlistState === 'true';
      this.checkIfPropertyInWishlist();
    });
  
    this.loadFeaturedPropertyDetails();
    this.loadProperties();
  }


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
    useremail:new FormControl('',[Validators.required,Validators.email]),
    username: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$') 
    ]),
    usernumber:new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$')]),
    usermessage:new FormControl(''),
    rating:new  FormControl(''), 
  })
  
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const shareMenu = document.querySelector('.share-menu');
    const shareButton = document.querySelector('.share-icon');
    if (this.isShareMenuVisible && !shareMenu?.contains(event.target as Node) && !shareButton?.contains(event.target as Node)) {
      this.isShareMenuVisible = false;
    }
  }

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
    const message = 'Check this out!';
    const url = encodeURIComponent(window.location.href);
    
    const instagramUrl = `https://www.instagram.com/sharer/sharer.php?u=${url}`;
    
    window.open(instagramUrl, '_blank');
  }

  shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank');
  }

OnlyNumbersAllowed(event: { which: any; keyCode: any; target: HTMLInputElement; }): boolean {
  const charCode = event.which ? event.which : event.keyCode;
  const inputElement = event.target as HTMLInputElement;
  
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    console.log('charCode restricted is ' + charCode);
    return false;
  }
  if (inputElement.value.length >= 10) {
    return false; 
  }
  return true;
}

OnlyAlphabetsAndSpacesAllowed(event: { which: any; keyCode: any; }): boolean {
  const charCode = event.which ? event.which : event.keyCode;

  if (charCode !== 32 && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
    console.log('Restricted keyCode: ' + charCode);
    return false; 
  }
  
  return true; 
}

checkIfPropertyInWishlist(): void {
  const email = localStorage.getItem('email');
  if (email && this.selectedPropertyID) {
    const endpoint = `CheckIfPropertyInWishlist/${email}/${this.selectedPropertyID}`;
    this.apiurls.get<any>(endpoint).subscribe({
      next: (response: any) => {
        this.isLiked = response?.activatedstatus === '1';
      },
      error: (error) => {
        console.error('Error checking wishlist status:', error);
      }
    });
  }
}


toggleHeart() {
  this.isLiked = !this.isLiked;
  if (!localStorage.getItem('email')) {
    this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
  } else {
    if (this.isLiked) {
      this.addToWishlist();  
    } else {
      this.removeFromWishlist();  
    }
  }
}

addToWishlist() {
  const userEmail = localStorage.getItem('email') || 'Unknown User'; 
   const wishlistRequest = {
    propID: this.selectedPropertyID,
    userID: localStorage.getItem('email'),
    createdBy: userEmail,
    activatedstatus: '1',
  };

  console.log('Adding to wishlist:', wishlistRequest);

  this.apiurls.post<any>('AddToWishlist', wishlistRequest).subscribe({
    next: (response) => {
      console.log('Added to wishlist:', response);
      this.isLiked = true;
      localStorage.setItem('wishlist_' + this.selectedPropertyID, 'true');
      this.propertyInsStatus = "Property added to your wishlist!";
      this.isUpdateModalOpen = true; 
    },
    error: (error) => {
      console.error('Error adding to wishlist:', error);
      this.propertyInsStatus = "Already in wishlist. Try again later!";
      this.isUpdateModalOpen = true; 
    }
  });
}

UpdatecloseModal() {
  this.isUpdateModalOpen = false;
}

handleOk() {
  this.isUpdateModalOpen = false;
}


removeFromWishlist() {
  const wishlistRequest = {
    propID: this.selectedPropertyID,
    userID: localStorage.getItem('email'),
    activatedstatus: '0',
  };
  console.log('Removing from wishlist:', wishlistRequest);

  const endpoint = `RemoveFromWishlist/${wishlistRequest.userID}/${wishlistRequest.propID}`;

  this.apiurls.delete(endpoint).subscribe({
    next: (response: any) => {
      console.log('Removed from wishlist:', response);
      this.isLiked = false;  
      localStorage.removeItem('wishlist_' + this.selectedPropertyID);
      
      this.propertyInsStatus = " Property removed from your wishlist!";
      this.isUpdateModalOpen = true; 
      setTimeout(() => this.location.back(), 1500); 

    },
    error: (error) => {
      console.error('Error removing from wishlist:', error);
      this.propertyInsStatus = " Failed to remove from wishlist. Try again later!";
      this.isUpdateModalOpen = true;
    }
  });
}


loadPropertyDetailsByPropertyID(propertyID: string) {
  this.isLoading = true;
 this.apiurls.get<any>(`GetPropertyDetailsById/${propertyID}`)
    .subscribe(
      (response: any) => {
        console.log('API Response:', response);

        if (response) {
          let imageUrls = [];
          if (response.images && Array.isArray(response.images) && response.images.length > 0) {
            // imageUrls = response.images.map((img: any) => `https://localhost:7190${img.filePath}`);
            imageUrls = response.images.map((img: any) => this.apiurls.getImageUrl(img.filePath));

            console.log("Generated Image URLs:", imageUrls);
          } else {
            imageUrls = ['assets/images/empty.png'];
          }

          let floorImages = [];
          if (response.floorImages && Array.isArray(response.floorImages) && response.floorImages.length > 0) {
            // floorImages = response.floorImages.map((img: any) => `https://localhost:7190${img.filePath}`);
            floorImages = response.floorImages.map((img: any) => this.apiurls.getImageUrl(img.filePath)); 
            console.log("Generated Floor Image URLs:", floorImages);
          }

          const videoUrls = response.videos.map((video: any) => {
            // return `https://localhost:7190${video.filePath}`;
            return this.apiurls.getImageUrl(video.filePath);
          });
          console.log("Generated Video URLs:", videoUrls);

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
          } else if (response.propertyFor === '3') {
            propertyForBadge = 'For Rent';
            propertyBadgeColor = 'blue';
          } else if (response.propertyFor === '4') {
            propertyForBadge = 'For Lease';
            propertyBadgeColor = 'orange';
          }

          const propertyStatusMap: { [key: string]: string } = {
            "1": "Completed",
            "2": "Under Construction",
            // "3": "Under Construction",
            // "4": "Booked",
            // "5": "Coming Soon"
          };

          const propertyStatusName = propertyStatusMap[response.propertyStatus] || "Unknown";
          const propertyForMap: { [key: string]: string } = {
            '1': 'For Buy',
            '2': 'For Sale',
            '3': 'For Rent',
            '4': 'For Lease'
          };

          const propertyColorMap: { [key: string]: string } = {
            '1': 'green',
            '2': 'red',
            '3': 'blue',
            '4': 'orange'
          };

          propertyForBadge = propertyForMap[response.propertyFor] || 'Unknown';
          propertyBadgeColor = propertyColorMap[response.propertyFor] || 'black';
          const facingMap: { [key: string]: string } = {
            "1": "North",
            "2": "South",
            "3": "East",
            "4": "West",
            "5": "North-East",
            "6": "North-West",
            "7": "South-East",
            "8": "South-West"
          };
          const propertyFacingName = facingMap[response.propertyFacing] || "Unknown";

          const selectedAmenitiesString = response.aminities || '';
          this.selectedAmenities = selectedAmenitiesString.split(',').map((amenity: string): Amenity => {
            const [id, name,icon] = amenity.trim().split(' - ');
            return { id, name,icon };
          }).filter((amenity: Amenity) => amenity.id && amenity.name && amenity.icon);

          const formattedPossessionDate = this.formatDate(response.possessionDate);
          const formattedListDate = this.formatDate(response.listDate);

          this.propertydetails = [{
            propertyID: response.propID || 'N/A',
            propertyName: response.propname || 'N/A',
            propertyPrice: response.propertyTotalPrice || 'N/A',
            propertyAddress: response.address || 'N/A',
            propertyArea: response.totalArea || 'N/A',
            propertyBeds: response.noOfBedrooms || 'N/A',
            propertyBathrooms: response.noOfBathrooms || 'N/A',
            propertyType: response.propertyTypeName || 'N/A',
            propertyImages: imageUrls, 
            floorImages: floorImages,
            propertyVideos: videoUrls,
            propertyparking: response.noOfParkings || 'N/A',
            // propertyfacing: response.propertyFacing,
            propertyfacing: propertyFacingName || 'N/A', 
            propertyAvailability: propertyBadge,
            propertyBadgeColor: propertyBadgeColor,
            propertyCity: response.cityName,
            propertyZipCode: response.zipCode,
            GmapUrl: response.googleLocationurl,
            propertydescription: response.description,
            propertyspecificDescription: response.specificDescription,
            developedby: response.developedby,
            mobileNumber: response.mobileNumber,
            emailID: response.emailID,
            country: response.countryName,
            state: response.stateName,
            nearBy: response.nearBy,
            reraCertificateNumber: response.reraCertificateNumber,
            propertyApprovedBy: response.propertyApprovedBy,
            // propertyFor: propertyForBadge,
            propertyFor: propertyForBadge, 
            // propertyStatus: response.propertyStatus,
            propertyStatus: propertyStatusName,
            totalBlocks: response.totalBlocks,
            totalFloors: response.totalFloors,
            noOfFlats: response.noOfFlats,
            blockName: response.blockName,
            propertyOnWhichFloor: response.propertyOnWhichFloor,
            noOfBalconies: response.noOfBalconies,
            buildYear: response.buildYear,
            possessionDate: formattedPossessionDate,
            listDate: formattedListDate,
            propname: response.propname,
            landMark: response.landMark,
            amenitiesCharges: response.amenitiesCharges,
            websiteurl: response.websiteurl,
            pinteresturl: response.pinteresturl,
            facebookurl: response.facebookurl,
            twitterurl: response.twitterurl,
            
          }];

          if (response.googleLocationurl) {
            console.log(response.googleLocationurl);
            this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(response.googleLocationurl);
          }

          this.selectedImage = this.propertydetails[0]?.propertyImages[0] || null;
          console.log('selected Image', this.selectedImage);

          this.selectedFloorImage = this.propertydetails[0]?.floorImages[0] || null;
          console.log('selectedfloor Image', this.selectedFloorImage);

          this.selectedVideo = this.propertydetails[0]?.propertyVideos[0] || null;
          console.log('selected video', this.selectedVideo);

          this.isLoading = false;
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

  getPropertyTypeName(propertyTypeId: string): string {
    const propertyType = this.propertytypes.find(pt => pt.propertyType === propertyTypeId);
    return propertyType ? propertyType.name : 'Unknown Type';
  }

  encodeID(id: string): string {
    return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  
  decodeID(encoded: string): string {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4) {
      encoded += '=';
    }
    return atob(encoded);
  }

  processImage(image: any): string {
    let propertyImage = 'assets/images/empty.png'; 

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
  
  setRating(star: number) {
    this.rating = star;
    this.userReviewform.controls['rating'].setValue(this.rating); 
  }

  setHoveredRating(star: number) {
    this.hoveredRating = star;
  }

  resetHoveredRating() {
    this.hoveredRating = 0;
  }

reviewformsubmit() {
  console.log("Submitting review form...");
  const userId = localStorage.getItem('email');
  console.log("User ID:", userId);
  const rating = this.rating; 

  const data = {
      propID: this.selectedPropertyID,
      userID: userId, 
      useremail: this.userReviewform.get('useremail')?.value,
      username: this.userReviewform.get('username')?.value,
      usernumber: this.userReviewform.get('usernumber')?.value,
      usermessage: this.userReviewform.get('usermessage')?.value,
      rating: rating,  
      status: '0'
  };

  console.log("Form Data:", data);

  // this.apiurl.post('https://localhost:7190/api/Users/InsUserReviews', data, {
  //     headers: { 'Content-Type': 'application/json' }
  // }).subscribe({
  //     next: (response: any) => {
  //         alert('The review has been successfully submitted. We appreciate your valuable feedback.');
  //     },

  this.apiurls.post('InsUserReviews', data).subscribe({
    next: (response: any) => {
      alert('The review has been successfully submitted. We appreciate your valuable feedback.');
    },
      error: (error) => {
          alert('Failed to submit review. Try again later...!');
      }
  });
}

selectMainImage(image: string) {
  this.selectedImage = image;
  console.log(this.selectedImage)
}
selectMainVideo(video: string) {
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

  // this.apiurl.post('https://localhost:7190/api/Users/InsUserEnquiry', data, {
  //   headers: { 'Content-Type': 'application/json' }
  // }).subscribe({
  //   next: (response: any) => {
  //     alert('We have received your enquiry. Our team will contact you soon...!');
  //     this.router.navigate(['/home']);

  this.apiurls.post('InsUserEnquiry', data).subscribe({
    next: (response: any) => {
      alert('We have received your enquiry. Our team will contact you soon!');
      this.router.navigate(['/home']);
      // this.sendEmail();
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

sanitizeHtml(content: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(content);  
}

convertToCrores(value: number | string): string {
  if (!value) return 'N/A'; 
  if (typeof value === 'string' && value.includes('-')) {
    const [min, max] = value.split('-').map(Number);
    return this.formatPrice(min) + ' - ' + this.formatPrice(max);
  }
  return this.formatPrice(Number(value));
}

formatPrice(value: number): string {
  if (value >= 10000000) {
    return (value / 10000000).toFixed(2) + 'Cr';
  } else if (value >= 100000) {
    return (value / 100000).toFixed(2) + 'L'; 
  } else {
    return value.toString(); 
  }
}

propertyKeys = [
  'propertyID', 'developedby', 'propname', 'mobileNumber', 'emailID', 
  'country', 'reraCertificateNumber', 
  'propertyApprovedBy', 'propertyType', 'propertyFor', 'propertyStatus',
  'propertyFacing', 'totalBlocks', 'totalFloors', 'noOfFlats', 
  'blockName', 'propertyOnWhichFloor', 'propertyBeds', 'propertyBathrooms', 
  'noOfBalconies', 'propertyparking', 'amenitiesCharges', 'buildYear', 
  'possessionDate', 'listDate','propertyArea',
];

getLabel(key: string): string {
  const labels: { [key: string]: string } = {
    'propertyID': 'Property ID',
    'developedby': 'Developed By',
    'propname': 'Property Title',
    'mobileNumber': 'Mobile Number',
    'emailID': 'Email ID',
    'propertyAddress': 'Address',
    'propertyCity': 'City',
    'propertyZipCode': 'ZipCode',
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
    'listDate': 'List Date',
     'propertyArea': 'Area (sqft)'
  };
  
  return labels[key] || key; 
}
getValueStyle(key: string): any {
  if (key === 'emailID') {
    return { 'text-align': 'center' }; 
  }
  return {}; 
}


loadProperties(): void {
  const propertiesToDisplay = this.FeaturedProperties.slice(this.currentIndex, this.currentIndex + 4);
  this.displayedProperties = propertiesToDisplay;
  this.currentIndex = (this.currentIndex + 4) % this.FeaturedProperties.length;
}

ngOnDestroy(): void {
  if (this.intervalId) {
  }
}

loadFeaturedPropertyDetails() {
  this.isLoadingFeaProperty = true;
  const minLoadingTime = 1000;

  const loadingTimer = setTimeout(() => {
    this.isLoadingFeaProperty = false;
  }, minLoadingTime);

  this.apiurls.get<any>('GetAllPropertyDetailsWithImagesBasedOnFeaturedProperty')
    .subscribe(
      (response: any[]) => {
        console.log('API Response:', response);

        this.FeaturedProperties = response.map((property: any) => {
          let propertyImage: string = 'assets/images/empty.png'; 
          let defaultPropImage: string = 'assets/images/empty.png'; 

          console.log('Full Property:', property);

          if (property.images && Array.isArray(property.images) && property.images.length > 0) {
            console.log('Property Images:', property.images);

            const firstImage = property.images[0];

            if (firstImage.filePath) {
              console.log('First Image Path:', firstImage.filePath);

              // propertyImage = `https://localhost:7190${firstImage.filePath}`;
              propertyImage = this.apiurls.getImageUrl(firstImage.filePath); 

              console.log('Generated Image URL:', propertyImage);
            }
          } else {
            console.log('images property is missing, not an array, or empty.');
          }

          if (property.image && property.image.filePath) {
            const firstImage = property.image;

            // defaultPropImage = `https://localhost:7190${firstImage.filePath}`;
            defaultPropImage = this.apiurls.getImageUrl(firstImage.filePath); 


            console.log('Generated Default Image URL:', defaultPropImage);
          }

          let propertyBadge = '';
          let propertyBadgeColor = '';

          if (property.propertyFor === '1') {
            propertyBadge = 'For Buy';
            propertyBadgeColor = 'green';
          } else if (property.propertyFor === '2') {
            propertyBadge = 'For Sale';
            propertyBadgeColor = 'red';
          } else if (property.propertyFor === '3') {
            propertyBadge = 'For Rent';
            propertyBadgeColor = 'blue';
          } else if (property.propertyFor === '4') {
            propertyBadge = 'For Lease';
            propertyBadgeColor = 'orange';
          }

          let PropertyFacing = '';
          if (property.propertyFacing === '1') {
            PropertyFacing = 'North';
          } else if (property.propertyFacing === '2') {
            PropertyFacing = 'South';
          } else if (property.propertyFacing === '3') {
            PropertyFacing = 'East';
          } else if (property.propertyFacing === '4') {
            PropertyFacing = 'West';
          } else {
            PropertyFacing = 'N/A';
          }

          return {
            propertyID: property.propID || 'N/A',
            propertyname: property.propname || 'Unknown Property',  
            propertyprice: property.propertyTotalPrice || 'Price not available',  
            propertyaddress: property.landMark || 'Address not available', 
            propertyarea: property.totalArea || 'Area not available', 
            propertybeds: property.noOfBedrooms || 'Beds not available',  
            propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  
            propertytype: property.propertyType || 'Unknown Type',  
            propertytypeName: this.getPropertyTypeName(property.propertyType),
            propertyimage: propertyImage, 
            defaultPropImage: defaultPropImage, 
            propertyparking: property.noOfParkings,
            propertyfacing: PropertyFacing,
            propertyAvailability: propertyBadge,
            propertyBadgeColor: propertyBadgeColor,
            propertyNearBy: property.nearBy
          };
        });

        clearTimeout(loadingTimer);
        this.isLoadingFeaProperty = false;
      },
      (error) => {
        console.error('Error fetching property details:', error);
        this.FeaturedProperties = [];
        this.isLoadingFeaProperty = false;
      }
    );
}
openShareMenu(): void {
  if (!this.isShareMenuVisible) {
    this.isShareMenuVisible = true;
  }
}
closeShareMenu(): void {
  this.isShareMenuVisible = false;
}

setIframeHtml(iframeContent: string) {
  this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(
      iframeContent.replace(/<iframe /, '<iframe style="width:100%; height:450px;" ')
  );
}

backClick(event: Event): void {
  event.stopPropagation(); 
  event.preventDefault();
  this.location.back(); 
}

@ViewChild('scrollContainer') scrollContainer!: ElementRef;

showScrollButtons = false;

ngAfterViewInit() {
  setTimeout(() => this.checkScroll(), 0);
}

checkScroll() {
  if (!this.scrollContainer) return;
  const el = this.scrollContainer.nativeElement;
  this.showScrollButtons = el.scrollWidth > el.clientWidth;
}

scrollLeft(container: HTMLElement) {
  container.scrollBy({ left: -200, behavior: 'smooth' });
}

scrollRight(container: HTMLElement) {
  container.scrollBy({ left: 200, behavior: 'smooth' });
}
}
