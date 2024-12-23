import { CommonModule, NgFor } from '@angular/common';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TopNavComponent } from "../top-nav/top-nav.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FormsModule } from '@angular/forms';
interface propertyDet{
  propertyID:string,
  propertyimage:string,
  propertyprice:string,
  propertyname:string,
  propertyaddress:string,
  propertyarea:string,
  propertybeds:string,
  propertybathrooms:string,
  propertytype:string,
  propertytypeName:string,
  propertyfacing:string,
  propertyAvailability:string,
  propertyBadgeColor:string,
  propertyparking:string
}

@Component({
  selector: 'app-search-properties',
  standalone: true,
  imports: [NgFor, HttpClientModule, CommonModule, FooterComponent, RouterModule, TopNav1Component,FormsModule],
  templateUrl: './search-properties.component.html',
  styleUrl: './search-properties.component.css'
})
export class SearchPropertiesComponent implements OnInit {
  propertyType: string | null = null;
  selectedPropertyType:string|null='';
  keyword: string | null = '';
  propID: string | null = '';
  isLoading: boolean = false;
  constructor(public apiurl:HttpClient,private route: ActivatedRoute,public router:Router){}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.keyword = params.get('keyword');
      this.propID = params.get('propertyID');
      // Replace default values with null
      this.propertyType = this.propertyType === 'defaultType' ? null : this.propertyType;
      this.keyword = this.keyword === 'defaultKeyword' ? null : this.keyword;
    });
  
    // Determine the API call based on the values
    if (this.propertyType || this.keyword) {
      this.loadPropertyDetailsByFilters(this.propertyType || '', this.keyword || '');
    } else {
      this.loadPropertyDetails();
    }
  }

  //propertydetails: propertyDet[] = [];
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
    return propertyType ? propertyType.name : 'Unknown Type';
  }

  loadPropertyDetails() {
    this.isLoading=true;
    this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImages')
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);
            this.propertydetails = response.map((property: any) => {
            let propertyImage: string = 'assets/images/img1.png';
  
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
              propertyaddress: property.address || 'Address not available',  // Default value if undefined
              propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
              propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
              propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
              propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
              propertyimage: propertyImage,  // Set the first converted Blob URL or default image URL
              propertyfor:property.propertyFor,
              propertyparking:property.noOfParkings,
              propertytypeName: this.getPropertyTypeName(property.propertyType),
              propertyfacing:PropertyFacing,
              propertyAvailability:propertyBadge,
              propertyBadgeColor: propertyBadgeColor
            };
            
          });
          this.isLoading=false;
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
  }

  loadPropertyDetailsByPropertyType(propertytype:string){

    this.apiurl.get<any[]>(`https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesByPropertyType/${propertytype}`)
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);


          if(Array.isArray(response) && response.length > 0){
            this.propertydetails = response.map((property: any) => {
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
                propertyBadge = 'For Sale';
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
                propertyfor:property.propertyFor,
                propertytypeName: this.getPropertyTypeName(property.propertyType),
                propertyimage: propertyImage,  // Set the first converted Blob URL or default image URL
                propertyparking:property.noOfParkings,
                propertyfacing:PropertyFacing,
                propertyAvailability:propertyBadge,
                propertyBadgeColor: propertyBadgeColor
              };
            });
          }
          else{
            alert("No Properties Available with this Property Type.");
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
  }


  loadPropertyDetailsByFilters(finalPropertyType: string, finalKeyword: string) {
    this.isLoading=true;
    // Replace null/undefined values with empty strings for URL parameters
    finalPropertyType = finalPropertyType ?? '';
    finalKeyword = finalKeyword ?? '';
  
    this.apiurl.get<any[]>(`https://localhost:7190/api/Users/GetPropertiesWithFilters?keyword=${encodeURIComponent(finalKeyword)}&propertyType=${encodeURIComponent(finalPropertyType)}`)
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);
          if(Array.isArray(response) && response.length > 0){
            this.propertydetails = response.map((property: any) => {
              let propertyImage: string = ''; 
              if (property.images && Array.isArray(property.images) && property.images.length > 0) {
                // Process the first image in the array
                const firstImage = property.images[0];
    
                if (firstImage.fileData) {    
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
                propertyBadge = 'For Sale';
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
                propertyimage: propertyImage,  // Set the first converted Blob URL or default image URL
                propertyfor:property.propertyFor,
                propertyparking:property.noOfParkings,
                propertytypeName: this.getPropertyTypeName(property.propertyType),
                propertyfacing:PropertyFacing,
                propertyAvailability:propertyBadge,
                propertyBadgeColor: propertyBadgeColor
              };
              
            });
            this.isLoading=false;
          }
          else{
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


  //EMI Calculation form
  totalAmount: string = "";
  loanTerm: string = "";
  interestRate: string = "";
  emiAmount: string = "";

  calculateEMI(){
    const principal = parseFloat(this.totalAmount);
    const rate = parseFloat(this.interestRate) / 100 / 12; // Monthly interest rate
    const numberOfMonths = parseFloat(this.loanTerm) * 12; // Total number of monthly payments

    if (principal > 0 && this.loanTerm && this.interestRate) {
      // EMI formula
      const emi = (principal * rate * Math.pow(1 + rate, numberOfMonths)) /
                  (Math.pow(1 + rate, numberOfMonths) - 1);
      
      this.emiAmount = emi.toFixed(2);
    } else {
      alert('Please fill in all fields to calculate the EMI.');
    }
  }
}
