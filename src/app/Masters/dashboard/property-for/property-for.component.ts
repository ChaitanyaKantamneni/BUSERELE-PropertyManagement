import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-property-for',
  standalone: true,
  imports: [HttpClientModule,FormsModule,NgFor,NgIf,ReactiveFormsModule,NgClass],
  templateUrl: './property-for.component.html',
  styleUrl: './property-for.component.css'
})
export class PropertyForComponent implements OnInit {
  constructor(private apihttp:HttpClient) {}

  ngOnInit(): void {
    this.getreviews();
    this.aminitiesform.reset();
  }
  aminities: Array<{ propertyTypeID: string, name: string, description: string }> = [];
  currentPage = 1;
  pageSize = 5;
  searchQuery: string = '';
  viewAminitieClicked:boolean=false;
  addnewclickClicked:boolean=false;
  aminitiesdetails: any = {};
  AminityInsStatus: any = '';

  aminitiesform:FormGroup= new FormGroup({
    id: new FormControl(''),
    // name:new FormControl(''),
    name: new FormControl('', [Validators.required]),
    description:new FormControl('')
  })

  getPaginatedAminities() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAminities.slice(start, start + this.pageSize);
  }

  get filteredAminities() {
    return this.aminities.filter(aminitie => 
      aminitie.propertyTypeID.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      aminitie.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      aminitie.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  editreview(aminitieID: string): void {
    console.log(aminitieID);
    this.getAminitieDet(aminitieID);
    this.viewAminitieClicked=true;
  }

  getAminitieDet(propertyTypeID: string) {
    this.apihttp.get(`https://localhost:7190/api/Users/GetPropertyTypeById/${propertyTypeID}`).subscribe(
      (response: any) => {
        // Ensure response is not null or undefined
        if (response) {
          // Directly patch the form with the response data
          this.aminitiesform.patchValue({
            id: response.propertyTypeID,
            name: response.name,
            description: response.description
          });
        } else {
          console.error('Error: Response is null or undefined');
        }
      },
      error => {
        console.error('Error fetching review details:', error);
      }
    );
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAminities.length / this.pageSize);
  }

  setPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // getreviews(): void {
  //   this.apihttp.get('https://localhost:7190/api/Users/GetAllAminities')
  //     .subscribe((response: any) => {
  //       console.log('API response:', response);
  //       if (response && Array.isArray(response.data)) {
  //         this.aminities = response.data.map((data: any) => ({
  //           this.aminitiesform.patchValue({id: data.aminitieID}),
  //           name: data.name,
  //           description: data.description
  //         }));
  //       } else {
  //         console.error('Unexpected response format or no reviews found');
  //         this.aminities = [];
  //       }
  //     }, error => {
  //       console.error('Error fetching reviews:', error);
  //     });
  // }

  getreviews(): void {
    this.apihttp.get('https://localhost:7190/api/Users/GetAllPropertyTypes')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          // Map the response data to the aminities array
          this.aminities = response.data.map((data: any) => ({
            propertyTypeID: data.propertyTypeID,
            name: data.name,
            description: data.description
          }));
  
          // If you want to patch the form with the first item from the response (example)
          if (this.aminities.length > 0) {
            // Example: patch the form with the first aminitieID, name, and description
            this.aminitiesform.patchValue({
              id: this.aminities[0].propertyTypeID,
              name: this.aminities[0].name,
              description: this.aminities[0].description
            });
          }
        } else {
          console.error('Unexpected response format or no reviews found');
          this.aminities = [];
        }
      }, error => {
        console.error('Error fetching reviews:', error);
      });
  }
  

  addnewclick(){
    this.addnewclickClicked=true;
    this.generateAminitieID();
    this.aminitiesform.reset();
  }

  submitAminitieDet(){
    const data = {
      ID: 0,
      PropertyTypeID: this.aminitiesform.get('id')?.value,
      Name: this.aminitiesform.get('name')?.value,
      Description: new String(this.aminitiesform.get('description')?.value).toString() || null
    };
    this.apihttp.post("https://localhost:7190/api/Users/InsPropertyTypes", data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if(response.StatusCode==200){
          this.AminityInsStatus = response.Message;
          this.isModalOpen = true;
          this.aminitiesform.reset(); 
          this.aminitiesform.markAsPristine();
        }
        this.aminitiesform.reset();
      },
      error: (error) => {
        console.error("Error details:", error);
        this.AminityInsStatus = "Error Updating Aminity.";
        this.isModalOpen = true;
      },
      complete: () => {
      }
    });
  }

  generateAminitieID(){
    this.apihttp.get("https://localhost:7190/api/Users/getautoPropertyTypeID", { responseType: 'text' }).subscribe((response: string) => {
      this.aminitiesform.patchValue({ id: response });
    }, error => {
      console.error('Error fetching property ID:', error);
    });
  }


  updatePropertyFor() {
    const propertyTypeID: string = (this.aminitiesform.get('id')?.value).trim();
    const Name:string= this.aminitiesform.get('name')?.value;
    const Description:string= new String(this.aminitiesform.get('description')?.value).toString();
    this.apihttp.put(`https://localhost:7190/api/Users/updatePropertyTypes/${propertyTypeID}?Name=${encodeURIComponent(Name)}&Description=${encodeURIComponent(Description)}`, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.AminityInsStatus = response.message;
          this.isModalOpen = true;
          this.aminitiesform.markAsPristine(); 
        }
      },
      error: (error) => {
        console.error("Error details:", error);
        this.AminityInsStatus = "Error Updating Aminity.";
        this.isModalOpen = true;
      },
      complete: () => {
        console.log('Request completed.');
      }
    });
 }

backclick(event: Event): void {
  event.preventDefault();
  
  if (this.addnewclickClicked || this.viewAminitieClicked) {
    this.addnewclickClicked = false;
    this.viewAminitieClicked=false;
    //this.aminitiesform.markAsPristine(); 
    this.aminitiesform.reset();
  }
}

isModalOpen = false;
closeModal() {
  this.isModalOpen = false;
}

handleOk() {
  this.closeModal();
  this.addnewclickClicked = false;
  this.viewAminitieClicked = false;
  this.getreviews();
}
}
