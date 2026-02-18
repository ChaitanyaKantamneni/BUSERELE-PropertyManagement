import { CommonModule, NgFor } from '@angular/common';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TopNavComponent } from "../top-nav/top-nav.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs';
import { ApiServicesService } from '../../api-services.service';
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
  providers: [ApiServicesService],
  imports: [NgFor, HttpClientModule, CommonModule, FooterComponent, RouterModule, TopNav1Component,FormsModule],
  templateUrl: './search-properties.component.html',
  styleUrl: './search-properties.component.css'
})
export class SearchPropertiesComponent implements OnInit {
  selectedPropertyType: string | null = '';
  selectedPropertyFor: string | null = '';
  propID: string | null = '';
  isLoading: boolean = false;
  CityName: string | null = null;
  propertyType: string | null = null;
  propertyFor: string | null = null;
  keyword: string | null = '';
  selectedcityName: string | null = '';
  propertyAvailabilityOptions: string | null = '';
  propertydetails: any[] = [];

  constructor(public apiurl:HttpClient,private route: ActivatedRoute,public router:Router,private apiurls: ApiServicesService){}
  
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      const encodedAvailability = params.get('propertyAvailabilityOptions');
      const encodedType = params.get('propertyType');
      const encodedFor = params.get('propertyFor');

      this.propertyAvailabilityOptions = encodedAvailability ? this.decodeID(encodedAvailability) : null;
      this.propertyType = encodedType ? this.getValidParam(this.decodeID(encodedType), 'defaultType') : null;
      this.propertyFor = encodedFor ? this.getValidParam(this.decodeID(encodedFor), 'defaultFor') : null;

      this.keyword = this.getValidParam(params.get('keyword'), 'defaultKeyword');
      this.CityName = this.getValidParam(params.get('CityName'), 'defaultCity');

      console.log("Decoded Filters =>", {
        propertyAvailabilityOptions: this.propertyAvailabilityOptions,
        propertyType: this.propertyType,
        propertyFor: this.propertyFor,
        CityName: this.CityName,
        keyword: this.keyword
      });

