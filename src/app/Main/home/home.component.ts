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
    (data: any) => {  
      if (Array.isArray(data)) {
        this.propertytypes.forEach(type => {
          const foundType = data.find(item => item.propertyType === type.propertyType);
          if (foundType) {
            type.propertiesCount = foundType.count;
          } else {
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
    this.apiurl.get<string[]>(`https://localhost:7190/api/Users/GetKeywordSuggestions?keyword=${encodeURIComponent(this.keyword)}`)
      .subscribe(
        (response) => {
          this.suggestions = response;
        },
        (error) => {
          console.error('Error fetching keyword suggestions:', error);
          this.suggestions = [];
        }
      );
  } else {
    this.suggestions = [];
  }
}


selectSuggestion(suggestion: string) {
  this.keyword = suggestion;
  this.suggestions = []; 
}

searchclick(){
  if (this.selectedPropertyType && this.keyword) {
    this.routes.navigate(['/search-properties', this.selectedPropertyType, this.keyword]);
  } else if (this.selectedPropertyType || this.keyword) {
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

        this.propertydetails = response.map((property: any) => {
          let propertyImage: string = '';

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
              propertyImage='assets/images/img1.png';
            }
          } else {
            console.log('images property is missing, not an array, or empty.');
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
            propertyimage: propertyImage  
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
