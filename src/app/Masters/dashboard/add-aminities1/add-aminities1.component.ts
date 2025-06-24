import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiServicesService } from '../../../api-services.service';

@Component({
  selector: 'app-add-aminities1',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule,FormsModule,NgFor,NgIf,ReactiveFormsModule,NgClass],
  templateUrl: './add-aminities1.component.html',
  styleUrl: './add-aminities1.component.css'
})
export class AddAminities1Component implements OnInit {
  aminities: Array<{ aminitieID: string, name: string, description: string, aminitieIcon:string }> = [];
  currentPage = 1;
  visiblePageCount: number = 3; 
  pageSize = 5;
  searchQuery: string = '';
  viewAminitieClicked:boolean=false;
  addnewclickClicked:boolean=false;
  aminitiesdetails: any = {};
  AminityInsStatus: any = '';
  isModalOpen = false;
  
  constructor(private apihttp: HttpClient,private apiurls: ApiServicesService) {}

  ngOnInit(): void {
    this.getreviews();
    this.aminitiesform.reset();
  }
 

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

  getAminitieDet(aminitieID: string): void {
    const data = {
      AminitieID: aminitieID,
      name: "",
      Description: "",
      AminitieIcon: "",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "4",
      Status: ""
    };
  
    this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations', data).subscribe(
      (response: any) => {
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          const aminitie = response.data[0];
          this.aminitiesform.patchValue({
            id: aminitie.aminitieID,
            name: aminitie.name,
            description: aminitie.description,
            icon: aminitie.aminitieIcon
          });
        } else {
          console.error('No data found for the given AminitieID.');
        }
      },
      error => {
        console.error('Error fetching aminity details:', error);
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
    if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
    }
  }
 
  getVisiblePages(): number[] {
    let startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePageCount / 2));
    let endPage = Math.min(this.totalPages, startPage + this.visiblePageCount - 1);

    if (endPage - startPage < this.visiblePageCount - 1) {
      startPage = Math.max(1, endPage - this.visiblePageCount + 1);
    }

    let pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }


  getreviews(): void {
    const data = {
      AminitieID: "",
      name: "",
      Description: "",
      AminitieIcon:"",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "3",
      Status: ""
    };
    this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations',data)
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          this.aminities = response.data.map((data: any) => ({
            aminitieID: data.aminitieID,
            name: data.name,
            description: data.description,
            icon: data.aminitieIcon
          }));
  
          if (this.aminities.length > 0) {
            this.aminitiesform.patchValue({
              id: this.aminities[0].aminitieID,
              name: this.aminities[0].name,
              description: this.aminities[0].description,
              icon: this.aminities[0].aminitieIcon,
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
    this.editclicked=false;
    this.aminitiesform.reset();

  }


  isUpdateModalOpen:boolean = false;
  propertyInsStatus: any = '';
  editclicked: boolean = false;

  // submitAminitieDet(){
  //   const data = {
  //     AminitieID: this.aminitiesform.get('id')?.value || '0',
  //     Name: this.aminitiesform.get('name')?.value || '',
  //     Description: this.aminitiesform.get('description')?.value || '',
  //     AminitieIcon: this.aminitiesform.get('icon')?.value || '',
  //     CreatedBy: localStorage.getItem('email') || '',
  //     CreatedIP: "",        
  //     CreatedDate: "",       
  //     ModifiedBy: "",
  //     ModifiedIP: "",
  //     ModifiedDate: "",
  //     Flag: "2",            
  //     Status: "",
  //     GeneratedID:""
  //   };
    
  //   this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations', data).subscribe({
  //     next: (response) => {
  //       if (response.statusCode === 200) {
  //         this.AminityInsStatus = response.Message;
  //         this.AminityInsStatus = "Aminity submitted successfully!";
  //         this.isModalOpen = true;
  //         this.aminitiesform.reset();
  //         this.aminitiesform.markAsPristine();
  //         this.editclicked = false;
          
  //       }
  //       this.aminitiesform.reset();
  //     },
  //     error: (error) => {
  //       console.error("Error details:", error);
  //       this.AminityInsStatus = "Error Updating Aminity.";
  //       this.isModalOpen = true;
  //     },
  //     complete: () => {
  //     }
  //   });
  // }

  // generateAminitieID(): void {
  //   const data = {
  //     AminitieID: "",
  //     name: "",
  //     Description: "",
  //     AminitieIcon: "",
  //     CreatedBy: "",
  //     CreatedIP: "",
  //     CreatedDate: null,
  //     ModifiedBy: "",
  //     ModifiedIP: "",
  //     ModifiedDate: null,
  //     Flag: "1", 
  //     Status: ""
  //   };
  
  //   this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations', data).subscribe({
  //     next: (response: any) => {
  //       console.log('Generated Amenity ID:', response);
  
  //       if (response && Array.isArray(response.data) && response.data.length > 0) {
  //         const generatedID = response.data[0].aminitieID;
  //         this.aminitiesform.patchValue({ id: generatedID }); 
  //       } else {
  //         console.error('Amenity ID generation returned empty result.');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching Amenity ID:', error);
  //     }
  //   });
  // }
  submitAminitieDet() {
    const data = {
      AminitieID: this.aminitiesform.get('id')?.value || '0',
      Name: this.aminitiesform.get('name')?.value || '',
      Description: this.aminitiesform.get('description')?.value || '',
      AminitieIcon: this.aminitiesform.get('icon')?.value || '',
      CreatedBy: localStorage.getItem('email') || '',
      CreatedIP: "",        
      CreatedDate: new Date().toISOString(), 
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: new Date().toISOString(), 
      Flag: "2",            
      Status: "",
      GeneratedID: null    
    };
  
    this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations', data).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.AminityInsStatus = "Amenity submitted successfully!";
          this.isModalOpen = true;
          this.aminitiesform.reset();
          this.aminitiesform.markAsPristine();
          this.editclicked = false;
        }
      },
      error: (error) => {
        console.error("Error details:", error);
        this.AminityInsStatus = "Error Updating Aminity.";
        this.isModalOpen = true;
      }
    });
  }
  

  
  generateAminitieID(): void {
    const data = {
      AminitieID: "",
      Name: "",
      Description: "",
      AminitieIcon: "",
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
  

    this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations', data).subscribe({
      next: (response: any) => {
        console.log('Generated Amenity ID:', response);
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          const generatedID = response.data[0].generatedID;
          if (generatedID) {
            this.aminitiesform.patchValue({ id: generatedID });
          } else {
            console.error('Generated ID not found in response.');
          }
        } else {
          console.error('Amenity ID generation returned empty or unexpected result.');
        }
      },
      error: (error) => {
        console.error('Error fetching Amenity ID:', error);
      }
    });
  }
  

