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
  suggestions: string[] = [];
  selectedPropertyType: string | null = '';
  constructor( public apiurl:HttpClient,private route: ActivatedRoute,public routes:Router){}
  ngOnInit(): void {
    this.loadPropertiesCount();
    this.route.paramMap.subscribe(params => {
      this.propertyType = params.get('propertyType');
      this.keyword = params.get('keyword');
  
      console.log('Selected Property Type:', this.propertyType);
      console.log('Selected Keyword:', this.keyword);
  
      // Set selectedPropertyType if needed for other purposes
      if (this.propertyType) {
        this.selectedPropertyType = this.propertyType;
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
propertydetails:any[]=[{
    propertyimage:'assets/images/img1.png',
    propertyprice:'12000',
    propertyname:'Marvel Grenduer',
    propertyaddress:'202,pragathi nagar, Hyderabad',
    propertyarea:'1200',
    propertybeds:'2',
    propertybathrooms:'2',
    propertytype:'apartment'
},
{
  propertyimage:'assets/images/img1.png',
    propertyprice:'12000',
    propertyname:'Marvel Grenduer',
    propertyaddress:'202,pragathi nagar, Hyderabad',
    propertyarea:'1200',
    propertybeds:'2',
    propertybathrooms:'2',
    propertytype:'villa'
},
{
  propertyimage:'assets/images/img1.png',
    propertyprice:'12000',
    propertyname:'Marvel Grenduer',
    propertyaddress:'202,pragathi nagar, Hyderabad',
    propertyarea:'1200',
    propertybeds:'2',
    propertybathrooms:'2',
    propertytype:'apartment'
},
{
  propertyimage:'assets/images/img1.png',
    propertyprice:'12000',
    propertyname:'Marvel Grenduer',
    propertyaddress:'202,pragathi nagar, Hyderabad',
    propertyarea:'1200',
    propertybeds:'2',
    propertybathrooms:'2',
    propertytype:'apartment'
}
]

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
  // if (this.selectedPropertyType || this.keyword) {
  //   this.routes.navigate(['/search-properties', this.selectedPropertyType || 'defaultType', this.keyword || 'defaultKeyword']);
  // } else {
  //   alert('Please select a property type or enter a keyword.');
  // }

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
}
