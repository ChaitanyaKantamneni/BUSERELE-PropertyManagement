import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from "../footer/footer.component";
import emailjs from 'emailjs-com';

interface Review {
  reviewID: string;
  Username: string;
  posteddate: string;
  review: string;
  imageurl: string;
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
  imports: [TopNav1Component, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent,ReactiveFormsModule],
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
  reviews: Review[] = [
    {
      reviewID: '',
      Username: '',
      posteddate: '',
      review: '',
      imageurl: ''
      
    }
  ];
  
  // propertytypes:any[]=[{
  //   icon:'',
  //   name:'',
  //   propertyType:'',
  //   propertiesCount:''
  // }
  // ]

  propertytypes:any[]=[];

  getPropertTypes(): void {
    this.apiurl.get('https://localhost:7190/api/Users/GetAllPropertyTypes')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          this.propertytypes = response.data.map((data: any) => ({
            propertyTypeID: data.propertyTypeID,
            name: data.name,
            description: data.description
          }));
        } else {
          console.error('Unexpected response format or no reviews found');
          this.propertytypes = [];
        }
      }, error => {
        console.error('Error fetching reviews:', error);
      });
  }


  cities: any[] = [];
  // selectedcityName: string | null = null;
  properties: any[] = [];
  
  getUniqueCities(): void {
    this.apiurl.get<string[]>('https://localhost:7190/api/Users/GetUniqueCities')
      .subscribe(
        (response: any) => {
          console.log('API response:', response);
          if (response && Array.isArray(response)) {
            this.cities = response.map((cityName: string) => ({
              cityID: cityName,  
              CityName: cityName  
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
      this.apiurl.get<any[]>(`https://localhost:7190/api/Property/GetPropertiesByCity/${this.selectedcityName}`)
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

  CityName:string | null = null;
  propertyFor: string = '';
  isLoadingAdvProperty: boolean = false;
  isLoadingFeaProperty:boolean=false;
  constructor( public apiurl:HttpClient,private route: ActivatedRoute,public routes:Router,private router: Router,private cdr: ChangeDetectorRef,private fb: FormBuilder){
    emailjs.init('uZT6kwr7RPQM3n5lj');
  }
  ngOnInit(): void {
    // this.loadPropertiesCount();
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.propertyForType = params.get('propertyFor');
      this.CityName=params.get('CityName');
      console.log("city home",this.CityName);
      this.keyword = params.get('keyword');
      this.selectedPropertyID=params.get('propID');
      if (this.propertyType) {
        this.selectedPropertyType = this.propertyType;
      }
      if (this.propertyForType) {
        this.selectedPropertyFor = this.propertyForType;
      }
      if (this.keyword) {
        this.keyword = this.keyword;
      }
      if (this.CityName) {
        this.selectedcityName = this.CityName;
      }
      
    });

    // this.userEnquiryform = this.fb.group({
    //   name: ['', [Validators.required, Validators.minLength(3)]],  
    //   email: ['', [Validators.required, Validators.email]],  
    //   phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],  
    //   message: ['', [Validators.required, Validators.minLength(10)]],  
    // });

    this.userEnquiryform = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z\s]+$')]], 
      email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]], 
      // email: new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]),
      phone: ['', [Validators.pattern('^[0-9]{10}$')]], 
      message: ['', [Validators.required, Validators.minLength(10)]], 
    });

    this.loadLikedProperties();
    this.loadFeaturedPropertyDetails();
    this.loadPropertyDetails();
    
    // this.intervalId = setInterval(() => {
    //   this.loadProperties();  
    // }, 30000);

    // this.loadFeaturedPropertyDetails();
    // this.loadProperties(); 
    // this.intervalId = setInterval(() => {
    //   this.loadProperties();  
    // }, 1000);


    this.getTestimonials();
    this.getPropertTypes();
    //this.loadCities(); 
    this.getUniqueCities();

  
    this.fetchblogDet();
    // this.startAutoScroll();

    
    this.fetchblogDet();
    // this.startAutoScroll();
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

  blog: BlogImage | null = null;
  blogId: string | null = null;
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
    }

    if (this.BlogintervalId !== null) {
      clearInterval(this.BlogintervalId); 
    }

  }

  changePage() {
    this.currentPage++;
    if (this.currentPage * this.blogsPerPage >= this.blogdetails.length) {
      this.currentPage = 0;
    }
  }



  

  navigateToBlog(blogId: string): void {
    this.router.navigate([`/viewblog/${blogId}`]);
    
  }
  
  // loadCities() {
  //   this.apiurl.get<any[]>('https://localhost:7190/api/Users/byCity').subscribe(data => {
  //     this.cities = data;
  //   });
  // }