updateAminitie() {
  if (!this.aminitiesform.valid) {
    this.AminityInsStatus = "Please fill all required fields correctly.";
    this.isModalOpen = true;
    return;
  }

  const aminitieID = this.aminitiesform.get('id')?.value?.trim();
  if (!aminitieID) {
    this.AminityInsStatus = "Invalid Aminitie ID.";
    this.isModalOpen = true;
    return;
  }

  const data = {
    AminitieID: aminitieID,
    name: this.aminitiesform.get('name')?.value,
    Description: this.aminitiesform.get('description')?.value || null,
    AminitieIcon: this.aminitiesform.get('icon')?.value || null,
    ModifiedBy: localStorage.getItem('email') || 'system',
    ModifiedIP: '',
    ModifiedDate: new Date().toISOString(), 
    Flag: "5",
    Status: ""
  };

  this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations', data).subscribe({
    next: (response: any) => {
      if (response.statusCode === 200) {
        this.AminityInsStatus = "Aminity updated successfully!";
        this.AminityInsStatus = "Aminity updated successfully!";
        this.isModalOpen = true;
        this.aminitiesform.markAsPristine(); 
      } else {
        this.AminityInsStatus = response.message || "Failed to update aminity.";
        this.isModalOpen = true;
      }
    },
    error: (error) => {
      console.error("Error updating aminity:", error);
      this.AminityInsStatus = "Error Updating Aminity.";
      this.isModalOpen = true;
    },
    complete: () => {
      console.log('Update aminity request completed.');
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
  this.isModalOpen = false; 
  this.addnewclickClicked = false; 
  this.viewAminitieClicked = false;
  this.aminitiesform.reset(); 
}
onSearchChange() {
  this.currentPage = 1; 
  this.getPaginatedAminities(); 
}


}
