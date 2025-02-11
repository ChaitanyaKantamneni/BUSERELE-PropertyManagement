import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  imports: [TopNav1Component, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent,ReactiveFormsModule,NgStyle],
  templateUrl: './home1.component.html',
  styleUrl: './home1.component.css'
})
export class Home1Component implements OnInit,AfterViewInit  {
  propertyType: string | null = null;
  keyword: string | null = '';
  selectedPropertyID: string | null = '';
  suggestions: string[] = [];
  selectedPropertyType: string | null = '';
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
          // Map the response data to the aminities array
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
  propertyFor: string = '';
  isLoadingAdvProperty: boolean = false;
  isLoadingFeaProperty:boolean=false;
  constructor( public apiurl:HttpClient,private route: ActivatedRoute,public routes:Router,private router: Router){
    emailjs.init('uZT6kwr7RPQM3n5lj');
  }
  ngOnInit(): void {
    // this.loadPropertiesCount();
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.keyword = params.get('keyword');
      this.selectedPropertyID=params.get('propID');
      if (this.propertyType) {
        this.selectedPropertyType = this.propertyType;
      }

    });

    this.loadPropertyDetails();
    this.loadFeaturedPropertyDetails();
    this.intervalId = setInterval(() => {
      this.loadProperties();  // Update displayed properties every 30 seconds
    }, 30000);
    this.getTestimonials();
    this.getPropertTypes();

    //blog
    this.fetchblogDet();
    // this.startAutoScroll();
    setInterval(() => {
      this.changePage();
    }, 20000); 
    


    this.route.paramMap.subscribe(params => {
      this.blogId = params.get('id');  // Get the blog ID from route parameters

      if (this.blogId) {
       this.fetchblogDet();
      }
    });
    
  }
  blog: BlogImage | null = null;
  blogId: string | null = null;
 

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Cleanup the interval on destroy
    }

    if (this.BlogintervalId !== null) {
      clearInterval(this.BlogintervalId); // Clean up blog interval on component destroy
    }

  }

  // Method to load properties continuously
  loadProperties(): void {
    const propertiesToDisplay = this.FeaturedProperties.slice(this.currentIndex, this.currentIndex + 3);
    this.displayedProperties = propertiesToDisplay;
    this.currentIndex = (this.currentIndex + 3) % this.FeaturedProperties.length;
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
            imageurl:  'assets/images/usericon.jpg'
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

  selectOptionproperty(event: any): void {
    this.propertyFor = event.target.value;
    console.log(this.propertyFor);
  }
  
  onKeywordChange() {
    if (this.keyword && this.keyword.length > 2) {
      // Construct the URL with the keyword and optionally propertyFor parameter
      let url = `https://localhost:7190/api/Users/GetKeywordSuggestions?keyword=${encodeURIComponent(this.keyword)}`;
  
      // Add the propertyFor parameter if it is defined and not empty
      if (this.propertyFor) {
        url += `&propertyFor=${encodeURIComponent(this.propertyFor)}`;
      }
  
      // Make an HTTP GET request to your API endpoint with the keyword and propertyFor parameters
      this.apiurl.get<string[]>(url).subscribe(
        (response) => {
          // Directly assign the response as suggestions
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
    this.isLoadingAdvProperty=true;
    // const minLoadingTime = 2000;

    // const loadingTimer = setTimeout(() => {
    //   this.isLoadingAdvProperty = false;
    // }, minLoadingTime);
    this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnAdvertisingProperty')
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);
  
          // Map the API response to the propertydetails array
          this.propertydetails = response.map((property: any) => {
            let propertyImage: string = 'assets/images/img1.png'; // Default image if no valid image found
            let defaultPropImage: string = '';
  
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
              defaultPropImage='assets/images/img1.png';
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
            else {
              defaultPropImage='assets/images/img1.png';
              console.log('images property is missing, not an array, or empty.');
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
              defaultPropImage:defaultPropImage,
              propertyparking:property.noOfParkings,
              propertyfacing:PropertyFacing,
              propertyAvailability:propertyBadge,
              propertyBadgeColor: propertyBadgeColor,
              PropertyTypeName:property.propertyTypeName

            };
          });
          // clearTimeout(loadingTimer);
          this.isLoadingAdvProperty=false;
        },
        (error) => {
          console.error('Error fetching property details:', error);
          this.propertydetails=[];
          this.isLoadingAdvProperty=false;
        }
      );
  }

  // loadPropertyDetails() {
  //   this.isLoadingAdvProperty = true;
  
  //   this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesBasedOnAdvertisingProperty')
  //     .subscribe(
  //       (response: any[]) => {
  //         console.log('API Response:', response);
  
  //         this.propertydetails = response.map((property: any) => {
  //           let propertyImage: string = 'assets/images/img1.png'; // Default image if no valid image found
  //           let defaultPropImage: string = 'assets/images/img1.png'; // Default image for fallback
  
  //           // Log the full property object
  //           console.log('Full Property:', property);
  
  //           // Check if 'image' exists and has a Base64 fileData
  //           if (property.image && property.image.fileData) {
  //             const firstImage = property.image;
  
  //             try {
  //               // Decode the Base64 string into raw binary data
  //               const byteCharacters = atob(firstImage.fileData);
  //               const byteArray = new Uint8Array(byteCharacters.length);
  
  //               // Copy the binary data into the byteArray
  //               for (let i = 0; i < byteCharacters.length; i++) {
  //                 byteArray[i] = byteCharacters.charCodeAt(i);
  //               }
  
  //               // Create a Blob from the byteArray
  //               const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Set MIME type to 'image/jpeg' if it's a JPEG image
  
  //               // Create an object URL from the Blob
  //               defaultPropImage = URL.createObjectURL(blob);
  
  //               // Log the URL for verification
  //               console.log('Generated Default Image URL:', defaultPropImage);
  //             } catch (error) {
  //               console.error('Error decoding default image data:', error);
  //             }
  //           }
  
  //           // Return the final object for each property
  //           return {
  //             propertyID: property.propID || 'N/A',
  //             propertyname: property.propname || 'Unknown Property',
  //             propertyprice: property.propertyTotalPrice || 'Price not available',
  //             propertyaddress: property.address || 'Address not available',
  //             propertyarea: property.totalArea || 'Area not available',
  //             propertybeds: property.noOfBedrooms || 'Beds not available',
  //             propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',
  //             propertytype: property.propertyType || 'Unknown Type',
  //             propertytypeName: this.getPropertyTypeName(property.propertyType),
  //             propertyimage: propertyImage,  // Set the first image Blob URL (if available)
  //             defaultPropImage: defaultPropImage,  // Set the default image Blob URL
  //             propertyparking: property.noOfParkings,
  //             propertyfacing: property.propertyFacing,
  //             propertyAvailability: property.propertyFor === '1' ? 'For Buy' : 'For Rent',
  //             propertyBadgeColor: 'green', // Example badge color
  //             PropertyTypeName: property.propertyTypeName
  //           };
  //         });
  
  //         this.isLoadingAdvProperty = false;
  //       },
  //       (error) => {
  //         console.error('Error fetching property details:', error);
  //         this.propertydetails = [];
  //         this.isLoadingAdvProperty = false;
  //       }
  //     );
  // }
  
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


  
  searchclick(){
    if (this.selectedPropertyType && this.keyword) {
      // Navigate if both selected property type and keyword are provided
      this.routes.navigate(['/search-properties', this.selectedPropertyType, this.keyword]);
    } else if (this.selectedPropertyType || this.keyword) {
      // Navigate if at least one is provided
      this.routes.navigate(['/search-properties', this.selectedPropertyType || 'defaultType', this.keyword || 'defaultKeyword']);
    } else {
      alert('Please select a property type or enter a keyword.');
    }
  }

  // convertToCrores(value: number): string {
  //   if (value >= 10000000) {
  //     return (value / 10000000).toFixed(2) + 'Cr';
  //   } else if (value >= 100000) {
  //     return (value / 100000).toFixed(2) + 'L';
  //   } else {
  //     return value.toString();
  //   }
  // }


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
  
  

  ngAfterViewInit() {
    this.autoScroll();
  }

  autoScroll() {
    const container = document.querySelector('.review-content');
    if (container) {
      setInterval(() => {
        container.scrollLeft += 1; // Adjust scroll speed as needed
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0; // Reset scroll to the beginning when it reaches halfway
        }
      }, 50); // Adjust interval for scroll speed
    }
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

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

  // sendEmail() {
  //   // Prepare the template parameters
  //   const templateParams = {
  //     to_name: 'User Name',
  //     from_name: 'Company Name',
  //     message: 'Thank you for your enquiry. We will contact you soon.',
  //     logo_image: 'cid:logo_image' // Reference to the CID in the email template
  //   };

  //   // Send the email
  //   emailjs.send(
  //     'service_hfaods8', // Replace with your service ID
  //     'template_ys6qa7x', // Replace with your template ID
  //     templateParams,
  //     '_6pRgpIB6EGHKI3h0' // Replace with your user ID
  //   ).then(response => {
  //     console.log('Email sent successfully:', response);
  //     alert('Email sent successfully!');
  //   }).catch(error => {
  //     console.error('Error sending email:', error);
  //     alert('Failed to send email. Please try again later.');
  //   });
  // }

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

  scrollLeft() {
    const scrollContainer = document.querySelector('.scrollable-properties');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' }); // Scroll left by 300px
    }
  }

  // Method to scroll right
  scrollRight() {
    const scrollContainer = document.querySelector('.scrollable-properties');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' }); // Scroll right by 300px
    }
  }


  scrollLeftblog() {
    const totalPages = Math.ceil(this.blogdetails.length / this.blogsPerPage);
    if (this.currentPage > 0) {
      this.currentPage--;
    } else {
      this.currentPage = totalPages - 1; // Loop back to the last page
    }
  }
  scrollRightblog() {
    const totalPages = Math.ceil(this.blogdetails.length / this.blogsPerPage);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
    } else {
      this.currentPage = 0; // Loop back to the first page
    }
  }


  displayedProperties: any[] = [];
  currentIndex = 0;
  intervalId: any;
  isLoadingFeaProperty1 = false;



  //blog
  //blogImages: Array<BlogImage> = [];
  blogdetails: any[] = [];
  expandedContent: { [key: number]: boolean } = {};
  currentBlogPage = 1;
  BlogitemsPerPage = 3; // Show 3 blogs at a time
  totalBlogPages = 0;
  BlogintervalId: number | null = null; // Store the interval ID

  truncateContent(content: string, limit: number): string {
    // If the content length is greater than the limit, truncate it and add ellipsis
    if (content.length > limit) {
      return content.substring(0, limit) + '...';
    } else {
      // If the content is shorter or equal to the limit, return it as is
      return content;
    }
  }

  stripHtmlTags(content: string): string {
        const div = document.createElement('div');
        div.innerHTML = content;
        return div.textContent || div.innerText || '';
      }



