import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import { ApiServicesService } from '../../../api-services.service';

interface CustomFile {
  name: string;
  url: string;
  // data: Blob;
  // data?: any;
}


@Component({
  selector: 'app-blog-component',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule,ReactiveFormsModule,FormsModule,QuillModule,NgIf,NgFor,NgClass],
  templateUrl: './blog-component.component.html',
  styleUrl: './blog-component.component.css'
})
export class BlogComponentComponent {

  propertytype: FormGroup;
  selectedFileName: string = '';
  imageUrl: string = '';
  blogText: string = '';
  name: string = '';
  files: File[] = []; 
  showModal: boolean = false; 
  blogDate: Date | null = null;
  files1: CustomFile[] = [];
  visiblePageCount: number = 3; 
  editclicked: boolean = false;
  PropertyIsActiveStatusNotActive:boolean=false;
  properties: Array<{ status: string,title:string ,IsActiveStatusBoolean:string }> = [];
  propertyInsStatus: any = '';
  currentPage = 1;
  pageSize = 4; 
  blogId: string | null = null;
  addnewBlogclicked: boolean = false;
  searchQuery: string = "";
  selectedWhoseProperties: string = '0';
  selectedPropertyStatus1: string = '';
  selectedIsActiveStatus1:string='';
  userID: string = localStorage.getItem('email') || '';
  isUpdateModalOpen:boolean = false;
  propID: string = '';
  

  ngOnInit(): void {
    this.fetchBlogDetails();
  }
  

  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      // ['image'],
      // ['clean'],
      // , 'code-block'
    ],
  };

  constructor(private fb: FormBuilder,private http: HttpClient,private sanitizer: DomSanitizer,private apiurls: ApiServicesService,private cdRef: ChangeDetectorRef) {
    this.propertytype = this.fb.group({
      Blog: ['', Validators.required],
      Name: ['', Validators.required],
    });
  }




  
  onSearchChange(): void {
    this.currentPage = 1;
  }
  
  
  closeModal(): void {
    this.showModal = false;
  }


  
  onEditorChange(editor: QuillEditorComponent): void {
    const content = editor.quillEditor.root.innerHTML;
    this.propertytype.get('Blog')?.setValue(content);
  }

  stripHtmlTags(input: string): string {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.body.textContent || '';
  }

  sanitizeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  clearContent(editorId: string): void {
    this.propertytype.get('Blog')?.setValue('');
    const quillEditor = document.getElementById(editorId) as any;
    if (quillEditor && quillEditor.__quill) {
      quillEditor.__quill.root.innerHTML = '';
    }
  }
  // onFilesSelected(event: Event): void {
  //   const fileInput = event.target as HTMLInputElement;
  //   this.files = [];
  //   if (fileInput?.files?.length) {
  //     for (let i = 0; i < fileInput.files.length; i++) {
  //       const file = fileInput.files[i];
  //       console.log('Selected file:', file);
  //       this.files.push(file);
  //     }
  //     console.log("selectd files",this.files);
  //   }
  // }
  imageChanged: boolean = false; 

