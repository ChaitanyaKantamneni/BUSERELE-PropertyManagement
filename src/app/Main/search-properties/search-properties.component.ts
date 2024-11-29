import { CommonModule, NgFor } from '@angular/common';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TopNavComponent } from "../top-nav/top-nav.component";
import { ActivatedRoute } from '@angular/router';
interface propertyDet{
  propertyID:string,
  propertyimage:string,
  propertyprice:string,
  propertyname:string,
  propertyaddress:string,
  propertyarea:string,
  propertybeds:string,
  propertybathrooms:string,
  propertytype:string
}

@Component({
  selector: 'app-search-properties',
  standalone: true,
  imports: [NgFor, HttpClientModule, CommonModule, TopNavComponent],
  templateUrl: './search-properties.component.html',
  styleUrl: './search-properties.component.css'
})
export class SearchPropertiesComponent implements OnInit {
  propertyType: string | null = null;
  selectedPropertyType:string|null='';
  keyword: string | null = '';
  constructor(public apiurl:HttpClient,private route: ActivatedRoute){}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.keyword=params.get('keyword');
      this.selectedPropertyType=params.get('propertyType');
      console.log('Property Type for Search:', this.propertyType);
    });

    // if (this.propertyType) {
    //   this.loadPropertyDetailsByPropertyType(this.propertyType);
    // }
    // else 
    if(this.selectedPropertyType && this.keyword){
      this.loadPropertyDetailsByFilters(this.selectedPropertyType,this.keyword);
    }
    else{
      this.loadPropertyDetails();
    }
  }

  propertydetails: propertyDet[] = [];

  loadPropertyDetails() {
    this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImages')
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);

          // Map the API response to the propertydetails array
          this.propertydetails = response.map((property: any) => ({
            propertyID: property.propID || 'N/A',  // Default value if undefined
            propertyname: property.propname || 'Unknown Property',  // Default value if undefined
            propertyprice: property.propertyTotalPrice || 'Price not available',  // Default value if undefined
            propertyaddress: property.address || 'Address not available',  // Default value if undefined
            propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
            propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
            propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
            propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
            propertyimage: property.images.fileData || 'assets/images/img1.png'  // Default image if missing
          }));

          console.log('Mapped Properties:', this.propertydetails);
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

          // Map the API response to the propertydetails array
          this.propertydetails = response.map((property: any) => ({
            propertyID: property.propID || 'N/A',  // Default value if undefined
            propertyname: property.propname || 'Unknown Property',  // Default value if undefined
            propertyprice: property.propertyTotalPrice || 'Price not available',  // Default value if undefined
            propertyaddress: property.address || 'Address not available',  // Default value if undefined
            propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
            propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
            propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
            propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
            propertyimage: property.images.fileData || 'assets/images/img1.png'  // Default image if missing
          }));

          console.log('Mapped Properties:', this.propertydetails);
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
  }
  

  loadPropertyDetailsByFilters(propertyType: string, keyword: string){
    this.apiurl.get<any[]>(`https://localhost:7190/api/Users/GetPropertiesWithFilters?keyword=${encodeURIComponent(keyword)}&propertyType=${propertyType}`)
      .subscribe(
        (response: any[]) => {
          console.log('API Response:', response);

          // Map the API response to the propertydetails array
          this.propertydetails = response.map((property: any) => ({
            propertyID: property.propID || 'N/A',  // Default value if undefined
            propertyname: property.propname || 'Unknown Property',  // Default value if undefined
            propertyprice: property.propertyTotalPrice || 'Price not available',  // Default value if undefined
            propertyaddress: property.address || 'Address not available',  // Default value if undefined
            propertyarea: property.totalArea || 'Area not available',  // Default value if undefined
            propertybeds: property.noOfBedrooms || 'Beds not available',  // Default value if undefined
            propertybathrooms: property.noOfBathrooms || 'Bathrooms not available',  // Default value if undefined
            propertytype: property.propertyType || 'Unknown Type',  // Default value if undefined
            propertyimage: property.images.fileData || 'assets/images/img1.png'  // Default image if missing
          }));

          console.log('Mapped Properties:', this.propertydetails);
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
  }
}