// fetchblogDet() {
//   this.apiurl.get<any[]>('https://localhost:7190/api/Users/allUploadedBlogs')
//     .subscribe(
//       (response: any[]) => {
//         console.log('API Response:', response);
//         this.blogdetails = response.map((blog: any) => {
//           let blogImage: string = '';  // Declare blogImage here, so it persists across the block

//           console.log('Full blog:', blog);

//           if (blog.fileData && blog.fileData !== '') {
//             try {
//               // Decode the Base64 string into raw binary data
//               const byteCharacters = atob(blog.fileData);
//               const byteArray = new Uint8Array(byteCharacters.length);
//               for (let i = 0; i < byteCharacters.length; i++) {
//                 byteArray[i] = byteCharacters.charCodeAt(i);
//               }
//               // Create a Blob from the byteArray
//               const blob = new Blob([byteArray], { type: 'image/jpeg' });
//               blogImage = URL.createObjectURL(blob);  // Assign the generated image URL to blogImage

//               // Log the URL for verification
//               console.log('Generated blog Image URL:', blogImage);
//             } catch (error) {
//               console.error('Error decoding image data:', error);
//             }
//           } else {
//             // Fallback image when FileData is missing or empty
//             blogImage = 'assets/images/img1.png';
//             console.log('Image data is missing or empty, using fallback image:', blogImage);
//           }