      if (this.propertyAvailabilityOptions) {
        this.loadPropertyDetailsByPropertyAvailabilityOptions(this.propertyAvailabilityOptions);
      } else if (this.propertyType || this.propertyFor || this.CityName || this.keyword) {
        this.loadPropertyDetailsByFilters(
          this.propertyType || '',
          this.propertyFor || '',
          this.CityName || '',
          this.keyword || ''
        );
      } else {
        this.loadPropertyDetails(); 
      }
    });
  }
  
  private getValidParam(param: string | null, defaultValue: string): string | null {
    return param === defaultValue ? null : param;
  }

  private unsubscribe$ = new Subject<void>(); 
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    return propertyType ? propertyType.name : 'Unknown Type';
  }
  
  loadPropertyDetails() {
    this.isLoading=true;
    this.apiurls.get<any>('GetAllPropertyDetailsWithImages')
          .subscribe(
        (response: any[]) => {
          this.propertydetails = response.map((property: any) => {
            let propertyImage: string = 'assets/images/empty.png'; 
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
                defaultPropImage = this.apiurls.getImageUrl(property.image.filePath); 
              } 
            
              catch (error) {
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
          this.isLoading=false;
        },
        (error) => {
        }
      );

  }

  loadPropertyDetailsByPropertyType(propertytype:string){
    this.apiurls.get<any[]>(`GetAllPropertyDetailsWithImagesByPropertyType/${propertytype}`)
      .subscribe(
        (response: any[]) => {
          if(Array.isArray(response) && response.length > 0){
            this.propertydetails = response.map((property: any) => {
              let propertyImage: string = ''; 
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
              return {
                propertyID: property.propID || 'N/A', 
                propertyname: property.propname || 'Unknown Property', 
                propertyprice: property.propertyTotalPrice || 'Price not available',  
                propertyaddress: property.address || 'Address not available',  
                propertyarea: property.totalArea || 'Area not available',  
                propertybeds: property.noOfBedrooms || 'Beds not available',  
                propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  
                propertytype: property.propertyType || 'Unknown Type',  
                propertyfor:property.propertyFor,
                propertytypeName: this.getPropertyTypeName(property.propertyType),
                propertyimage: propertyImage,  
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
        }
      );
  }

  loadPropertyDetailsByFilters(finalPropertyType: string, finalPropertyFor: string, finalCityName: string, finalKeyword: string) {
    this.isLoading = true;
    const data = {
          cityName: finalCityName ?? '',
          propertyType: finalPropertyType ?? '',
          propertyFor: finalPropertyFor ?? '',
          keyWord: finalKeyword ?? '',
          flag: '7'
        };

    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations',data)
      .subscribe(
        (response: any) => {
          if (response.data.length > 0) {
            this.propertydetails = response.data.map((property: any) => {
              let propertyImage: string = 'assets/images/empty.png';  
              let defaultPropImage: string = '';
              if (property.propImages && Array.isArray(property.propImages) && property.propImages.length > 0) {  
                const firstImage = property.propImages[0];
  
                if (firstImage.filePath) {
                  propertyImage = this.apiurls.getImageUrl(firstImage.filePath); 
                }

              } else {
              }
  
              if (property.image && property.image.filePath) {
                defaultPropImage = this.apiurls.getImageUrl(property.image.filePath); 

              } else {
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
                propertyaddress: property.address || 'N/A',  
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
                PropertyTypeName: property.propertyTypeName,
                selectedcityName:property.CityName
              };
            });
            this.isLoading = false;
          } else {
            alert("No properties match the applied filters. Please adjust your criteria and try again.");
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          alert("No properties match the applied filters. Please adjust your criteria and try again.");
          this.router.navigate(['/home']);
        }
      );
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

  loadPropertyDetailsByPropertyAvailabilityOptions(finalPropertyAvialabilityOptions: string) {
    this.isLoading = true;
    const data={
      availabilityOptions:finalPropertyAvialabilityOptions??'',
      flag:'6'
    }
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations',data)
      .subscribe(
        (response: any) => {
          if (response.data.length > 0) {
            this.propertydetails = response.data.map((property: any) => {
              let propertyImage: string = 'assets/images/empty.png';  
              let defaultPropImage: string = '';
              if (property.propImages && Array.isArray(property.propImages) && property.propImages.length > 0) {  
                const firstImage = property.propImages[0];
  
                if (firstImage.filePath) {
                  propertyImage = this.apiurls.getImageUrl(firstImage.filePath); 

                }
              } else {
              }
  
              if (property.image && property.image.filePath) {
                defaultPropImage = this.apiurls.getImageUrl(property.image.filePath); 

              } else {
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
                propertyaddress: property.address || 'N/A',  
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
                PropertyTypeName: property.propertyTypeName,
                selectedcityName:property.CityName
              };
            });
            this.isLoading = false;
          } else {
            alert("No Properties Available.");
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          this.router.navigate(['/search-properties']);
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
  
  
  totalAmount: string = "";
  loanTerm: string = "";
  interestRate: string = "";
  emiAmount: string = "";

  handleOk() {
    this.isUpdateModalOpen = false;
    this.propertyInsStatus = '';
  }
  
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
    this.propertyInsStatus = '';
  }
  isUpdateModalOpen: boolean = false;
  propertyInsStatus: string = ''; 
  calculateEMI(){
    const principal = parseFloat(this.totalAmount);
    const rate = parseFloat(this.interestRate) / 100 / 12; 
    const numberOfMonths = parseFloat(this.loanTerm) * 12; 
    if (principal > 0 && this.loanTerm && this.interestRate) {
      const emi = (principal * rate * Math.pow(1 + rate, numberOfMonths)) /
                  (Math.pow(1 + rate, numberOfMonths) - 1);
      
      this.emiAmount = emi.toFixed(2);
    } else {
      this.propertyInsStatus = 'Please fill in all fields to calculate the EMI.';
      this.isUpdateModalOpen = true;
    }
    }
}
