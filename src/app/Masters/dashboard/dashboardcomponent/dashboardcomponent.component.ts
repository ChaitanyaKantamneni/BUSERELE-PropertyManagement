import { CommonModule, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiServicesService } from '../../../api-services.service';

@Component({
  selector: 'app-dashboardcomponent',
  standalone: true,
  providers: [ApiServicesService],
  imports: [NgFor, HttpClientModule, CommonModule, RouterModule,FormsModule],
  templateUrl: './dashboardcomponent.component.html',
  styleUrl: './dashboardcomponent.component.css'
})
export class DashboardcomponentComponent implements OnInit {
  propID:string|null='';
  userID=localStorage.getItem('email');
  isLoading: boolean = false;
  NoDataFound: string="";
  EmptyPropertydetails: boolean = true;

  propertydetails: any[] = []

  
  constructor(public apiurl:HttpClient,private route: ActivatedRoute,public router : Router,private apiurls: ApiServicesService){}
  
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const encodedID = params.get('propertyID');
  
      if (encodedID) {
        try {
          this.propID = atob(encodedID);
          this.getownProperties(this.userID || '');
        } catch (e) {
          alert('Invalid Property ID');
          this.router.navigate(['/home']);
        }
      } else {
        this.getownProperties(this.userID || '');
      }
    });
  }
  

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

  getownProperties(UserID:string) {
    this.isLoading = true;
  
    const data = {
      userID: UserID,
      Flag: '4'
    };
  
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations', data)
      .subscribe(
        (response) => {
          if (response && response.statusCode === 200 && Array.isArray(response.data) && response.data.length > 0) {
            this.EmptyPropertydetails = false;
            this.propertydetails = response.data.map((property: any) => {
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
                  }
                } else {
                  propertyImage='assets/images/empty.png';
                }

              } else {
                defaultPropImage='assets/images/empty.png';
              }
  
              if (property.image && property.image.filePath) {
                const firstImage = property.image;
    
                try {
                  defaultPropImage=this.apiurls.getImageUrl(property.image.filePath) || 'assets/images/empty.png';
                } catch (error) {
                }
              }
              else {
                defaultPropImage='assets/images/empty.png';
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
                propertyfor:property.propertyFor || 'N/A',
                propertyparking:property.noOfParkings || 'N/A',
                PropertyTypeName:property.propertyTypeName,
                propertyfacing:PropertyFacing,
                propertyAvailability:propertyBadge,
                propertyBadgeColor: propertyBadgeColor
              };
              
            });
            
            // this.isLoading=false;
          }
          else{
            this.EmptyPropertydetails=true;
            this.NoDataFound="There are no properties to display at the moment."
          }
          this.isLoading=false;

          
        },
        (error) => {
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

}
