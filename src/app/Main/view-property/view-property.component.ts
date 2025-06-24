import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from 'emailjs-com';
import { SafeHtml,DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { PdfServiceService } from '../../pdf-service.service';
import { ApiServicesService } from '../../api-services.service';


interface Amenity {
  id: string;
  name: string;
  icon:string
}

@Component({
  selector: 'app-view-property',
  standalone: true,
  providers: [PdfServiceService,ApiServicesService],
  imports: [HttpClientModule, NgFor, TopNav1Component, FooterComponent,ReactiveFormsModule,NgIf,CommonModule],
  templateUrl: './view-property.component.html',
  styleUrl: './view-property.component.css'
})
export class ViewPropertyComponent implements OnInit {
  property: any;
  propertyID: string | null = null;
  selectedPropertyID: string | null = '';
  propertydetails: any[] = [];
  FeaturedProperties:any[]=[];
  iframeHtml: SafeHtml | null = null;
  isLoading: boolean = false;
  isLoadingFeaProperty: boolean = false;
  selectedAmenities:any[]=[];
  isShareMenuVisible = false;
  isLiked = true; 
  propID:string|null='';
  userID=localStorage.getItem('email');
  NoDataFound:string="";
  propertyList: any[] = []; 
  isVisible = false;   
  rating: number = 0;  
  stars: number[] = [1, 2, 3, 4, 5]; 
  hoveredRating: number = 0;  
  showBackButton = false;
  displayedProperties: any[] = [];
  currentIndex = 0;
  intervalId: any;
  isLoadingFeaProperty1 = false;
  selectedImage: string | null = null;
  selectedVideo:string|null=null;
  selectedFloorImage :string|null=null;
  isUpdateModalOpen: boolean = false;
  propertyInsStatus: string = '';

  dots: number[] = [];
  currentSlideIndex = 0;
  autoSlideInterval: any;
  slideSize = 3;

  constructor(public apiurl:HttpClient,private route: ActivatedRoute, public router:Router,private sanitizer: DomSanitizer,private fb: FormBuilder,private location: Location,public PdfServiceService: PdfServiceService,private apiurls: ApiServicesService){}


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
    this.startAutoSlide();
  
    this.userReviewform = this.fb.group({
      useremail: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')
      ]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      usernumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      usermessage: ['', [Validators.required, Validators.minLength(10)]],
    });
  
   
    
     this.route.queryParams.subscribe(params => {
      this.showBackButton = params['fromSearch'] === 'true';
    });

    
  }



  userEnquiryform:FormGroup=new FormGroup({
    name:new FormControl('', [Validators.required,Validators.pattern('^[a-zA-Z\s]+$')]),
    email:new FormControl('',[Validators.required,Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]),
    // email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]], 
    phone:new FormControl('',[Validators.pattern('^[0-9]{10}$')]),
    message:new FormControl('',[Validators.required,Validators.minLength(10), Validators.pattern(/\S{10,}/)])
  })

     // this.route.queryParams.subscribe(params => {
    //   this.showBackButton = params['fromSearch'] === 'true';
    // });

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
    useremail:new FormControl('',[Validators.required,Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]),
    username: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$') 
    ]),
    usernumber:new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$')]),
    usermessage:new FormControl(''),
    rating:new  FormControl(''), 
  })
  // navigateToProperty(propertyID: string): void {
  //   this.router.navigate(['/view-property', propertyID]);
  // }
  navigateToProperty(propertyID: string): void {
    const encodedID = btoa(propertyID); 
    this.router.navigate(['/view-property', encodedID]);
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
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const shareMenu = document.querySelector('.share-menu');
    const shareButton = document.querySelector('.share-icon');
    if (this.isShareMenuVisible && !shareMenu?.contains(event.target as Node) && !shareButton?.contains(event.target as Node)) {
      this.isShareMenuVisible = false;
    }
  }


  toggleShareMenu(event: MouseEvent): void {
    event.stopPropagation(); 
    this.isShareMenuVisible = !this.isShareMenuVisible;
  }
  openShareMenu(): void {
    if (!this.isShareMenuVisible) {
      this.isShareMenuVisible = true;
    }
  }
  closeShareMenu(): void {
    this.isShareMenuVisible = false;
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
  if (
    (charCode >= 48 && charCode <= 57) || 
    (charCode >= 65 && charCode <= 90) || 
    (charCode >= 97 && charCode <= 122) ||
    charCode === 32 
  ) {
    return true;
  }
  return false;
}

