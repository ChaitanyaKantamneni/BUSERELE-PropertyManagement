import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { ApiServicesService } from '../../../api-services.service';


@Component({
  selector: 'app-userwhichlist',
  standalone: true,
  providers: [ApiServicesService],
  imports: [ReactiveFormsModule,NgFor, HttpClientModule, CommonModule, RouterModule,FormsModule],
  templateUrl: './userwhichlist.component.html',
  styleUrl: './userwhichlist.component.css'
})
export class UserwhichlistComponent {
  constructor(public apiurl:HttpClient,private route: ActivatedRoute,private router:Router,private apiurls: ApiServicesService){}
  propID:string|null='';
  userID=localStorage.getItem('email');
  isLoading: boolean = false;
  NoDataFound:string="";
  EmptyPropertydetails:boolean=true;
  
  
  ngOnInit(): void {
    this.getownProperties(this.userID|| '');
    this.route.paramMap.subscribe(params => {
      this.propID = params.get('propertyID');    
    })
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
  
    const data = {
      Flag: '3',
      userID: UserID
    };
    
  
    this.apiurls.post<any>(`Proc_Tbl_Wishlist`, data)
      .subscribe(
        (response) => {
          const properties = response?.data || [];
  
          if (properties.length > 0) {
            this.EmptyPropertydetails = false;
            console.log('API Response:', properties);
  
            this.propertydetails = properties.map((property: any) => {
              let propertyImage: string = '';
              let defaultPropImage: string = '';
  
              if (property.images && Array.isArray(property.images) && property.images.length > 0) {
                const firstImage = property.images[0];
                if (firstImage.fileData) {
                  try {
                    const byteCharacters = atob(firstImage.fileData);
                    const byteArray = new Uint8Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                      byteArray[i] = byteCharacters.charCodeAt(i);
                    }
                    const blob = new Blob([byteArray], { type: firstImage.mimeType });
                    propertyImage = URL.createObjectURL(blob);
                  } catch (error) {
                    console.error('Error decoding first image data:', error);
                  }
                } else {
                  propertyImage = 'assets/images/empty.png'; 
                }
              } else {
                defaultPropImage = 'assets/images/empty.png'; 
              }
  
              if (property.image && property.image.filePath) {
                try {
                  defaultPropImage = this.apiurls.getImageUrl(property.image.filePath) || 'assets/images/empty.png';
                } catch (error) {
                  console.error('Error generating default image URL:', error);
                }
              } else {
                defaultPropImage = 'assets/images/empty.png';
              }
  
              let propertyBadge = '';
              let propertyBadgeColor = '';
  
              switch (property.propertyFor) {
                case '1': propertyBadge = 'For Buy'; propertyBadgeColor = 'green'; break;
                case '2': propertyBadge = 'For Sell'; propertyBadgeColor = 'red'; break;
                case '3': propertyBadge = 'For Rent'; propertyBadgeColor = 'blue'; break;
                case '4': propertyBadge = 'For Lease'; propertyBadgeColor = 'orange'; break;
                default: propertyBadge = 'N/A'; propertyBadgeColor = 'gray';
              }
  
              let PropertyFacing = 'N/A';
              switch (property.propertyFacing) {
                case '1': PropertyFacing = 'North'; break;
                case '2': PropertyFacing = 'South'; break;
                case '3': PropertyFacing = 'East'; break;
                case '4': PropertyFacing = 'West'; break;
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
                propertyimage: defaultPropImage,
                propertyfor: property.propertyFor || 'N/A',
                propertyparking: property.noOfParkings || 'N/A',
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
  
// getownProperties(UserID: string) {
//   this.isLoading = true;
//   this.apiurls.get<any>(`GetWishlistByUserID/${UserID}`)
//     .subscribe(
//       (response: any[]) => {
//         if (response.length > 0) {
//           this.EmptyPropertydetails = false;
//           console.log('API Response:', response);

//           this.propertydetails = response.map((property: any) => {
//             let propertyImage: string = '';
//             let defaultPropImage: string = '';

//             console.log('Full Property:', property);

//             if (property.images && Array.isArray(property.images) && property.images.length > 0) {
//               console.log('Property Images:', property.images);
//               const firstImage = property.images[0];
//               if (firstImage.fileData) {
//                 console.log('First Image File Data:', firstImage.fileData);
//                 try {
//                   const byteCharacters = atob(firstImage.fileData);
//                   const byteArray = new Uint8Array(byteCharacters.length);
//                   for (let i = 0; i < byteCharacters.length; i++) {
//                     byteArray[i] = byteCharacters.charCodeAt(i);
//                   }
//                   const blob = new Blob([byteArray], { type: firstImage.mimeType });
//                   propertyImage = URL.createObjectURL(blob);
//                   console.log('Generated Image URL:', propertyImage);
//                 } catch (error) {
//                   console.error('Error decoding first image data:', error);
//                 }
//               } else {
//                 propertyImage = 'assets/images/empty.png';
//               }
//             } else {
//               defaultPropImage = 'assets/images/empty.png'; 
//               console.log('Property images are missing or not an array.');
//             }

//             if (property.image && property.image.filePath) {
//               const firstImage = property.image;
//               try {
//                 // defaultPropImage = `https://localhost:7190${property.image.filePath}`;

//                 defaultPropImage=this.apiurls.getImageUrl(property.image.filePath) || 'assets/images/empty.png';

//                 console.log('Generated Default Image URL:', defaultPropImage);
//               } catch (error) {
//                 console.error('Error generating default image URL:', error);
//               }
//             } else {
//               defaultPropImage = 'assets/images/empty.png'; 
//             }

//             let propertyBadge = '';
//             let propertyBadgeColor = '';

//             if (property.propertyFor === '1') {
//               propertyBadge = 'For Buy';
//               propertyBadgeColor = 'green';
//             } else if (property.propertyFor === '2') {
//               propertyBadge = 'For Sell';
//               propertyBadgeColor = 'red';
//             } else if (property.propertyFor === '3') {
//               propertyBadge = 'For Rent';
//               propertyBadgeColor = 'blue';
//             } else if (property.propertyFor === '4') {
//               propertyBadge = 'For Lease';
//               propertyBadgeColor = 'orange';
//             }

//             let PropertyFacing = '';
//             if (property.propertyFacing === '1') {
//               PropertyFacing = 'North';
//             } else if (property.propertyFacing === '2') {
//               PropertyFacing = 'South';
//             } else if (property.propertyFacing === '3') {
//               PropertyFacing = 'East';
//             } else if (property.propertyFacing === '4') {
//               PropertyFacing = 'West';
//             } else {
//               PropertyFacing = 'N/A';
//             }

//             return {
//               propertyID: property.propID || 'N/A',
//               propertyname: property.propname || 'N/A',
//               propertyprice: property.propertyTotalPrice || 'N/A',
//               propertyaddress: property.landMark || 'N/A',
//               propertyarea: property.totalArea || 'N/A',
//               propertybeds: property.noOfBedrooms || 'N/A',
//               propertybathrooms: property.noOfBathrooms || 'N/A',
//               propertytype: property.propertyType || 'N/A',
//               propertyimage: defaultPropImage, 
//               propertyfor: property.propertyFor || 'N/A',
//               propertyparking: property.noOfParkings || 'N/A',
//               PropertyTypeName: property.propertyTypeName,
//               propertyfacing: PropertyFacing,
//               propertyAvailability: propertyBadge,
//               propertyBadgeColor: propertyBadgeColor
//             };
//           });
//           this.isLoading = false;
//         } else {
//           this.EmptyPropertydetails = true;
//           this.NoDataFound = "There are no properties to display at the moment.";
//           this.isLoading = false;
//         }
//       },
//       (error) => {
//         console.error('Error fetching property details:', error);
//         this.EmptyPropertydetails = true;
//         this.NoDataFound = "Error fetching data. Please try again later.";
//         this.isLoading = false;
//       }
//     );
// }

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
  

  // removeHeart(propertyID: number, event: MouseEvent): void {
  //   event.preventDefault(); 
  //   event.stopPropagation();
  
  //   this.isLoading = true;
  //   const propertyIndex = this.propertydetails.findIndex(item => item.propertyID === propertyID);
  
  //   if (propertyIndex !== -1) {
  //     this.propertydetails.splice(propertyIndex, 1);
  
  //     const userID = this.userID;
  
  //     this.apiurls.delete(`RemoveFromWishlist/${userID}/${propertyID}`)
  //       .subscribe(
  //         response => {
  //           console.log(`Successfully removed property ${propertyID} from wishlist`);
  //           if (this.propertydetails.length === 0) {
  //             this.EmptyPropertydetails = true;
  //             this.NoDataFound = "There are no properties in your wishlist.";
  //           }
  //         },
  //         error => {
  //           console.error(`Error removing property ${propertyID}:`, error);
  //         }
  //       );
  //   }
  //   this.isLoading = false;
  // }
  // clearAllWishlist(): void {
  //   this.isLoading = true;
  //   const wishlistItems = this.propertydetails;
  
  //   if (wishlistItems.length === 0) {
  //     this.EmptyPropertydetails = true;
  //     this.NoDataFound = "There are no properties in your wishlist.";
  //     this.isLoading = false;
  //     return;
  //   }
  //   wishlistItems.forEach(item => {
  //     const userID = this.userID;
  //     const propID = item.propertyID;
  
  //      this.apiurls.delete(`RemoveFromWishlist/${userID}/${propID}`)
  //       .subscribe(
  //         response => {
  //           console.log(`Successfully removed property ${propID} from wishlist`);
  //         },
  //         error => {
  //           console.error(`Error removing property ${propID}:`, error);
  //         }
  //       );
  //   });
  //   this.propertydetails = [];
  //   this.EmptyPropertydetails = true;
  //   this.NoDataFound = "There are no properties in your wishlist.";
  //   this.isLoading = false;
  // } 
  
  
  removeHeart(propertyID: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  
    this.isLoading = true;
  
    const propertyIndex = this.propertydetails.findIndex(item => item.propertyID === propertyID);
    if (propertyIndex !== -1) {
      this.propertydetails.splice(propertyIndex, 1);
    }

    const data={
      PropID:propertyID.toString(),
      userID:this.userID,
      flag:'4'
    }
  
    this.apiurls.post('Proc_Tbl_Wishlist', data).subscribe(
      response => {
        console.log(`Successfully removed property ${propertyID} from wishlist`);
        if (this.propertydetails.length === 0) {
          this.EmptyPropertydetails = true;
          this.NoDataFound = "There are no properties in your wishlist.";
        }
        this.isLoading = false;
      },
      error => {
        console.error(`Error removing property ${propertyID}:`, error);
        this.isLoading = false;
      }
    );
  }
  
  clearAllWishlist(): void {
    this.isLoading = true;
  
    const wishlistItems = this.propertydetails;
 
  
    if (wishlistItems.length === 0) {
      this.EmptyPropertydetails = true;
      this.NoDataFound = "There are no properties in your wishlist.";
      this.isLoading = false;
      return;
    }
  
    wishlistItems.forEach(item => {

      const data={
        PropID:item.propertyID.toString(),
        userID:this.userID,
        flag:'4'
      }
  
      this.apiurls.post('Proc_Tbl_Wishlist', data).subscribe(
        response => {
          console.log(`Successfully removed property ${item.propertyID} from wishlist`);
        },
        error => {
          console.error(`Error removing property ${item.propertyID}:`, error);
        }
      );
    });
  
    this.propertydetails = [];
    this.EmptyPropertydetails = true;
    this.NoDataFound = "There are no properties in your wishlist.";
    this.isLoading = false;
  }
  
  isLiked = true;  
}