//           return {
//             BlogID: blog.iD || 'N/A',
//             BlogCreatedDate: new Date(blog.createdDate).toLocaleDateString('en-US', {
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric',
//             }),
//             BlogTitle: blog.title || 'Unknown Type',
//             BlogDescription: blog.description,
//             BlogImage: blogImage  // Use the blogImage correctly here
//           };
//         });
//       },
//       (error) => {
//         console.error('Error fetching property details:', error);
//         this.blogdetails = [];
//         this.isLoadingAdvProperty = false;
//       }
//     );
// }


// Your component properties and methods
expandedblogContent: boolean[] = []; // Array to track expanded state for each blog

fetchblogDet() {
  this.apiurl.get<any[]>('https://localhost:7190/api/Users/allUploadedBlogs')
    .subscribe(
      (response: any[]) => {
        console.log('API Response:', response);
        this.blogdetails = response.map((blog: any, index: number) => {
          this.expandedblogContent[index] = false;  // Initially collapse all blog content

          let blogImage: string = '';  // Declare blogImage here

          if (blog.fileData && blog.fileData !== '') {
            try {
              const byteCharacters = atob(blog.fileData);
              const byteArray = new Uint8Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
              }
              const blob = new Blob([byteArray], { type: 'image/jpeg' });
              blogImage = URL.createObjectURL(blob);
            } catch (error) {
              console.error('Error decoding image data:', error);
            }
          } else {
            blogImage = 'assets/images/img1.png';
          }

          return {
            BlogID: blog.id,
            BlogCreatedDate: new Date(blog.createdDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            BlogTitle: blog.title || 'Unknown Type',
            BlogDescription: blog.description,
            BlogImage: blogImage,
          };
        });
      },
      (error) => {
        console.error('Error fetching property details:', error);
        this.blogdetails = [];
        
      }
    );
}

