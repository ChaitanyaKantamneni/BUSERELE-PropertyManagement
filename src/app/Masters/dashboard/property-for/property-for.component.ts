import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiServicesService } from '../../../api-services.service';

@Component({
  selector: 'app-property-for',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule,FormsModule,NgFor,NgIf,ReactiveFormsModule,NgClass],
  templateUrl: './property-for.component.html',
  styleUrl: './property-for.component.css'
})
export class PropertyForComponent implements OnInit {
  aminities: Array<{ propertyTypeID: string, name: string, description: string }> = [];
  currentPage = 1;
  pageSize = 5;
  visiblePageCount: number = 3; 
  searchQuery: string = '';
  viewAminitieClicked:boolean=false;
  addnewclickClicked:boolean=false;
  aminitiesdetails: any = {};
  AminityInsStatus: any = '';
  isModalOpen = false;

 
  constructor(private apihttp:HttpClient,private apiurls: ApiServicesService) {}

  ngOnInit(): void {
    this.getreviews();
    this.aminitiesform.reset();
  }
  
  aminitiesform:FormGroup= new FormGroup({
    id: new FormControl(''),
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
    this.apiurls.get<any>(`GetPropertyTypeById/${propertyTypeID}`).subscribe(
      (response: any) => {
        if (response) {
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
  

  get totalPages(): number {
    return Math.ceil(this.filteredAminities.length / this.pageSize);
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

setPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.getPaginatedAminities();
  }
}
getVisiblePages(): number[] {
  const pages = [];
  let startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePageCount / 2));
  let endPage = Math.min(this.totalPages, startPage + this.visiblePageCount - 1);

  if (endPage - startPage < this.visiblePageCount - 1) {
    startPage = Math.max(1, endPage - this.visiblePageCount + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}

onSearchChange(): void {
  this.currentPage = 1; 
  this.getPaginatedAminities();
}


  getreviews(): void {
    this.apiurls.get<any>('GetAllPropertyTypes')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          this.aminities = response.data.map((data: any) => ({
            propertyTypeID: data.propertyTypeID,
            name: data.name,
            description: data.description
          }));
          if (this.aminities.length > 0) {
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

  isUpdateModalOpen:boolean = false;
  propertyInsStatus: any = '';
  editclicked: boolean = false;


  submitAminitieDet(){
    const data = {
      ID: 0,
      PropertyTypeID: this.aminitiesform.get('id')?.value,
      Name: this.aminitiesform.get('name')?.value,
      Description: new String(this.aminitiesform.get('description')?.value).toString() || null,
      CreatedBy:localStorage.getItem('email') as string
    };
    // this.apihttp.post("https://localhost:7190/api/Users/InsPropertyTypes", data, {
    //   headers: { 'Content-Type': 'application/json' }
    // }).subscribe({
    //   next: (response: any) => {
    //     if(response.statusCode==200){
    //       this.AminityInsStatus = response.Message;
    //       this.isModalOpen = true;
    //       this.propertyInsStatus = "Aminity submitted successfully!";
    this.apiurls.post("InsPropertyTypes", data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.AminityInsStatus = response.Message;
          this.isModalOpen = true;
          this.propertyInsStatus = "PropertyTypes submitted successfully!";
          this.aminitiesform.reset();
          this.aminitiesform.markAsPristine();
          this.editclicked = false;
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
    // this.apihttp.get("https://localhost:7190/api/Users/getautoPropertyTypeID", { responseType: 'text' }).subscribe((response: string) => {
    //   this.aminitiesform.patchValue({ id: response });
    // }, error => {
    //   console.error('Error fetching property ID:', error);
    // });
    this.apiurls.get<string>("getautoPropertyTypeID",'text').subscribe({
      next: (response: string) => {
        this.aminitiesform.patchValue({ id: response });
      },
      error: (error) => {
        console.error('Error fetching property ID:', error);
      }
    });
  
  }



  updatePropertyFor() {
    const propertyTypeID: string = (this.aminitiesform.get('id')?.value).trim();
    const Name:string= this.aminitiesform.get('name')?.value;
    const Description:string= new String(this.aminitiesform.get('description')?.value).toString();
    
    // this.apihttp.put(`https://localhost:7190/api/Users/updatePropertyTypes/${propertyTypeID}?Name=${encodeURIComponent(Name)}&Description=${encodeURIComponent(Description)}`, {}).subscribe({
    //   next: (response: any) => {
    //     if (response.statusCode === 200) {
    //       this.AminityInsStatus = response.message;
    //       this.isModalOpen = true;
    const requestData = {};

    this.apiurls.put<any>(`updatePropertyTypes/${propertyTypeID}?Name=${encodeURIComponent(Name)}&Description=${encodeURIComponent(Description)}`, requestData)
      .subscribe({
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
  this.searchQuery = '';
}

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
