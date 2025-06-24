import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from "../footer/footer.component";
import emailjs from 'emailjs-com';
import { ApiServicesService } from '../../api-services.service';


interface Review {
  reviewID: string;
  Username: string;
  posteddate: string;
  review: string;
  imageurl: string;
}
interface Blog {
  id: number;
  createdDate: string;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  blogStatus: string;
}


interface BlogImage {
  id: any;
  imageUrl: string;
  blogDescription: string;
  name: string;
  date: string;
  formattedDate?: string;
}

@Component({
  selector: 'app-home1',
  standalone: true,
  providers: [ApiServicesService],
  imports: [TopNav1Component, CommonModule, FormsModule,HttpClientModule, RouterModule, FooterComponent,ReactiveFormsModule],
  templateUrl: './home1.component.html',
  styleUrl: './home1.component.css'
})
export class Home1Component implements OnInit,AfterViewInit  {
  propertyType: string | null = null;
  propertyForType:string|null=null;
  keyword: string | null = null;
  selectedPropertyID: string | null = '';
  suggestions: string[] = [];
  selectedPropertyType: string | null = '';
  selectedPropertyFor:string| null='';
  selectedcityName:string | null = '';
  propertydetails: any[] = [];
  FeaturedProperties:any[]=[];
  Reviews:any[]=[];
  expandedblogContent: boolean[] = [];
  propertytypes:any[]=[];
  cities: any[] = [];
  properties: any[] = [];
  CityName:string | null = null;
  propertyFor: string = '';
  isLoadingAdvProperty: boolean = false;
  isLoadingFeaProperty:boolean=false;
  blog: BlogImage | null = null;
  blogId: string | null = null;
  displayedProperties: any[] = [];
  intervalId: any;
  isLoadingFeaProperty1 = false;
  selectedReview: any
  rating: number = 0; 
  stars: number[] = [1, 2, 3, 4, 5]; 
  isUpdateModalOpen: boolean = false;
  propertyInsStatus: string = ''; 
  blogdetails: any[] = [];
  expandedContent: { [key: number]: boolean } = {};
  BlogintervalId: number | null = null; 
  isLiked = false;
  likedProperties: { [key: string]: boolean } = {};
  currentBlogPage = 1;
  BlogitemsPerPage = 3; 
  totalBlogPages = 0;
  currentIndex = 0;
  currentPage = 0;
  blogsPerPage = 4;

  reviews: Review[] = [
    {
      reviewID: '',
      Username: '',
      posteddate: '',
      review: '',
      imageurl: ''
    }
  ];


