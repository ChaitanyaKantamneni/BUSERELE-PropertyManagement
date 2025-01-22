import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { TopNavComponent } from '../top-nav/top-nav.component';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor,NgIf,CommonModule,FooterComponent,TopNavComponent,HttpClientModule,RouterModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  propertyType: string | null = null;
  keyword: string | null = '';
  selectedPropertyID: string | null = '';
  suggestions: string[] = [];
  selectedPropertyType: string | null = '';
  constructor( public apiurl:HttpClient,private route: ActivatedRoute,public routes:Router){}
  ngOnInit(): void {
    this.loadPropertiesCount();
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.keyword = params.get('keyword');
      this.selectedPropertyID=params.get('propID');
      if (this.propertyType) {
        this.selectedPropertyType = this.propertyType;
      }
    });

    this.loadPropertyDetails();
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
// propertydetails:any[]=[{
//     propertyID:'',
//     propertyimage:'',
//     propertyprice:'',
//     propertyname:'',
//     propertyaddress:'',
//     propertyarea:'',
//     propertybeds:'',
//     propertybathrooms:'',
//     propertytype:''
// }]

propertydetails: any[] = [];

userreviews:any[]=[{
  username:'Chaitanya',
  userreview:'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quo, laborum? Architecto, doloremque sequi! Rem ratione labore, ea excepturi quos molestiae autem eaque magni quo! Vel atque in dicta esse laborum eaque sed perspiciatis totam nisi itaque molestias hic labore a eligendi sapiente officiis delectus, modi deleniti corrupti culpa harum aspernatur nemo dolores repellendus? Optio veniam, ullam debitis iure natus, recusandae.',
  isExpanded: false
},
{
  username:'Rohith',
  userreview:'Optio veniam, ullam debitis iure natus, recusandae aut qui accusantium consequatur explicabo cum repudiandae nostrum consectetur, blanditiis vitae placeat ab exercitationem amet provident esse eveniet. Cum incidunt nam tempora vero quisquam impedit voluptas ipsum eligendi asperiores error deleniti aperiam tenetur eaque eveniet necessitatibus sint, vel totam ratione.',
  isExpanded: false
},
{
  username:'Abhishek',
  userreview:'Optio veniam, ullam debitis iure natus, recusandae aut qui accusantium consequatur explicabo cum repudiandae nostrum consectetur, blanditiis vitae placeat ab exercitationem amet provident esse eveniet. Cum incidunt nam tempora vero quisquam impedit voluptas ipsum eligendi asperiores error deleniti aperiam tenetur eaque eveniet necessitatibus sint, vel totam ratione.',
  isExpanded: false
}
]

showMore(review: any): void {
  review.isExpanded = !review.isExpanded;
}


loadPropertiesCount(): void {
  this.apiurl.get("https://localhost:7190/api/Users/getPropertiesCount").subscribe(
    (data: any) => {  // Use `any` here instead of `Object`
      // Check if `data` is an array and process it accordingly
      if (Array.isArray(data)) {
        // Iterate through propertytypes and update the propertiesCount based on the API response
        this.propertytypes.forEach(type => {
          const foundType = data.find(item => item.propertyType === type.propertyType);
          if (foundType) {
            // If the propertyType exists in the API response, update the propertiesCount
            type.propertiesCount = foundType.count;
          } else {
            // If no count is found for this propertyType, optionally set it to 0 or leave it as is
            type.propertiesCount = 0;
          }
        });
      } else {
        console.error('Expected an array but got:', data);
      }
    },
    (error) => {
      console.error('Error fetching property counts', error);
    }
  );
}


onKeywordChange() {
  if (this.keyword && this.keyword.length > 2) {
    // Make an HTTP GET request to your API endpoint with the keyword as a query parameter
    this.apiurl.get<string[]>(`https://localhost:7190/api/Users/GetKeywordSuggestions?keyword=${encodeURIComponent(this.keyword)}`)
      .subscribe(
        (response) => {
          // Directly assign the response as suggestions
          this.suggestions = response;
        },
        (error) => {
          console.error('Error fetching keyword suggestions:', error);
          this.suggestions = [];
        }
      );
  } else {
    // Clear suggestions if the keyword is less than or equal to 2 characters
    this.suggestions = [];
  }
}


selectSuggestion(suggestion: string) {
  this.keyword = suggestion;
  this.suggestions = []; // Hide suggestions after selection
}

searchclick(){
  if (this.selectedPropertyType && this.keyword) {
    // Navigate if both selected property type and keyword are provided
    this.routes.navigate(['/search-properties', this.selectedPropertyType, this.keyword]);
  } else if (this.selectedPropertyType || this.keyword) {
    // Navigate if at least one is provided
    this.routes.navigate(['/search-properties', this.selectedPropertyType || 'defaultType', this.keyword || 'defaultKeyword']);
  } else {
    alert('Please select a property type or enter a keyword.');
  }
}


loadPropertyDetails() {
  this.apiurl.get<any[]>('https://localhost:7190/api/Users/GetAllPropertyDetailsWithImages')
    .subscribe(
      (response: any[]) => {
        console.log('API Response:', response);

        // Map the API response to the propertydetails array
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
                const byteCharacters = atob(firstImage.fileData);
                const byteArray = new Uint8Array(byteCharacters.length);

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

        console.log('Mapped Properties:', this.propertydetails);
      },
      (error) => {
        console.error('Error fetching property details:', error);
      }
    );
}
  

}
