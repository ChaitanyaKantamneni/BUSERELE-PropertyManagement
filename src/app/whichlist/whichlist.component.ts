import { CommonModule, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiServicesService } from '../api-services.service';

@Component({
  selector: 'app-whichlist',
  standalone: true,
  providers: [ApiServicesService],
  imports: [ReactiveFormsModule,NgFor, HttpClientModule, CommonModule, RouterModule,FormsModule],
  templateUrl: './whichlist.component.html',
  styleUrl: './whichlist.component.css'
})
export class WhichlistComponent {
  constructor(public apiurl:HttpClient,private route: ActivatedRoute,private apiurls: ApiServicesService){}
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
    this.apiurls.post<any>('Proc_Tbl_Wishlist', data)
      .subscribe(
        (response) => {  
          const properties = response?.data || [];
  
          if (properties.length > 0) {
            this.EmptyPropertydetails = false;
  
            this.propertydetails = properties.map((property: any) => {
              const defaultPropImage = property.image.filePath
                ? this.apiurls.getImageUrl(property.image.filePath)
                : 'assets/images/empty.png';
  
              let propertyBadge = '';
              let propertyBadgeColor = '';
  
              switch (property.propertyFor) {
                case '1':
                  propertyBadge = 'For Buy';
                  propertyBadgeColor = 'green';
                  break;
                case '2':
                  propertyBadge = 'For Sell';
                  propertyBadgeColor = 'red';
                  break;
                case '3':
                  propertyBadge = 'For Rent';
                  propertyBadgeColor = 'blue';
                  break;
                case '4':
                  propertyBadge = 'For Lease';
                  propertyBadgeColor = 'orange';
                  break;
                default:
                  propertyBadge = 'N/A';
                  propertyBadgeColor = 'gray';
              }
  
              let propertyFacing = 'N/A';
              switch (property.propertyFacing) {
                case '1': propertyFacing = 'North'; break;
                case '2': propertyFacing = 'South'; break;
                case '3': propertyFacing = 'East'; break;
                case '4': propertyFacing = 'West'; break;
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
                PropertyTypeName: property.propertyTypeName || 'N/A',
                propertyfacing: propertyFacing,
                propertyAvailability: propertyBadge,
                propertyBadgeColor: propertyBadgeColor
              };
            });
  
          } else {
            this.EmptyPropertydetails = true;
            this.NoDataFound = "There are no properties to display at the moment.";
          }
  
          this.isLoading = false;
        },
        (error) => {
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
        if (this.propertydetails.length === 0) {
          this.EmptyPropertydetails = true;
          this.NoDataFound = "There are no properties in your wishlist.";
        }
        this.isLoading = false;
      },
      error => {
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
        },
        error => {
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
