import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-aminities1',
  standalone: true,
  imports: [HttpClientModule,FormsModule,NgFor,NgIf,ReactiveFormsModule,NgClass],
  templateUrl: './add-aminities1.component.html',
  styleUrl: './add-aminities1.component.css'
})
export class AddAminities1Component implements OnInit {
  constructor(private apihttp: HttpClient) {}

  ngOnInit(): void {
    this.getreviews();
    this.aminitiesform.reset();
  }
  aminities: Array<{ aminitieID: string, name: string, description: string }> = [];
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
    description:new FormControl(''),
    icon:new FormControl('')
  })

  getPaginatedAminities() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAminities.slice(start, start + this.pageSize);
  }

  get filteredAminities() {
    return this.aminities.filter(aminitie => 
      aminitie.aminitieID.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
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

  getAminitieDet(aminitieID: string) {
    this.apihttp.get(`https://localhost:7190/api/Users/GetAminitieDetailsById/${aminitieID}`).subscribe(
      (response: any) => {
        if (response) {
          this.aminitiesform.patchValue({
            id: response.aminitieID,
            name: response.name,
            description: response.description,
            icon:response.aminitieIcon
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

  getreviews(): void {
    this.apihttp.get('https://localhost:7190/api/Users/GetAllAminities')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          this.aminities = response.data.map((data: any) => ({
            aminitieID: data.aminitieID,
            name: data.name,
            description: data.description
          }));
  
          if (this.aminities.length > 0) {
            this.aminitiesform.patchValue({
              id: this.aminities[0].aminitieID,
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
      AminitieID: this.aminitiesform.get('id')?.value,
      name: this.aminitiesform.get('name')?.value,
      Description: new String(this.aminitiesform.get('description')?.value).toString() || null,
      AminitieIcon:new String(this.aminitiesform.get('icon')?.value).toString() || null
    };
    this.apihttp.post("https://localhost:7190/api/Users/InsAminities", data, {
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
    this.apihttp.get("https://localhost:7190/api/Users/getautoaminitieID", { responseType: 'text' }).subscribe((response: string) => {
      this.aminitiesform.patchValue({ id: response });
    }, error => {
      console.error('Error fetching property ID:', error);
    });
  }

  updateAminitie() {
    const data = {
      AminitieID: this.aminitiesform.get('id')?.value, 
      name: this.aminitiesform.get('name')?.value,
      Description: this.aminitiesform.get('description')?.value || null,
      AminitieIcon:this.aminitiesform.get('icon')?.value || null,
      CreatedBy: 0,  
      CreatedIP: "", 
      CreatedDate: null,  
      ModifiedBy: 0,  
      ModifiedIP: "",  
      ModifiedDate: new Date().toISOString() 
    };

    const aminitieID: string = (this.aminitiesform.get('id')?.value).trim();

    this.apihttp.put(`https://localhost:7190/api/Users/updateAmititieDet/${aminitieID}`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
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
    this.aminitiesform.markAsPristine();
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