// Function to process text (either truncated or full based on expanded state)
processText(blogDescription: string, index: number): string {
  const strippedText = this.stripHtmlTags(blogDescription).trim();  // Strip HTML tags and remove extra spaces

  if (strippedText.length === 0) {
    return '';  // If description is empty after stripping HTML, return an empty string
  }

  if (this.expandedContent[index]) {
    return strippedText;  // Return full content if expanded
  } else {
    return this.truncateblogContent(strippedText, 120);  // Truncate content if not expanded
  }
}

// Truncate content based on the character limit
truncateblogContent(content: string, limit: number): string {
  if (content.length <= limit) {
    return content;  // Return content as is if it's already shorter than the limit
  }
  
  return content.substring(0, limit) + '...';  // Truncate and add ellipsis
} 

// Toggle expanded content
toggleExpand(index: number): void {
  this.expandedContent[index] = !this.expandedContent[index];
}

toggleExpandblog(index: number, blog: any): void {
  // Navigate to the 'viewblog' route with the blog ID
  this.router.navigate(['/viewblog', blog.id]);
  
  // Toggle the expanded state of the content
  this.expandedContent[index] = !this.expandedContent[index];
}




 viewReview(id: number): void {
    this.router.navigate(['/review', id]);
  }

  navigateToBlog(blogId: string): void {
    // Navigate to the ViewblogComponent with the blog id
    this.router.navigate([`/viewblog/${blogId}`]);
  }
  


getDisplayedBlogs() {
  // Sort blogs by creation date in descending order to get the latest one first
  this.blogdetails.sort((a, b) => new Date(b.BlogCreatedDate).getTime() - new Date(a.BlogCreatedDate).getTime());
  const startIndex = this.currentPage * this.blogsPerPage;
  return this.blogdetails.slice(startIndex, startIndex + this.blogsPerPage);
}

incrementViewCount(blogIndex: number) {
  this.blogdetails[blogIndex].totalViews += 1;
}
 

changePage() {
  this.currentPage++;
  if (this.currentPage * this.blogsPerPage >= this.blogdetails.length) {
    this.currentPage = 0; // Reset the page if we reach the end
  }
}

currentPage = 0;
blogsPerPage = 4;

// fetchblogDet() {
//   this.apiurl.get<any[]>('https://localhost:7190/api/Users/allUploadedBlogs')
//     .subscribe(
//       (response: any[]) => {
//         console.log('API Response:', response);
//         this.blogdetails = response.map((blog: any) => {
//           let blogImage: string = '';
//           console.log('Full blog:', blog);
//           if (blog.fileData && blog.fileData !== '') {
//             try {
//               const byteCharacters = atob(blog.fileData);
//               const byteArray = new Uint8Array(byteCharacters.length);
//               for (let i = 0; i < byteCharacters.length; i++) {
//                 byteArray[i] = byteCharacters.charCodeAt(i);
//               }
//               const blob = new Blob([byteArray], { type: 'image/jpeg' });
//               const blogImage = URL.createObjectURL(blob);
          
//               // Log the URL for verification
//               console.log('Generated blog Image URL:', blogImage);
//             } catch (error) {
//               console.error('Error decoding image data:', error);
//             }
//           } else {
//             // Fallback image when FileData is missing or empty
//             const blogImage = 'assets/images/img1.png';
//             console.log('Image data is missing or empty, using fallback image:', blogImage);
//           }

//           // if (blog.image && blog.image.fileData) {
//           //   const firstImage = blog.image;

//           //   try {
//           //     // Decode the Base64 string into raw binary data
//           //     const byteCharacters = atob(firstImage.fileData);
//           //     const byteArray = new Uint8Array(byteCharacters.length);

//           //     // Copy the binary data into the byteArray
//           //     for (let i = 0; i < byteCharacters.length; i++) {
//           //       byteArray[i] = byteCharacters.charCodeAt(i);
//           //     }

//           //     // Create a Blob from the byteArray
//           //     const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Set MIME type to 'image/jpeg' if it's a JPEG image

//           //     // Create an object URL from the Blob
//           //     blogImage = URL.createObjectURL(blob);

//           //     // Log the URL for verification
//           //     console.log('Generated blog Image URL:', blogImage);
//           //   } catch (error) {
//           //     console.error('Error decoding default image data:', error);
//           //   }
//           // }
//           // else {
//           //   blogImage='assets/images/img1.png';
//           //   console.log('images property is missing, not an array, or empty.');
//           // }
//           return {
//             BlogID: blog.iD || 'N/A',  
//             BlogCreatedDate: new Date(blog.createdDate).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric',
//                       }),
//             BlogTitle: blog.title || 'Unknown Type', 
//             BlogDescription: blog.description,
//             BlogImage: blogImage
//           };
//         });
//       },
//       (error) => {
//         console.error('Error fetching property details:', error);
//         this.propertydetails=[];
//         this.isLoadingAdvProperty=false;
//       }
//     );
// }
  
}