onFilesSelected(event: Event): void {
  const fileInput = event.target as HTMLInputElement;
  this.files = [];

  if (fileInput?.files?.length) {
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];
      console.log('Selected file:', file);
      this.files.push(file);
    }

    this.imageChanged = true; 

    console.log("Selected files:", this.files);
  }
}


  onSubmit(): void {
    console.log('Form values:', this.propertytype.value);
    
    if (this.propertytype.invalid) {
      console.error('Form is invalid');
      return;
    }
  
    const formData = new FormData();
    formData.append('Description', this.propertytype.value.Blog);
    formData.append('title', this.propertytype.get('Name')?.value);
    formData.append('CreatedBy', localStorage.getItem('email') as string);
    formData.append('status', '0'); 
  
    if (this.files.length > 0) {
      this.files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }
    this.apiurls.post<{ message: string; uploadedImage: any }>('uploadBlog', formData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            console.log('Blog uploaded successfully:', response);
          }
          this.propertyInsStatus = response.message;
          this.isUpdateModalOpen = true;
          this.propertytype.markAsPristine();
          this.addnewBlogclicked = false;
          this.propertytype.reset();
          this.files = [];
          this.files1 = [];
          this.fetchBlogDetails(); 
        },
        error: (err) => {
          console.error('Blog upload failed', err);
          this.propertyInsStatus = 'Failed to submit blog. Please try again.';
          this.isUpdateModalOpen = true;
        }
      });
  }
  

  UpdateBlog(): void {
    console.log('Form values:', this.propertytype.value);
    if (this.propertytype.invalid || !this.propID) {
      console.error('Form is invalid or blog ID is missing');
      return;
    }
    const formData = new FormData();
    formData.append('Description', this.propertytype.value.Blog);
    formData.append('title', this.propertytype.get('Name')?.value);
    formData.append('ModifiedBy', localStorage.getItem('email') as string);
    // formData.append('status', this.updatedStatus);
    // formData.append('status', this.updatedStatus || '1');

    if (this.updatedStatus !== undefined && this.updatedStatus !== null) {
      formData.append('status', this.updatedStatus);
    } else {
      formData.append('status', '0'); 
    }
    
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });
  
    // this.http.put<{ message: string; updatedBlog: any }>(`https://localhost:7190/api/Users/updateBlog/${this.propID}`, formData)
    //   .subscribe({
    //     next: (response) => {
    //       console.log('Blog updated successfully:', response);
    //       this.isUpdateModalOpen = true;
    this.apiurls.put<{ message: string; updatedBlog: any }>(`updateBlog/${this.propID}`, formData)
    .subscribe({
      next: (response) => {
        console.log('Blog updated successfully:', response);
    
          this.propertyInsStatus = response.message;
          this.isUpdateModalOpen = true;
          this.propertytype.markAsPristine(); 
          this.cdRef.detectChanges();
          this.editclicked = false;
          this.propertytype.reset();
          this.files = [];
          this.files1 = [];
          this.imageChanged = false;
          this.fetchBlogDetails(); 
        },
        error: (err) => {
          console.error('Blog update failed', err);
          this.isUpdateModalOpen = true;
        }
      });
  }
  


  approveBlog(blogID: string): void {
    this.updatedStatus = '1';
    this.propID = blogID; 
    this.UpdateBlog();   
  }
  
  declineBlog(blogID: string): void {
    this.updatedStatus = '2';
    this.propID = blogID; 
    this.UpdateBlog();  
  }

  
  updatedStatus:string='';
  blog: any;
  removeFile(file: File): void {
    const index = this.files.indexOf(file);
    if (index !== -1) {
      this.files.splice(index, 1);
    }
    console.log('Updated file list:', this.files);
  }

  removeFile1(file1: CustomFile): void {
    const index = this.files1.findIndex(f => f.name === file1.name && f.url === file1.url);
  
    if (index !== -1) {
      this.files1.splice(index, 1);
      this.imageChanged = true;
    }
    console.log('Updated file list:', this.files1);
  }
  
  // viewImage1(file1: CustomFile | File): void {
  //   console.log('viewImage1 triggered with:', file1);
  //   if (file1 instanceof File) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.imageUrl = e.target.result;
  //       this.showModal = true;  
  //     };
  //     reader.readAsDataURL(file1); 
  //   } else {
  //     this.imageUrl = "https://localhost:7190/" + file1.url;
  //     this.showModal = true; 
  //   }
  // }
  
  viewImage1(file1: CustomFile | File): void {
    console.log('viewImage1 triggered with:', file1);
    if (file1 instanceof File) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.showModal = true;
      };
      reader.readAsDataURL(file1);
    } else {
      this.imageUrl = this.apiurls.getviewimage(file1.url);
      this.showModal = true;
    }
  }

  viewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result; 
      this.showModal = true;  
    };
    reader.readAsDataURL(file);  
  }

    
      fetchBlogDetailsById(id: string): void {
        this.apiurls.get<any>(`allUploadedBlogs/${id}`).subscribe({
          next: (response: any) => {
            if (response) {
              this.blog = response;
              this.updatedStatus = response.status;
      
              this.propertytype.patchValue({
                Blog: response.description,
                Name: response.title,
                ImageUrl: response.imageUrl 
              });
      
              if (response.imageUrl) {
                const filename = response.fileName;
                this.files1.push({
                  name: filename,
                  url: response.imageUrl,
                  // data: null   
                });
              } else {
                console.warn('Image URL is missing.');
              }
            } else {
              console.error('Blog not found');
            }
          },
          error: (err) => {
            console.error('Error fetching blog details:', err);
          }
        });
      }
      
      // fetchBlogDetailsById(id: string): void {
      //   this.apiurls.get<any>(`allUploadedBlogs/${id}`).subscribe({
      //     next: (response: any) => {
      //       if (response) {
      //         this.blog = response;
      //         this.updatedStatus = response.status; 
      //         this.propertytype.patchValue({
      //           Blog: response.description,
      //           Name: response.title,
      //           ImageUrl: response.imageUrl 
      //         });
      //         if (response.fileData && response.fileData.length > 0) {
      //           let base64Data = response.fileData;
      //           const base64Prefix = 'data:image/jpeg;base64,';
      //           if (base64Data.startsWith(base64Prefix)) {
      //             base64Data = base64Data.slice(base64Prefix.length);
      //           }
      //           try {
      //             const byteCharacters = atob(base64Data); 
      //             const byteArray = new Uint8Array(byteCharacters.length);
      //             for (let i = 0; i < byteCharacters.length; i++) {
      //               byteArray[i] = byteCharacters.charCodeAt(i);
      //             }
      
      //             const blob = new Blob([byteArray], { type: 'image/jpeg' }); 
      //             const imageUrl = URL.createObjectURL(blob);
      
      //             const filename = response.fileName;  
      //             this.files1.push({
      //               name: filename,
      //               url: imageUrl,  
      //               data: blob      
      //             });
      //           } catch (error) {
      //             console.error('Error decoding Base64 image data:', error);
      //           }
      //         } else {
      //           console.error('Image data is missing or invalid.');
      //         }
      //       } else {
      //         console.error('Blog not found');
      //       }
      //     },
      //     error: (err) => {
      //       console.error('Error fetching blog details:', err);
      //     }
      //   });
      // }
  backclick(event: Event): void {
    event.preventDefault();
    if (this.editclicked || this.addnewBlogclicked) {
      this.editclicked = false;
      this.addnewBlogclicked = false;
      this.propertytype.reset(); 
      this.files = [];
      this.files1 = [];
  
      this.fetchBlogDetails();  
    }
    this.searchQuery = '';
  }
  
      onWhosePropertySelectionChange(event: any): void {
        this.selectedWhoseProperties = event.target.value;
        this.applyFilters();
      }
      
      filteredPropertiesNotNull:boolean=false;
      applyFilters(): void {
        this.fetchFilteredProperties(this.selectedWhoseProperties,this.searchQuery);
      }

      fetchFilteredProperties(status: string, search: string): void {
        const endpoint = `GetFilteredBlog?status=${status}&search=${search}`;
        this.apiurls.get<any>(endpoint).subscribe({
          next: (response) => {
            if (response.statusCode === 200) {
              this.properties = response.data.map((property: any) => {
                let PropertyStatus: string = '';
                if (property.status === "2") {
                  PropertyStatus = "Not Approved";
                } else if (property.status === "1") {
                  PropertyStatus = "Approved";
                } else if (property.status === "0") {
                  PropertyStatus = "Pending";
                }
    
                let imageUrl = '';
                if (property.fileData) {
                  imageUrl = `data:image/jpeg;base64,${property.fileData}`;
                }
    
                return {
                  BlogID: property.id,
                  title: property.title,
                  status: PropertyStatus,
                  imageUrl: imageUrl,  
                };
              });
    
              console.log(this.PropertyIsActiveStatusNotActive);
              this.filteredPropertiesNotNull = false;
            } else if (response.statusCode === 404) {
              console.log(response);
              this.filteredPropertiesNotNull = true;
              console.error(response.Message);
            } else {
              console.error('Unexpected response status:', response.StatusCode);
              this.properties = [];
            }
          },
          error: (err) => {
            console.error('Error fetching properties:', err);
            this.filteredPropertiesNotNull = true;
            this.properties = [];
          }
        });
      }


      getPropertyStatus(activeStatus: string): string {
        switch (activeStatus) {
          case '1': return 'Approved';
          case '2': return 'Declined';
          case '0': return 'Pending';
          default: return 'Unknown';
        }
      }

      getPropertyIsActiveStatus(IsActiveStatus: string): string {
        switch (IsActiveStatus) {
          case '1': return 'Active';
          case '0': return 'Not Active';
          default: return 'Unknown';
        }
      }

     
      
      fetchBlogDetails(): void {
        this.apiurls.get<any>('allUploadedBlogs')
          .subscribe((response: any) => {
            this.properties = response.map((property: any) => {
              let PropertyStatus: string = '';
              if (property.status === "2") {
                PropertyStatus = "Not Approved";
              } else if (property.status === "1") {
                PropertyStatus = "Approved";
              } else if (property.status === "0") {
                PropertyStatus = "Pending";
              }
      
              let imageUrl = '';
              if (property.fileData) {
                imageUrl = `data:image/jpeg;base64,${property.fileData}`;
              }
      
              return {
                BlogID: property.id,
                title: property.title,
                status: PropertyStatus,
                imageUrl: imageUrl,
              };
            });
      
            console.log('Mapped properties:', this.properties);
          }, error => {
            console.error('Error fetching properties:', error);
          });
      }
    
      addNewBlog(): void {
        this.addnewBlogclicked = true;
        this.editclicked = false; 
        this.propertytype.reset();  
        this.files = [];  
        this.files1 = []; 
    }

   
      UpdatecloseModal() {
        this.isUpdateModalOpen = false;
      }

      handleOk() {
        this.UpdatecloseModal();    
      }

      getPaginatedProperties() {
        const filteredProperties = this.filteredProperties;
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return filteredProperties.slice(start, end);
      }

      editproperty(blogID: string): void {
        this.editclicked = true;
        this.addnewBlogclicked = false; 
        this.propID = blogID;  
        this.fetchBlogDetailsById(blogID);
      }

      get filteredProperties() {
        return this.properties.filter(property => 
          property.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    
      get totalPages(): number {
        return Math.ceil(this.filteredProperties.length / this.pageSize);
      }
    
      getPaginatedReviews() {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredProperties.slice(start, start + this.pageSize);
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
      setPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
        this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
        this.currentPage--;
    }
  }

}