getDisplayedBlogs() {
  this.blogdetails.sort((a, b) => new Date(b.BlogCreatedDate).getTime() - new Date(a.BlogCreatedDate).getTime());
  const startIndex = this.currentPage * this.blogsPerPage;
  return this.blogdetails.slice(startIndex, startIndex + this.blogsPerPage);
}

currentPage = 0;
blogsPerPage = 4;
 
displayedProperties: any[] = [];
currentIndex = 0;
intervalId: any;
isLoadingFeaProperty1 = false;


// loadProperties(): void {
//   if (this.FeaturedProperties.length === 0) return;
//   const propertiesToDisplay = this.FeaturedProperties.slice(this.currentIndex, this.currentIndex + 4);
//   if (propertiesToDisplay.length < 4) {
//     propertiesToDisplay.push(...this.FeaturedProperties.slice(0, 4 - propertiesToDisplay.length));
//   }

//   this.displayedProperties = propertiesToDisplay;
//   this.currentIndex = (this.currentIndex + 4) % this.FeaturedProperties.length;
// }


  
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
  
  // OnlyAlphabetsAndSpacesAllowed(event: { which: any; keyCode: any; }): boolean {
  //   const charCode = event.which ? event.which : event.keyCode;
  
  //   if (charCode !== 32 && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
  //     console.log('Restricted keyCode: ' + charCode);
  //     return false; 
  //   }
    
  //   return true; 
  // }
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


  
  selectedReview: any
  openReview(review: any): void {
    this.selectedReview = review;
    this.router.navigate(['/view-reviews'], { state: { selectedReview: this.selectedReview, remainingReviews: this.Reviews.filter(r => r !== review) } });
  }

  
  

  
 
 rating: number = 0; 
 stars: number[] = [1, 2, 3, 4, 5]; 

 viewReview(reviewId: string) {
  this.router.navigate(['/view-reviews'], { queryParams: { id: reviewId } });
 }

  
 
  getTestimonials() {
    this.apiurl.get<Review[]>("https://localhost:7190/api/Users/GetUserReviewsStatus1")
    .subscribe(
      (response: any) => {
        
        this.Reviews = response.data.map((testimonial: any) => {

          return {
            reviewID: testimonial.id || 'N/A',
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
      let url = `https://localhost:7190/api/Users/GetKeywordSuggestions?keyword=${encodeURIComponent(this.keyword)}`;
  
      if (this.propertyFor) {
        url += `&propertyFor=${encodeURIComponent(this.propertyFor)}`;
      }
      this.apiurl.get<string[]>(url).subscribe(
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
    this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnAdvertisingProperty')
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);
  
          this.propertydetails = response.map((property: any) => {
            let propertyImage: string = 'assets/images/img2.jpg'; 
            let defaultPropImage: string = '';
  
            console.log('Full Property:', property);
  
            if (property.images && Array.isArray(property.images) && property.images.length > 0) {
              console.log('Property Images:', property.images);
  
              const firstImage = property.images[0];
  
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
                propertyImage = 'assets/images/img2.jpg'; 
              }
            } else {
              defaultPropImage = 'assets/images/img2.jpg'; 
              console.log('images property is missing, not an array, or empty.');
            }
  
            if (property.image && property.image.filePath) {
              defaultPropImage = `https://localhost:7190${property.image.filePath}`;
              console.log('Generated Default Image URL:', defaultPropImage);
            } else {
              defaultPropImage = 'assets/images/img2.jpg'; 
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


  loadFeaturedPropertyDetails() {
    this.isLoadingFeaProperty = true; 
    this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnFeaturedProperty')
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);
  
          this.FeaturedProperties = response.map((property: any) => {
            let propertyImage: string = 'assets/images/img2.jpg'; 
            let defaultPropImage: string = '';
  
            console.log('Full Property:', property);
  
            if (property.images && Array.isArray(property.images) && property.images.length > 0) {
              console.log('Property Images:', property.images);
  
              const firstImage = property.images[0];
  
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
                propertyImage = 'assets/images/img2.jpg'; 
              }
            } else {
              defaultPropImage = 'assets/images/img2.jpg'; 
              console.log('images property is missing, not an array, or empty.');
            }
  
            if (property.image && property.image.filePath) {
              defaultPropImage = `https://localhost:7190${property.image.filePath}`;
              console.log('Generated Default Image URL:', defaultPropImage);
            } else {
              defaultPropImage = 'assets/images/img2.jpg'; 
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

  // loadFeaturedPropertyDetails() {
  //   this.isLoadingFeaProperty = true;
  
  //   this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnFeaturedProperty')
  //     .subscribe(
  //       (response: any[]) => {
  //         console.log('API Response:', response);
  
  //         this.FeaturedProperties = response.map((property: any) => {
  //           let propertyImage = 'assets/images/img1.png';
  //           let defaultPropImage = 'assets/images/img1.png';
  
  //           if (property.images && Array.isArray(property.images) && property.images.length > 0) {
  //             const firstImage = property.images[0];
  //             if (firstImage.filePath) {
  //               propertyImage = `https://localhost:7190${firstImage.filePath}`;
  //             }
  //           }
  
  //           if (property.image && property.image.filePath) {
  //             defaultPropImage = `https://localhost:7190${property.image.filePath}`;
  //           }
  
  //           let propertyBadge = '';
  //           let propertyBadgeColor = '';
  //           switch (property.propertyFor) {
  //             case '1': propertyBadge = 'For Buy'; propertyBadgeColor = 'green'; break;
  //             case '2': propertyBadge = 'For Sale'; propertyBadgeColor = 'red'; break;
  //             case '3': propertyBadge = 'For Rent'; propertyBadgeColor = 'blue'; break;
  //             case '4': propertyBadge = 'For Lease'; propertyBadgeColor = 'orange'; break;
  //           }
  
  //           let PropertyFacing = '';
  //           switch (property.propertyFacing) {
  //             case '1': PropertyFacing = 'North'; break;
  //             case '2': PropertyFacing = 'South'; break;
  //             case '3': PropertyFacing = 'East'; break;
  //             case '4': PropertyFacing = 'West'; break;
  //             default: PropertyFacing = 'N/A';
  //           }
  
  //           return {
  //             propertyID: property.propID || 'N/A',
  //             propertyname: property.propname || 'Unknown Property',
  //             propertyprice: property.propertyTotalPrice || 'Price not available',
  //             propertyaddress: property.landMark || 'Address not available',
  //             propertyarea: property.totalArea || 'Area not available',
  //             propertybeds: property.noOfBedrooms || 'Beds not available',
  //             propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',
  //             propertytype: property.propertyType || 'Unknown Type',
  //             propertytypeName: this.getPropertyTypeName(property.propertyType),
  //             propertyimage: propertyImage,
  //             defaultPropImage: defaultPropImage,
  //             propertyparking: property.noOfParkings,
  //             propertyfacing: PropertyFacing,
  //             propertyAvailability: propertyBadge,
  //             propertyBadgeColor: propertyBadgeColor,
  //             propertyNearBy: property.nearBy
  //           };
  //         });
  
  //         this.isLoadingFeaProperty = false;
  
  //         this.loadProperties();
  
  //         this.intervalId = setInterval(() => {
  //           this.loadProperties();
  //         }, 20000);
  //       },
  //       (error) => {
  //         console.error('Error fetching property details:', error);
  //         this.FeaturedProperties = [];
  //         this.isLoadingFeaProperty = false;
  //       }
  //     );
  // }

  isUpdateModalOpen: boolean = false;
  propertyInsStatus: string = ''; 


  searchclick() {
    if (this.selectedPropertyType && this.selectedPropertyFor && this.selectedcityName && this.keyword) {
      this.routes.navigate(['/search-properties', this.selectedPropertyType, this.selectedPropertyFor,this.selectedcityName, this.keyword]);
      this.propertyInsStatus = 'Search successful!'; 
      this.isUpdateModalOpen = true; 
      console.log("selectedPropertyType h2",this.selectedPropertyType);
    console.log("selectedPropertyFor h2",this.selectedPropertyFor);
    console.log("selectedcityName h2",this.selectedcityName);
    console.log("keyword h2",this.keyword);
    } else if (this.selectedPropertyType || this.keyword || this.selectedPropertyFor || this.selectedcityName) { 
      this.routes.navigate(['/search-properties', this.selectedPropertyType || 'defaultType', this.selectedPropertyFor || 'defaultFor',this.selectedcityName, this.keyword || 'defaultKeyword']);
      this.propertyInsStatus = 'Search successful with default parameters!';
      this.isUpdateModalOpen = true; 
    console.log("selectedPropertyType h1",this.selectedPropertyType);
    console.log("selectedPropertyFor h1",this.selectedPropertyFor);
    console.log("selectedcityName h1",this.selectedcityName);
    console.log("keyword h1",this.keyword);
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

  // truncateText(text: string, length: number): string {
  //   if (!text) return '';
  //   return text.length > length ? text.substring(0, length) + '...' : text;
  // }


  truncateText(text: string, limit: number): string {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
  userEnquiryform:FormGroup=new FormGroup({
    name:new FormControl(''),
    email:new FormControl(''),
    phone:new FormControl(''),
    message:new FormControl('')
  })
  
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
  //       this.routes.navigate(['/home']);
  //       // this.sendEmail();
  //     },
  //     error: (error) => {
  //       console.error("Error details:", error);
  //       alert('Failed to submit enquiry. Try again later...!');
  //       this.routes.navigate(['/home']);
  //     },
  //     complete: () => {
  //       console.log("Request completed");
  //     }
  //   });
  // }
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
        this.propertyInsStatus = 'We have received your enquiry. Our team will contact you soon...!';
        this.isUpdateModalOpen = true;
        // setTimeout(() => {
        //   this.routes.navigate(['/home']);
        // }, 2000);
      },
      error: (error) => {
        console.error("Error details:", error);
        this.propertyInsStatus = 'Failed to submit enquiry. Try again later...!';
        this.isUpdateModalOpen = true;
        setTimeout(() => {
          this.routes.navigate(['/home']);
        }, 2000);
      },
      complete: () => {
        console.log("Request completed");
      }
    });
  }

  isLiked = false;

  likedProperties: { [key: string]: boolean } = {};
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
        localStorage.removeItem('wishlist_' + propertyID);
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

    this.apiurl.post('https://localhost:7190/api/Users/AddToWishlist', wishlistRequest, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
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

    this.apiurl.post('https://localhost:7190/api/Users/RemoveFromWishlist', wishlistRequest, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        console.log('Removed from wishlist:', response);
        this.likedProperties[propertyID] = false;  
        localStorage.removeItem('wishlist_' + propertyID);  
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
      }
    });
  }
  

  sendEmail() {
    const templateParams = {
      to_name: this.userEnquiryform.get('name')?.value, 
      to_email: this.userEnquiryform.get('email')?.value,
      from_name: 'BUSERELE Property Management',
      message: 'Thank you for your enquiry. We will contact you soon.',
    };

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
  //blog
  //blogImages: Array<BlogImage> = [];
  blogdetails: any[] = [];
  expandedContent: { [key: number]: boolean } = {};
  currentBlogPage = 1;
  BlogitemsPerPage = 3; 
  totalBlogPages = 0;
  BlogintervalId: number | null = null; 

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

expandedblogContent: boolean[] = []; 

fetchblogDet() {
  this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllBlogDetails')
    .subscribe(
      (response: any[]) => {
        console.log('API Response:', response);
        this.blogdetails = response.map((blog: any, index: number) => {
          this.expandedblogContent[index] = false;  

          let blogImage: string = ''; 

          if (blog.imageUrl && blog.imageUrl !== '') {
            blogImage = `https://localhost:7190${blog.imageUrl}`; 
          } else {
            blogImage = 'assets/images/img2.jpg'; 
          }

          return {
            BlogID: blog.id || 'N/A',
            BlogCreatedDate: new Date(blog.createdDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            BlogTitle: blog.title || 'Unknown Type',
            BlogDescription: blog.description || 'No description available.',
            BlogImage: blogImage,  
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

}