checkIfPropertyInWishlist() {
  const email = localStorage.getItem('email');
  const wishlistRequest = {
    propID: this.selectedPropertyID,
    userID: localStorage.getItem('email'),
    createdBy: email,
    modifiedBy:email,
    activatedstatus: '1',
    flag:'5'
  };
  
  if (email) {
    this.apiurls.post<any[]>('Proc_Tbl_Wishlist',wishlistRequest).subscribe({
      next: (response: any) => {
        if (response.data && response.data.length > 0 && response.data[0].existing >= "1") {
          this.isLiked = true;
        } else {
          this.isLiked = false;
        }
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
    const email = localStorage.getItem('email') || 'Unknown User';
    const wishlistRequest = {
      propID: this.selectedPropertyID,
      userID: localStorage.getItem('email'),
      createdBy: email,
      modifiedBy:email,
      activatedstatus: '1',
      flag:'1'
    };

    console.log('Adding to wishlist:', wishlistRequest);
    this.apiurls.post('Proc_Tbl_Wishlist', wishlistRequest).subscribe({
      next: (response: any) => {
        console.log('Added to wishlist:', response);
        this.isLiked = true; 
        localStorage.setItem('wishlist_' + this.selectedPropertyID, 'true');
        this.propertyInsStatus = " Successfully added to your Wishlist";
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
    this.userEnquiryform.reset();
    this.userReviewform.reset();
    this.rating = 0; 
    this.hoveredRating = 0;
  }

  removeFromWishlist() {
    const wishlistRequest = {
      propID: this.selectedPropertyID,
      userID: localStorage.getItem('email'),
      activatedstatus: '0',
      Flag:'4'
    };

    console.log('Removing from wishlist:', wishlistRequest);

    this.apiurls.post('Proc_Tbl_Wishlist',wishlistRequest).subscribe({
      next: (response: any) => {
        console.log('Removed from wishlist:', response);
        this.isLiked = false;
        localStorage.removeItem('wishlist_' + this.selectedPropertyID);
        
        this.propertyInsStatus = " Property removed from your wishlist!";
        this.isUpdateModalOpen = true; 
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
    const data = {
      propID: propertyID,
      flag: '14'
    };

    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations', data).subscribe(
      (response: any) => {
        console.log('API Response:', response);

        if (response) {
          let imageUrls: string[] = [];
          // if (response.data[0].propImages && Array.isArray(response.data[0].propImages) && response.data[0].propImages.length > 0) {
          //   imageUrls = response.data[0].propImages.map((img: any) => this.apiurls.getImageUrl(img.filePath));
          //   console.log("Generated Image URLs:", imageUrls);
          // } else {
          //   imageUrls = ['assets/images/empty.png'];
          // }

          if (
            response.data[0].propImages &&
            Array.isArray(response.data[0].propImages) &&
            response.data[0].propImages.length > 0
          ) {
            // Sort by ImageOrder first
            const sortedImages = response.data[0].propImages.sort((a: any, b: any) => {
              return a.ImageOrder - b.ImageOrder;
            });
          
            // Map to URLs
            imageUrls = sortedImages.map((img: any) => this.apiurls.getImageUrl(img.filePath));
            console.log("Generated Image URLs (sorted):", imageUrls);
          } else {
            imageUrls = ['assets/images/empty.png'];
          }

          
          let floorImages: string[] = [];
          if (response.data[0].floorImages && Array.isArray(response.data[0].floorImages) && response.data[0].floorImages.length > 0) {
            floorImages = response.data[0].floorImages.map((img: any) => this.apiurls.getImageUrl(img.filePath));
            console.log("Generated Floor Image URLs:", floorImages);
          }

          let videoUrls: string[] = [];
          if (response.data[0].propVideos && Array.isArray(response.data[0].propVideos) && response.data[0].propVideos.length > 0) {
            videoUrls = response.data[0].propVideos.map((video: any) => this.apiurls.getImageUrl(video.filePath));
            console.log("Generated Video URLs:", videoUrls);
          }

          let propertyBadge = '';
          let propertyBadgeColor = '';
          if (response.data[0].availabilityOptions === '1') {
            propertyBadge = 'For Sell';
            propertyBadgeColor = 'red';
          } else if (response.data[0].availabilityOptions === '2') {
            propertyBadge = 'For Rent';
            propertyBadgeColor = 'green';
          }

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

          const propertyForBadge = propertyForMap[response.data[0].propertyFor] || 'Unknown';
          propertyBadgeColor = propertyColorMap[response.data[0].propertyFor] || 'black';

          const propertyStatusMap: { [key: string]: string } = {
            "1": "Completed",
            "2": "Under Construction"
          };
          const propertyStatusName = propertyStatusMap[response.data[0].propertyStatus] || "Unknown";

          const facingMap: { [key: string]: string } = {
            "1": "North", "2": "South", "3": "East", "4": "West",
            "5": "North-East", "6": "North-West", "7": "South-East", "8": "South-West"
          };
          const propertyFacingName = facingMap[response.data[0].propertyFacing] || "Unknown";

          const selectedAmenitiesString = response.data[0].aminities || '';
          this.selectedAmenities = selectedAmenitiesString.split(',').map((amenity: string): Amenity => {
            const [id, name, icon] = amenity.trim().split(' - ');
            return { id, name, icon };
          }).filter((amenity: Amenity) => amenity.id && amenity.name && amenity.icon);

          const formattedPossessionDate = this.formatDate(response.data[0].possessionDate);
          const formattedListDate = this.formatDate(response.data[0].listDate);

          this.propertydetails = [{
            propertyID: response.data[0].propID || 'N/A',
            propertyName: response.data[0].propname || 'N/A',
            propertyPrice: response.data[0].propertyTotalPrice || 'N/A',
            propertyAddress: response.data[0].address || 'N/A',
            propertyArea: response.data[0].totalArea || 'N/A',
            propertyBeds: response.data[0].noOfBedrooms || 'N/A',
            propertyBathrooms: response.data[0].noOfBathrooms || 'N/A',
            propertyType: response.data[0].propertyTypeName || 'Unknown Type',
            propertyImages: imageUrls,
            floorImages: floorImages,
            propertyVideos: videoUrls,
            propertyparking: response.data[0].noOfParkings,
            propertyfacing: propertyFacingName,
            propertyAvailability: propertyBadge,
            propertyBadgeColor: propertyBadgeColor,
            propertyCity: response.data[0].cityName,
            propertyZipCode: response.data[0].zipCode,
            GmapUrl: response.data[0].googleLocationurl,
            propertydescription: response.data[0].description,
            propertyspecificDescription: response.data[0].specificDescription,
            developedby: response.data[0].developedby,
            mobileNumber: response.data[0].mobileNumber,
            emailID: response.data[0].emailID,
            country: response.data[0].countryName,
            state: response.data[0].stateName,
            nearBy: response.data[0].nearBy,
            reraCertificateNumber: response.data[0].reraCertificateNumber,
            propertyApprovedBy: response.data[0].propertyApprovedBy,
            propertyFor: propertyForBadge,
            propertyStatus: propertyStatusName,
            totalBlocks: response.data[0].totalBlocks,
            totalFloors: response.data[0].totalFloors,
            noOfFlats: response.data[0].noOfFlats,
            blockName: response.data[0].blockName,
            propertyOnWhichFloor: response.data[0].propertyOnWhichFloor,
            noOfBalconies: response.data[0].noOfBalconies,
            buildYear: response.data[0].buildYear,
            possessionDate: formattedPossessionDate,
            listDate: formattedListDate,
            propname: response.data[0].propname,
            landMark: response.data[0].landMark,
            amenitiesCharges: response.data[0].amenitiesCharges,
            websiteurl: response.data[0].websiteurl,
            pinteresturl: response.data[0].pinteresturl,
            facebookurl: response.data[0].facebookurl,
            twitterurl: response.data[0].twitterurl,
          }];

          if (response.data[0].googleLocationurl) {
            this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(response.data[0].googleLocationurl);
          }

          this.selectedImage = this.propertydetails[0]?.propertyImages[0] || null;
          console.log('selected Image', this.selectedImage);

          this.selectedFloorImage = this.propertydetails[0]?.floorImages[0] || null;
          console.log('selected floor Image', this.selectedFloorImage);

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
          console.error("Error fetching property details:", error);
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
    const userId = localStorage.getItem('email');
    const rating = this.rating;  
    
    const data = {
      propID: this.selectedPropertyID,
      userID: userId, 
      useremail: this.userReviewform.get('useremail')?.value,
      username: this.userReviewform.get('username')?.value,
      usernumber: this.userReviewform.get('usernumber')?.value,
      usermessage: this.userReviewform.get('usermessage')?.value,
      rating: rating, 
      reviewstatus: '0',
      CreatedBy:localStorage.getItem('email'),
      flag:'1'
    };
    
    this.apiurls.post('Tbl_Reviews_CRUD_Operations', data).subscribe({
      next: (response: any) => {
        this.propertyInsStatus = 'The review has been successfully submitted. We appreciate your valuable feedback.';
        this.isUpdateModalOpen = true;
        },
        error: (error) => {
            this.propertyInsStatus = 'Failed to submit review. Try again later...!';
            this.isUpdateModalOpen = true; 
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
      description: this.userEnquiryform.get('message')?.value.toString(),
      propID: this.propertydetails.length > 0 ? this.propertydetails[0].propertyID : '', 
      propName: this.propertydetails.length > 0 ? this.propertydetails[0].propertyName : '',
      propLocation: this.propertydetails.length > 0 ? this.propertydetails[0].landMark : '',
      CreatedBy: localStorage.getItem('email') || 'Unknown User',
      flag:'2'
    };

    this.isLoading=true;
    this.apiurls.post('Tbl_Enquiry_CRUD_Operations', data).subscribe({
      next: (response: any) => {
        this.propertyInsStatus = 'We have received your enquiry. Our team will contact you soon...!';
        this.isUpdateModalOpen = true;
        this.isLoading = false;
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
    'propertyfacing', 'totalBlocks', 'totalFloors', 'noOfFlats', 
    'blockName', 'propertyOnWhichFloor', 'propertyBeds', 'propertyBathrooms', 
    'noOfBalconies', 'propertyparking', 'amenitiesCharges', 'buildYear', 
    'possessionDate', 'listDate','propertyArea',''
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
      'propertyfacing': 'Property Facing',
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
    const totalSlides = Math.ceil(this.FeaturedProperties.length / this.slideSize);
    this.dots = Array.from({ length: totalSlides }, (_, i) => i);

    const start = this.currentSlideIndex * this.slideSize;
    const end = start + this.slideSize;
    this.displayedProperties = this.FeaturedProperties.slice(start, end);
  }
  
  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.loadProperties();
    this.restartAutoSlide(); 
  }

  restartAutoSlide(): void {
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.dots.length;
      this.loadProperties();
    }, 20000);
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  loadFeaturedPropertyDetails() {
    this.isLoadingFeaProperty = true;
    const data={
      availabilityOptions:'2',
      flag:'6'
    };
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations',data)
        .subscribe(
        (response: any) => {
          console.log('API Response:', response);

          this.FeaturedProperties = response.data.map((property: any) => {
            let propertyImage = 'assets/images/empty.png';
            let defaultPropImage = 'assets/images/empty.png';

            if (property.images && Array.isArray(property.images) && property.images.length > 0) {
              const firstImage = property.images[0];
              if (firstImage.filePath) {
                propertyImage = this.apiurls.getImageUrl(firstImage.filePath);
              }
            }

            else{
              propertyImage='assets/images/empty.png'
            }
            if (property.image && property.image.filePath) {
              defaultPropImage = this.apiurls.getImageUrl(property.image.filePath); 
            }

            let propertyBadge = '';
            let propertyBadgeColor = '';
            switch (property.propertyFor) {
              case '1': propertyBadge = 'For Buy'; propertyBadgeColor = 'green'; break;
              case '2': propertyBadge = 'For Sale'; propertyBadgeColor = 'red'; break;
              case '3': propertyBadge = 'For Rent'; propertyBadgeColor = 'blue'; break;
              case '4': propertyBadge = 'For Lease'; propertyBadgeColor = 'orange'; break;
            }

            let PropertyFacing = '';
            switch (property.propertyFacing) {
              case '1': PropertyFacing = 'North'; break;
              case '2': PropertyFacing = 'South'; break;
              case '3': PropertyFacing = 'East'; break;
              case '4': PropertyFacing = 'West'; break;
              default: PropertyFacing = 'N/A';
            }

            return {
              propertyID: property.propID || 'N/A',
              propertyname: property.propname || 'N/A',
              propertyprice: property.propertyTotalPrice || 'N/A',
              propertyaddress: property.landMark || 'N/A',
              propertyarea: property.totalArea || 'N/A',
              propertybeds: property.noOfBedrooms || 'N/A',
              propertybathrooms: property.noOfBathrooms || 'N/A',
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

          this.isLoadingFeaProperty = false;

          this.loadProperties();

          this.intervalId = setInterval(() => {
            this.loadProperties();
          }, 20000);
        },
        (error) => {
          console.error('Error fetching property details:', error);
          this.FeaturedProperties = [];
          this.isLoadingFeaProperty = false;
        }
      );
  }

  setIframeHtml(iframeContent: string) {
    this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(
        iframeContent.replace(/<iframe /, '<iframe style="width:100%; height:450px;" ')
    );
  }

  scrollToSection1(section: HTMLElement) {
    section.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToSection(section: ElementRef | undefined) {
    setTimeout(() => {
      if (section?.nativeElement) {
        section.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); 
  }

  @ViewChild('descriptionSection') descriptionSection?: ElementRef;
  @ViewChild('specificDescSection') specificDescSection?: ElementRef;
  @ViewChild('videoSection') videoSection?: ElementRef;
  @ViewChild('locationSection') locationSection?: ElementRef;
  @ViewChild('socialSection') socialSection?: ElementRef;
  @ViewChild('amenitiesSection') amenitiesSection?: ElementRef;

  generatePdf() {
    const contentToConvert = this.getDivContent(); 
    this.PdfServiceService.generatePdf(contentToConvert).subscribe(response => {
      const blob = response;
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = 'PropertyEnquiry.pdf';  
      link.click();
    });
  }

  getDivContent(): string {
    const div = document.getElementById('maincontainer');
    if (!div) return '';
    const excludeElements = div.querySelectorAll('.exclude-pdf');
    excludeElements.forEach(el => el.remove());  
    return div.innerHTML; 
  }

  printPage(): void {
    window.print();
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


  private scrolling: boolean = false;  

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const goTopBtn = document.getElementById('goTopBtn');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      goTopBtn?.classList.add('show');
    } else {
      goTopBtn?.classList.remove('show');
    }
  }

  scrollToTop() {
    if (this.scrolling) return; 
    this.scrolling = true;  
    window.scrollTo({ top: 0, behavior: 'auto' });
    setTimeout(() => {
      this.scrolling = false;
    }, 300); 
  }

  isDarkBackground = false;
}
