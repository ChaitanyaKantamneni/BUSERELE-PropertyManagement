import { NgFor, NgStyle } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-view-property',
  standalone: true,
  imports: [HttpClientModule,NgFor,NgStyle],
  templateUrl: './view-property.component.html',
  styleUrl: './view-property.component.css'
})
export class ViewPropertyComponent implements OnInit {
  constructor(public apiurl:HttpClient,private route: ActivatedRoute, public router:Router ){

  }
  selectedPropertyID: string | null = '';
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.selectedPropertyID = params.get('propertyID');
    });
    
    if (this.selectedPropertyID) {
      this.loadPropertyDetailsByPropertyID(this.selectedPropertyID || '');
    } else {
      alert("No Properties Available with this Property Type.");
      this.router.navigate(['/home']);
    }
  }

  propertydetails:propertyDet[]=[];

  loadPropertyDetailsByPropertyID(propertyID: string) {  
    this.apiurl.get<any>(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propertyID}`)
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);

          console.log(response.images[0]);
          if (response && response.images && Array.isArray(response.images) && response.images.length > 0) {
            this.propertydetails = [{
              propertyID: response.propID || 'N/A',
              propertyname: response.propname || 'Unknown Property',
              propertyprice: response.propertyTotalPrice || 'Price not available',
              propertyaddress: response.address || 'Address not available',
              propertyarea: response.totalArea || 'Area not available',
              propertybeds: response.noOfBedrooms || 'Beds not available',
              propertybathrooms: response.noOfBathrooms || 'Bathrooms not available',
              propertytype: response.propertyType || 'Unknown Type',
              propertyimage: this.processImage(response.images[0])
            }];
          } else {
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
  
  processImage(image: any): string {
    let propertyImage = 'assets/images/img1.png'; // Default image if not found
  
    if (image && image.fileData) {
      try {
        const byteCharacters = atob(image.fileData);
        const byteArray = new Uint8Array(byteCharacters.length);
  
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
  
        const blob = new Blob([byteArray], { type: image.mimeType });
        propertyImage = URL.createObjectURL(blob);
        console.log(propertyImage);
      } catch (error) {
        console.error('Error decoding image data:', error);
      }
    }
  
    return propertyImage;
  }
  

}