  constructor( public apiurl:HttpClient,private route: ActivatedRoute,public routes:Router,private router: Router,private cdr: ChangeDetectorRef, private apiurls: ApiServicesService,private fb: FormBuilder){
    emailjs.init('uZT6kwr7RPQM3n5lj');
  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.propertyForType = params.get('propertyFor');
      this.CityName=params.get('CityName');      
      this.keyword = params.get('keyword');

      this.selectedPropertyID=params.get('propID');
      if (this.propertyType) {
        this.selectedPropertyType = this.propertyType;
      }
      if (this.propertyForType) {
        this.selectedPropertyFor = this.propertyForType;
      }
      if (this.CityName) {
        this.selectedcityName = this.CityName;
      }
      if (this.keyword) {
        this.keyword = this.keyword;
      }
      
    });
    this.userEnquiryform = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z\s]+$')]], 
      email: ['', [
        Validators.required,
        Validators.email
      ]], 
      phone: ['', [Validators.pattern('^[0-9]{10}$')]], 
      message: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/\S{10,}/)]], 
    });
    
    this.loadLikedProperties();
    this.loadFeaturedPropertyDetails();
    this.loadPropertyDetails();
    this.getTestimonials();
    this.getPropertTypes();
    this.getUniqueCities();
    this.fetchblogDet();
    this.fetchblogDet();
    setInterval(() => {
      this.changePage();
    }, 20000); 
	  this.route.paramMap.subscribe(params => {
      this.blogId = params.get('id');  

      if (this.blogId) {
       this.fetchblogDet();
      }
    });
    
    if (history.state.selectedReview) {
      this.selectedReview = history.state.selectedReview;
    }
    window.scrollTo(0, 0);
  }

  private getValidParam(param: string | null, defaultValue: string): string | null {
    return param === defaultValue ? null : param;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
    }

    if (this.BlogintervalId !== null) {
      clearInterval(this.BlogintervalId); 
    }

  }

  getPropertTypes(): void {
    const data = {      
      flag: '3'
    };
    this.apiurls.post<any>('Tbl_PropertyType_CRUD_Operations',data) 
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          this.propertytypes = response.data.map((data: any) => ({
            propertyTypeID: data.propertyTypeID,
            name: data.name
          }));
        } else {
          console.error('Unexpected response format or no reviews found');
          this.propertytypes = [];
        }
      }, error => {
        console.error('Error fetching reviews:', error);
      });
  }

  getUniqueCities(): void {
    this.apiurls.get<any>('GetUniqueCities') 
          .subscribe(
        (response: any) => {
          console.log('API response:', response);
          if (response && Array.isArray(response)) {
            this.cities = response.map((cities: string) => ({
              cityID: cities,  
              CityName: cities 
            }));
          } else {
            console.error('Unexpected response format or no cities found');
            this.cities = []; 
          }
        },
        (error) => {
          console.error('Error fetching cities:', error);
        }
      );
  }
  
  getPropertiesByCity(): void {
    if (this.selectedcityName) {
      this.apiurls.get<any[]>(`Property/GetPropertiesByCity/${this.selectedcityName}`)
              .subscribe(
          (response) => {
            this.properties = response; 
            console.log('Properties in selected city:', this.properties);
          },
          (error) => {
            console.error('Error fetching properties:', error);
          }
        );
    }
  }
 
  changePage() {
    this.currentPage++;
    if (this.currentPage * this.blogsPerPage >= this.blogdetails.length) {
      this.currentPage = 0;
    }
  }

  navigateToBlog(blogId: string): void {
    const encodedBlogId = this.encodeID(blogId);
    this.router.navigate([`/viewblog/${encodedBlogId}`]);
  }

  getDisplayedBlogs() {
    const approvedBlogs = this.blogdetails.filter(blog => blog.status === '1'); 
    approvedBlogs.sort((a, b) => new Date(b.BlogCreatedDate).getTime() - new Date(a.BlogCreatedDate).getTime());
    const startIndex = this.currentPage * this.blogsPerPage;
    return approvedBlogs.slice(startIndex, startIndex + this.blogsPerPage);
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
  
  scrollLeftblog() {
    const totalPages = Math.ceil(this.blogdetails.length / this.blogsPerPage);
    if (this.currentPage > 0) {
      this.currentPage--;
    } else {
      this.currentPage = totalPages - 1; 
    }
  }

  scrollRightblog() {
    const totalPages = Math.ceil(this.blogdetails.length / this.blogsPerPage);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
    } else {
      this.currentPage = 0; 
    }
  }

  viewReview(reviewId: string) {
    const encodedReviewId = this.encodeID(reviewId); 
    this.router.navigate(['/view-reviews'], { queryParams: { id: encodedReviewId } }); 
  }

  getTestimonials() {
    const data={
      reviewstatus:'1',
      flag:'2'
    }
    this.apiurls.post<any>('Tbl_Reviews_CRUD_Operations',data)
    .subscribe(
      (response: any) => {        
        this.Reviews = response.data.map((testimonial: any) => {
          console.log('Reviews',testimonial)
          return {
            reviewID: testimonial.reviewID || 'N/A',
            username: testimonial.username || 'N/A',
            posteddate: this.formatDate(testimonial.createdDate) || 'N/A',
            review: testimonial.usermessage || 'N/A',
            // imageurl:  'assets/images/usericon.jpg',
            imageurl: testimonial.profileImage || 'assets/images/usericon.jpg', 

            rating: testimonial.rating || 0,  
          };
        });
      },
      (error) => {
        console.error('Error fetching property details:', error);
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
  
  selectOption(option: string): void {
    this.propertyFor = option;
    console.log(option);
  }

  onKeywordChange() {
    if (this.keyword && this.keyword.length > 2) {
      let endpoint = `GetKeywordSuggestions?keyword=${encodeURIComponent(this.keyword)}`;
      if (this.propertyFor) {
        endpoint += `&propertyFor=${encodeURIComponent(this.propertyFor)}`;
      }
  
      this.apiurls.get<string[]>(endpoint).subscribe(
        (response) => {
          this.suggestions = response;
        },
        (error) => {
          console.error('Error fetching keyword suggestions:', error);
          this.suggestions = [];
        }
      );
    } else {
      this.suggestions = [];
    }
  }
  
  selectSuggestion(suggestion: string) {
    this.keyword = suggestion;
    this.suggestions = [];
  }

  getPropertyTypeName(propertyTypeId: string): string {
    const propertyType = this.propertytypes.find(pt => pt.propertyType === propertyTypeId);
    return propertyType ? propertyType.name : 'Unknown Type';
  }

  loadPropertyDetails() {
    this.isLoadingAdvProperty = true; 
    const data={
      availabilityOptions:'1',
      flag:'6'
    };
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations',data)
    .subscribe(
        (response: any) => {
          console.log('API Response:', response);
  
          this.propertydetails = response.data.map((property: any) => {
            let propertyImage: string = 'assets/images/empty.png'; 
            let defaultPropImage: string = '';
  
            console.log('Full Property:', property);
  
            if (property.propImages && Array.isArray(property.propImages) && property.propImages.length > 0) {
              console.log('Property Images:', property.propImages);
  
              const firstImage = property.propImages[0];
  
              if (firstImage.fileData) {
                console.log('First Image File Data:', firstImage.fileData);
  
                try {
                  const byteCharacters = atob(firstImage.fileData);
                  const byteArray = new Uint8Array(byteCharacters.length);
  
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                  }
  
                  const blob = new Blob([byteArray], { type: firstImage.mimeType });
  
                  propertyImage = URL.createObjectURL(blob);
  
                  console.log('Generated Image URL:', propertyImage);
                } catch (error) {
                  console.error('Error decoding first image data:', error);
                }
              } else {
                propertyImage = 'assets/images/empty.png'; 
              }
            } else {
              defaultPropImage = 'assets/images/empty.png'; 
              console.log('images property is missing, not an array, or empty.');
            }
  
            // if (property.image && property.image.filePath) {
            //   defaultPropImage = `https://localhost:7190${property.image.filePath}`;
            //   console.log('Generated Default Image URL:', defaultPropImage);
            // } 
            if (property.image && property.image.filePath) {
              defaultPropImage = this.apiurls.getImageUrl(property.image.filePath); 
            }
            else {
              defaultPropImage = 'assets/images/empty.png'; 
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
              propertyname: property.propname || 'N/A',
              propertyprice: property.propertyTotalPrice || 'N/A',
              propertyaddress: property.landMark || 'N/A',
              propertyarea: property.totalArea || 'N/A',
              propertybeds: property.noOfBedrooms || 'N/A',
              propertybathrooms: property.noOfBathrooms || 'N/A',
              propertytype: property.propertyType || 'Unknown Type',
              propertyfor: property.propertyFor,
              propertytypeName: this.getPropertyTypeName(property.propertyType),
              propertyimage: propertyImage,
              defaultPropImage: defaultPropImage,
              propertyparking: property.noOfParkings,
              propertyfacing: PropertyFacing,
              propertyAvailability: propertyBadge,
              propertyBadgeColor: propertyBadgeColor,
              PropertyTypeName: property.propertyTypeName
            };
          });
  
          this.isLoadingAdvProperty = false;
        },
        (error) => {
          console.error('Error fetching property details:', error);
          this.propertydetails = [];
          this.isLoadingAdvProperty = false; 
        }
      );
  }

  getSafeValue(value: any, fallback: string = 'N/A'): string {
    return value !== null && value !== undefined && value !== '' ? value.toString() : fallback;
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
            let propertyImage: string = 'assets/images/empty.png'; 
            let defaultPropImage: string = '';
  
            console.log('Full Property:', property);
  
            if (property.propImages && Array.isArray(property.propImages) && property.propImages.length > 0) {
              console.log('Property Images:', property.propImages);
  
              const firstImage = property.propImages[0];
  
              if (firstImage.fileData) {
                console.log('First Image File Data:', firstImage.fileData);
  
                try {
                  const byteCharacters = atob(firstImage.fileData);
                  const byteArray = new Uint8Array(byteCharacters.length);
  
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                  }
  
                  const blob = new Blob([byteArray], { type: firstImage.mimeType });
  
                  propertyImage = URL.createObjectURL(blob);
  
                  console.log('Generated Image URL:', propertyImage);
                } catch (error) {
                  console.error('Error decoding first image data:', error);
                }
              } else {
                propertyImage = 'assets/images/empty.png'; 
              }
            } else {
              defaultPropImage = 'assets/images/empty.png'; 
              console.log('images property is missing, not an array, or empty.');
            }
  
            // if (property.image && property.image.filePath) {
            //   defaultPropImage = `https://localhost:7190${property.image.filePath}`;
            //   console.log('Generated Default Image URL:', defaultPropImage);
            // }
            if (property.image && property.image.filePath) {
              defaultPropImage = this.apiurls.getImageUrl(property.image.filePath); 
            }
             else {
              defaultPropImage = 'assets/images/empty.png'; 
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
              propertyname: property.propname || 'N/A',
              propertyprice: property.propertyTotalPrice || 'N/A',
              propertyaddress: property.landMark || 'N/A',
              propertyarea: property.totalArea || 'N/A',
              propertybeds: property.noOfBedrooms || 'N/A',
              propertybathrooms: property.noOfBathrooms || 'N/A',
              propertytype: property.propertyType || 'Unknown Type',
              propertyfor: property.propertyFor,
              propertytypeName: this.getPropertyTypeName(property.propertyType),
              propertyimage: propertyImage,
              defaultPropImage: defaultPropImage,
              propertyparking: property.noOfParkings,
              propertyfacing: PropertyFacing,
              propertyAvailability: propertyBadge,
              propertyBadgeColor: propertyBadgeColor,
              PropertyTypeName: property.propertyTypeName
            };
          });
  
          this.isLoadingFeaProperty = false;
        },
        (error) => {
          console.error('Error fetching property details:', error);
          this.FeaturedProperties = [];
          this.isLoadingFeaProperty = false; 
        }
      );
  }

  searchclick() {
    const encodedPropertyType = this.selectedPropertyType ? this.encodeID(this.selectedPropertyType) : '';
    const encodedPropertyFor = this.selectedPropertyFor ? this.encodeID(this.selectedPropertyFor) : '';
    const city = this.selectedcityName || '';
    const keyword = this.keyword || 'defaultKeyword';
  
    if (this.selectedPropertyType || this.selectedPropertyFor || this.selectedcityName || this.keyword) {
      this.router.navigate([
        '/search-properties',
        encodedPropertyType,
        encodedPropertyFor,
        city,
        keyword
      ]);
  
      this.propertyInsStatus = 'Search successful!';
      this.isUpdateModalOpen = true;
  
      console.log("encodedPropertyType", encodedPropertyType);
      console.log("encodedPropertyFor", encodedPropertyFor);
      console.log("City", city);
      console.log("Keyword", keyword);
    } else {
      this.propertyInsStatus = 'Please select a property type or property for or city or enter a keyword.';
      this.isUpdateModalOpen = true;
    }
  }

  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }

  handleOk() {
    this.UpdatecloseModal();
    this.userEnquiryform.reset();
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

  ngAfterViewInit() {
    this.autoScroll();
  }

  autoScroll() {
    const container = document.querySelector('.review-content');
    if (container) {
      setInterval(() => {
        container.scrollLeft += 1;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0; 
        }
      }, 50);
    }
  }

  truncateText(text: string, limit: number): string {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  userEnquiryform: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[A-Za-z ]+$/) 
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });
  
  enquiryformsubmit() {
    const data = {
      name: this.userEnquiryform.get('name')?.value.toString(),
      email: this.userEnquiryform.get('email')?.value.toString(),
      phone: this.userEnquiryform.get('phone')?.value.toString(),
      description: this.userEnquiryform.get('message')?.value.toString(),
      flag:'1'
    };
    this.apiurls.post<any>('Tbl_Enquiry_CRUD_Operations', data).subscribe({
      next: (response) => {
        console.log('Enquiry response:', response);
        if(response.statusCode==200){
          this.propertyInsStatus = 'We have received your enquiry. Our team will contact you soon...!';
          this.isUpdateModalOpen = true;
        }
        else{
          this.propertyInsStatus = 'Something went wrong while submitting your enquiry. Please try again later.';
          this.isUpdateModalOpen = true;
        } 
      },
      error: (error) => {
        console.error("Error details:", error);
        this.propertyInsStatus = 'Something went wrong while submitting your enquiry. Please try again later.';
        this.isUpdateModalOpen = true;
        setTimeout(() => {
          this.routes.navigate(['/home']);
        }, 2000);
      },
    });
  }

  loadLikedProperties(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('wishlist_')) {
        const propertyID = key.replace('wishlist_', '');
        this.likedProperties[propertyID] = localStorage.getItem(key) === 'true';
      }
    });
  }

  toggleHeart(event: MouseEvent, propertyID: string): void {
    event.stopPropagation(); 
    if (!localStorage.getItem('email')) {
      this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
    } else {
      const isLiked = !this.likedProperties[propertyID];
      this.likedProperties[propertyID] = isLiked;
      if (isLiked) {
        localStorage.setItem('wishlist_' + propertyID, 'true');
        this.addToWishlist(propertyID);
      } else {
        localStorage.removeItem('wishlist_' + propertyID,);
        this.removeFromWishlist(propertyID);
      }
      this.cdr.detectChanges();
    }
  }

  addToWishlist(propertyID: string): void {
    const wishlistRequest = {
      propID: propertyID,
      userID: localStorage.getItem('email'),
      activatedstatus: '1',
    };

    console.log('Adding to wishlist:', wishlistRequest);
    this.apiurls.post<any>('AddToWishlist', wishlistRequest).subscribe({
      next: (response) => {
        console.log('Added to wishlist:', response);
        this.likedProperties[propertyID] = true;
        localStorage.setItem('wishlist_' + propertyID, 'true');  
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

  removeFromWishlist(propertyID: string): void {
    const wishlistRequest = {
      propID: propertyID,
      userID: localStorage.getItem('email'),
      activatedstatus: '0',
    };

    console.log('Removing from wishlist:', wishlistRequest);

  this.apiurls.post<any>('RemoveFromWishlist', wishlistRequest).subscribe({
    next: (response) => {
      console.log('Removed from wishlist:', response);
      this.likedProperties[propertyID] = false;
        localStorage.removeItem('wishlist_' + propertyID);  
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
      }
    });
  }

  scrollLeft() {
    const scrollContainer = document.querySelector('.scrollable-properties');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' }); 
    }
  }

  scrollRight() {
    const scrollContainer = document.querySelector('.scrollable-properties');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' }); 
    }
  }

  fscrollLeft() {
    const scrollContainer = document.querySelector('.fscrollable-properties');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' }); 
    }
  }

  fscrollRight() {
    const scrollContainer = document.querySelector('.fscrollable-properties');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' }); 
    }
  }

  truncateContent(content: string, limit: number): string {
    if (content.length > limit) {
      return content.substring(0, limit) + '...';
    } else {
      return content;
    }
  }

  stripHtmlTags(content: string): string {
        const div = document.createElement('div');
        div.innerHTML = content;
        return div.textContent || div.innerText || '';
      }

  fetchblogDet() {
    const formData = new FormData();
    formData.append('Flag', '2');

    this.apiurls.post<any>('Proc_Tbl_AddBlogs', formData)
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);
          const approvedBlogs = response.data.filter((blog: Blog) => blog.blogStatus === '1');
          this.blogdetails = approvedBlogs.map((blog: Blog, index: number) => {
            this.expandedblogContent[index] = false;
            const blogImage: string = this.apiurls.getImageUrlblog(blog.filePath || blog.fileName || '');
            return {
              BlogID: blog.id || 'N/A',
              BlogCreatedDate: blog.createdDate
                ? new Date(blog.createdDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown Date',
              BlogTitle: blog.title || 'Unknown Title',
              BlogDescription: blog.description || 'No description available.',
              BlogImage: blogImage,
              status: blog.blogStatus ?? 'N/A',
            };
          });
        },
        (error) => {
          console.error('Error fetching blog details:', error);
          this.blogdetails = [];
        }
      );
  }

  processText(blogDescription: string, index: number): string {
    const strippedText = this.stripHtmlTags(blogDescription).trim(); 

    if (strippedText.length === 0) {
      return '';  
    }

    if (this.expandedContent[index]) {
      return strippedText;  
    } else {
      return this.truncateblogContent(strippedText, 120);  
    }
  }

  truncateblogContent(content: string, limit: number): string {
    if (content.length <= limit) {
      return content; 
    }
    
    return content.substring(0, limit) + '...'; 
  } 

  toggleExpand(index: number): void {
    this.expandedContent[index] = !this.expandedContent[index];
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

}
