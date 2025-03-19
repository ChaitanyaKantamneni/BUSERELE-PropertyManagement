import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';


@Component({
  selector: 'app-userwhichlist',
  standalone: true,
  imports: [ReactiveFormsModule,NgFor, HttpClientModule, CommonModule, RouterModule,FormsModule],
  templateUrl: './userwhichlist.component.html',
  styleUrl: './userwhichlist.component.css'
})
export class UserwhichlistComponent {
  constructor(public apiurl:HttpClient,private route: ActivatedRoute,private router:Router){}
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
  // ngOnInit(): void {
  //   this.getownProperties(this.userID || '');
  
  //   this.route.paramMap.subscribe(params => {
  //     console.log("🔍 Full Route Params:", params);
  
  //     const encryptedPropID = params.get('propertyID');
  //     console.log("🔹 Encrypted Property ID from URL:", encryptedPropID);
  
  //     if (encryptedPropID) {
  //       this.propID = this.decryptID(encryptedPropID);
  //       console.log("✅ Decrypted Property ID:", this.propID);
  
  //       // Fetch property details after successful decryption
  //       if (this.propID) {
  //         this.getownProperties(this.propID);
  //       } else {
  //         console.error("❌ Decryption failed or resulted in an empty property ID.");
  //       }
  //     } else {
  //       console.error("❌ Encrypted Property ID is null. Check routerLink.");
  //     }
  //   });
  // }
  
  // decryptID(encryptedPropID: string): string {
  //   try {
  //     return atob(encryptedPropID).trim();  // Ensure correct decryption
  //   } catch (error) {
  //     console.error("❌ Error decrypting property ID:", error);
  //     return '';
  //   }
  // }
  
  // encryptID(propertyID: string): string {
  //   return btoa(propertyID);
  // }
  



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

getownProperties(UserID: string) {
  this.isLoading = true;
  this.apiurl.get<any[]>(`https://localhost:7190/api/Users/GetWishlistByUserID/${UserID}`)
    .subscribe(
      (response: any[]) => {
        if (response.length > 0) {
          this.EmptyPropertydetails = false;
          console.log('API Response:', response);

          this.propertydetails = response.map((property: any) => {
            let propertyImage: string = '';
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
                propertyImage = 'assets/images/img1.png';
              }
            } else {
              defaultPropImage = 'assets/images/img1.png'; 
              console.log('Property images are missing or not an array.');
            }

            if (property.image && property.image.filePath) {
              const firstImage = property.image;
              try {
                defaultPropImage = `https://localhost:7190${property.image.filePath}`;
                console.log('Generated Default Image URL:', defaultPropImage);
              } catch (error) {
                console.error('Error generating default image URL:', error);
              }
            } else {
              defaultPropImage = 'assets/images/img1.png'; 
            }

            let propertyBadge = '';
            let propertyBadgeColor = '';

            if (property.propertyFor === '1') {
              propertyBadge = 'For Buy';
              propertyBadgeColor = 'green';
            } else if (property.propertyFor === '2') {
              propertyBadge = 'For Sell';
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
              propertyimage: defaultPropImage, 
              propertyfor: property.propertyFor,
              propertyparking: property.noOfParkings,
              PropertyTypeName: property.propertyTypeName,
              propertyfacing: PropertyFacing,
              propertyAvailability: propertyBadge,
              propertyBadgeColor: propertyBadgeColor
            };
          });
          this.isLoading = false;
        } else {
          this.EmptyPropertydetails = true;
          this.NoDataFound = "There are no properties to display at the moment.";
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('Error fetching property details:', error);
        this.EmptyPropertydetails = true;
        this.NoDataFound = "Error fetching data. Please try again later.";
        this.isLoading = false;
      }
    );
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
  


  clearWhichlist(): void {
    this.isLoading = true;

    const wishlistItems = this.propertydetails;

    if (wishlistItems.length === 0) {
      this.EmptyPropertydetails = true;
      this.NoDataFound = "There are no properties in your wishlist.";
      this.isLoading = false;
      return;
    }

    wishlistItems.forEach(item => {
      const userID = this.userID;
      const propID = item.propertyID;

      this.apiurl.delete(`https://localhost:7190/api/Users/RemoveFromWishlist/${userID}/${propID}`)
        .subscribe(
          response => {
            console.log(`Successfully removed property ${propID} from wishlist`);
          },
          error => {
            console.error(`Error removing property ${propID}:`, error);
          }
        );
    });

    this.propertydetails = [];  
    this.EmptyPropertydetails = true; 
    this.NoDataFound = "There are no properties in your wishlist.";  

    this.isLoading = false;
  }


}
