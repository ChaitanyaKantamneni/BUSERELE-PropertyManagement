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
  aminities: Array<{ propertyTypeID: string, name: string, description: string,flag:string }> = [];
  currentPage = 1;
  pageSize = 5;
  visiblePageCount: number = 3; 
  searchQuery: string = '';
  viewAminitieClicked:boolean=false;
  addnewclickClicked:boolean=false;
  aminitiesdetails: any = {};
  AminityInsStatus: any = '';
  isModalOpen = false;
  IPAddress = '';
 
  constructor(public http:HttpClient,private apihttp:HttpClient,private apiurls: ApiServicesService) {}

  ngOnInit(): void {
    this.http.get<{ ip: string }>('https://api.ipify.org?format=json').subscribe({
      next: (res) => {
        this.IPAddress = res.ip;
      },
      error: (err) => {
      }
    });
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
    this.getAminitieDet(aminitieID);
    this.viewAminitieClicked=true;
  }


  
  getAminitieDet(propertyTypeID: string) {
    const data = {
      PropertyTypeID: propertyTypeID,
      Name: "",
      Description: "",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "4",
      Status: ""
    };
  
    this.apiurls.post<any>("Tbl_PropertyType_CRUD_Operations", data).subscribe(
      (response: any) => {
        const item = response?.data?.[0]; 
        if (item) {
          this.aminitiesform.patchValue({
            id: item.propertyTypeID,
            name: item.name,
            description: item.description
          });
        } else {
        }
      },
      error => {
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
    const data = {
      PropertyTypeID: "",
      Name: "",
      Description: "",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "3",
      Status: ""
    };
    this.apiurls.post<any>('Tbl_PropertyType_CRUD_Operations',data)
      .subscribe((response: any) => {
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
          this.aminities = [];
        }
      }, error => {
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
      PropertyTypeID: this.aminitiesform.get('id')?.value,
      Name: this.aminitiesform.get('name')?.value,
      Description: new String(this.aminitiesform.get('description')?.value).toString() || null,
      CreatedBy:localStorage.getItem('email') as string,
      CreatedIP: this.IPAddress,        
      CreatedDate: new Date().toISOString(), 
      Flag: "2",            
      Status: "",
      GeneratedID: null    
     
    };
    this.apiurls.post("Tbl_PropertyType_CRUD_Operations", data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.AminityInsStatus = response.Message;
          this.isModalOpen = true;
          this.AminityInsStatus = "PropertyTypes submitted successfully!";
          this.aminitiesform.reset();
          this.aminitiesform.markAsPristine();
          this.editclicked = false;
        }
        this.aminitiesform.reset();
      },
      error: (error) => {
        this.AminityInsStatus = "Error Updating Aminity.";
        this.isModalOpen = true;
      },
      complete: () => {
      }
    });
  }

  generateAminitieID() {
   
    const data = {
      PropertyTypeID: "",
      Name: "",
      Description: "",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "1",
      Status: "",
      GeneratedID:""
    };
  

    this.apiurls.post<any>("Tbl_PropertyType_CRUD_Operations", data).subscribe({
      next: (response: any) => {
        const id = response?.data?.[0]?.generatedID || response?.data?.[0]?.generatedID;
        if (id) {
          this.aminitiesform.patchValue({ id });  
        } else {
        }
      },
      error: (error) => {
      }
    });
  }
  

  
  updatePropertyFor() {
    const idValue = this.aminitiesform.get('id')?.value?.trim();
  
    const requestData = {
      PropertyTypeID: idValue,
      Name: this.aminitiesform.get('name')?.value?.trim() || null,
      Description: this.aminitiesform.get('description')?.value?.trim() || null,
      Flag: '5',
      ModifiedBy: localStorage.getItem('email') || 'system',
      ModifiedIP: this.IPAddress, 
      ModifiedDate: new Date().toISOString() 
    };
  
    this.apiurls.post<any>('Tbl_PropertyType_CRUD_Operations', requestData).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.AminityInsStatus = "PropertyType updated successfully!";
          this.AminityInsStatus = "PropertyType updated successfully!";
          this.isModalOpen = true;
          this.aminitiesform.markAsPristine(); 
        } else {
          this.AminityInsStatus = response.message || "Failed to update PropertyType.";
          this.isModalOpen = true;
        }
      },
      error: (error) => {
        this.AminityInsStatus = 'Error updating property type.';
        this.isModalOpen = true;
      }
    });
  }
  

backclick(event: Event): void {
  event.preventDefault();
  if (this.addnewclickClicked || this.viewAminitieClicked) {
    this.addnewclickClicked = false;
    this.viewAminitieClicked=false;
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
