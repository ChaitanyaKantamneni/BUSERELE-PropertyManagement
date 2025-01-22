import { CommonModule, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-dashboard-view',
  standalone: true,
  imports: [NgFor, HttpClientModule, CommonModule, RouterModule,FormsModule],
  templateUrl: './user-dashboard-view.component.html',
  styleUrl: './user-dashboard-view.component.css'
})
export class UserDashboardViewComponent {
  constructor(public apiurl:HttpClient,private route: ActivatedRoute){}
  propID:string|null='';
  userID=localStorage.getItem('email');
  isLoading: boolean = false;
  NoDataFound:string="";
  EmptyPropertydetails:boolean=false;
  ngOnInit(): void {
    this.getownProperties(this.userID|| '');
    this.route.paramMap.subscribe(params => {
      this.propID = params.get('propertyID');
    })
  }

  propertydetails: any[] = []

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

  getPropertyTypeName(propertyTypeId: string): string {
    const propertyType = this.propertytypes.find(pt => pt.propertyType === propertyTypeId);
    return propertyType ? propertyType.name : '';
  }

  getownProperties(UserID:string) {
    this.isLoading=true;
    this.apiurl.get<any[]>(`https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesByUserID/${UserID}`)
      .subscribe(
        (response: any[]) => {

          if(response.length>0){
            this.EmptyPropertydetails=false;
              console.log('API Response:', response);
              this.propertydetails = response.map((property: any) => {
              let propertyImage: string = '';

    
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
                  propertyBadge = 'For Sell';
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
                propertyimage: defaultPropImage,  // Set the first converted Blob URL or default image URL
                propertyfor:property.propertyFor,
                propertyparking:property.noOfParkings,
                PropertyTypeName:property.propertyTypeName,
                propertyfacing:PropertyFacing,
                propertyAvailability:propertyBadge,
                propertyBadgeColor: propertyBadgeColor
              };
              
            });
            this.isLoading=false;
          }
          else{
            this.EmptyPropertydetails=true;
            this.NoDataFound="There are no properties to display at the moment."
            this.isLoading=false;
          }
          
          
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
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
  
}
