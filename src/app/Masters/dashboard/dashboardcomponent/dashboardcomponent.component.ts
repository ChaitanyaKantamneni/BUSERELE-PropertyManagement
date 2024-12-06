import { NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

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
  selector: 'app-dashboardcomponent',
  standalone: true,
  imports: [HttpClientModule,NgFor,RouterModule],
  templateUrl: './dashboardcomponent.component.html',
  styleUrl: './dashboardcomponent.component.css'
})
export class DashboardcomponentComponent implements OnInit {
  constructor(public apihttp:HttpClient,private route: ActivatedRoute){}
  propID:string|null='';
  userID=localStorage.getItem('email');
  ngOnInit(): void {
    this.getownProperties(this.userID|| '');
    this.route.paramMap.subscribe(params => {
      this.propID = params.get('propertyID');
    })
  }
  propertydetails: propertyDet[] = [];
  getownProperties(UserID:string){

    this.apihttp.get<any[]>(`https://localhost:7190/api/Users/GetAllPropertyDetailsWithImagesByUserID/${UserID}`)
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
                propertyimage: propertyImage  // Set the first converted Blob URL or default image URL
              };
            });
          }
          else{
            alert("No Properties Available with this User ID.");
          }
        },
        (error) => {
          console.error('Error fetching property details:', error);
        }
      );
  }
}
