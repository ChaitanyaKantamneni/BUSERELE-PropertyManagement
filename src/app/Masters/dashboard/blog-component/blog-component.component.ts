import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';

interface CustomFile {
  name: string;
  url: string;
  data: Blob;
}


@Component({
  selector: 'app-blog-component',
  standalone: true,
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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.propertytype = this.fb.group({
      Blog: ['', Validators.required],
      Name: ['', Validators.required],
    });
  }

  viewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result; 
      this.showModal = true;  
    };
    reader.readAsDataURL(file);  
  }

  viewImage1(file: CustomFile | File): void {
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.showModal = true;  
      };
      reader.readAsDataURL(file); 
    } else {
      this.imageUrl = file.url;
      this.showModal = true; 
    }
  }
  

  closeModal(): void {
    this.showModal = false;
  }

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
    }
  
    console.log('Updated file list:', this.files1);
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
  onFilesSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    this.files = [];
    if (fileInput?.files?.length) {
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        console.log('Selected file:', file);
        this.files.push(file);
      }
      console.log("selectd files",this.files);
    }
  }
  

  // onSubmit(): void {
  //   console.log('Form values:', this.propertytype.value);
  
  //   if (this.propertytype.invalid || this.files.length === 0) {
  //     console.error('Form is invalid or no files selected');
  //     return;
  //   }
  //   const formData = new FormData();
  
  //   const blogContent = this.propertytype.value.Blog;
  //   formData.append('Description', blogContent);
  //   formData.append('title', this.propertytype.get('Name')?.value); 
  
  //   this.files.forEach((file) => {
  //     formData.append('files', file, file.name);
  //   });
  //   this.http
  //     .post<{ message: string, uploadedImage: any }>('https://localhost:7190/api/Users/uploadBlog', formData)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response.statusCode === 200) { 
  //           this.isUpdateModalOpen = true;
  //           this.propertyInsStatus = response.message;
  //         } else {
  //           this.isUpdateModalOpen = true;
  //           this.propertyInsStatus = response.message;
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Blog upload failed', err);
  //       },
  //     });
  // }
  

  // UpdateBlog():void{
  //   console.log('Form values:', this.propertytype.value);

  //   if (this.propertytype.invalid) {
  //     console.error('Form is invalid');
  //     return;
  //   }

  //   const formData = new FormData();
  //   const blogContent = this.propertytype.value.Blog;
  //   formData.append('Description', blogContent);
  //   formData.append('title', this.propertytype.get('Name')?.value);
  //   this.files.forEach((file) => {
  //     formData.append('files', file, file.name);
  //   });
    
  //   const blogId = this.propID;
    

  //   this.http.put<{ message: string, updatedBlog: any }>(`https://localhost:7190/api/Users/updateBlog/${blogId}`, formData)
  //     .subscribe({
  //       next: (response) => {
  //         console.log(response.message);
  //         this.isUpdateModalOpen = true;
  //         this.propertyInsStatus = response.message;
  //       },
  //       error: (err) => {
  //         console.error('Blog update failed', err);
  //       },
  //     });
  // }


  onSubmit(): void {
    console.log('Form values:', this.propertytype.value);
  
    // Ensure form is valid and at least one file is selected
    if (this.propertytype.invalid || this.files.length === 0) {
      console.error('Form is invalid or no files selected');
      return;
    }
  
    const formData = new FormData();
    formData.append('Description', this.propertytype.value.Blog);
    formData.append('title', this.propertytype.get('Name')?.value);
  
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });
  
    this.http.post<{ message: string; uploadedImage: any }>('https://localhost:7190/api/Users/uploadBlog', formData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            console.log('Blog uploaded successfully:', response);
          }
          this.isUpdateModalOpen = true;
          this.propertyInsStatus = response.message;
          this.propertytype.markAsPristine(); // Reset form state after submit
        },
        error: (err) => {
          console.error('Blog upload failed', err);
        }
      });
  }
  
  UpdateBlog(): void {
    console.log('Form values:', this.propertytype.value);
  
    // Ensure form is valid before making update request
    if (this.propertytype.invalid || !this.propID) {
      console.error('Form is invalid or blog ID is missing');
      return;
    }
  
    const formData = new FormData();
    formData.append('Description', this.propertytype.value.Blog);
    formData.append('title', this.propertytype.get('Name')?.value);
  
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });
  
    this.http.put<{ message: string; updatedBlog: any }>(`https://localhost:7190/api/Users/updateBlog/${this.propID}`, formData)
      .subscribe({
        next: (response) => {
          console.log('Blog updated successfully:', response);
          this.isUpdateModalOpen = true;
          this.propertyInsStatus = response.message;
          this.propertytype.markAsPristine(); // Reset form state after update
        },
        error: (err) => {
          console.error('Blog update failed', err);
        }
      });
  }
  

  blogId: string | null = null;

   blog: any;
      fetchBlogDetailsById(id: string): void {
        this.http.get(`https://localhost:7190/api/Users/allUploadedBlogs/${id}`).subscribe({
          next: (response: any) => {
            if (response) {
              this.propertytype.patchValue({
                Blog: response.description,
                Name: response.title,
              });
              if (response.fileData && response.fileData.length > 0) {
                let base64Data = response.fileData;
                const base64Prefix = 'data:image/jpeg;base64,';
                if (base64Data.startsWith(base64Prefix)) {
                  base64Data = base64Data.slice(base64Prefix.length);
                }
      
                try {
                  const byteCharacters = atob(base64Data); 
                  const byteArray = new Uint8Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                  }
      
                  const blob = new Blob([byteArray], { type: 'image/jpeg' }); 
                  const imageUrl = URL.createObjectURL(blob);
      
                  const filename = response.fileName;  
                  this.files1.push({
                    name: filename,
                    url: imageUrl,  
                    data: blob      
                  });
                } catch (error) {
                  console.error('Error decoding Base64 image data:', error);
                }
              } else {
                console.error('Image data is missing or invalid.');
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
      
      
  addnewBlogclicked: boolean = false;

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
  }
  

      currentPage = 1;
      pageSize = 4; 

      searchQuery: string = "";
      selectedWhoseProperties: string = '0';
      selectedPropertyStatus1: string = '';
      selectedIsActiveStatus1:string='';
      userID: string = localStorage.getItem('email') || '';
     

      onWhosePropertySelectionChange(event: any): void {
        this.selectedWhoseProperties = event.target.value;
        this.applyFilters();
      }

      filteredPropertiesNotNull:boolean=false;
      applyFilters(): void {
        this.fetchFilteredProperties(this.selectedWhoseProperties,this.searchQuery);
      }

      fetchFilteredProperties(status: string,search: string): void {
        const url = `https://localhost:7190/api/Users/GetFilteredBlog?status=${status}&search=${search}`;
        this.http.get(url).subscribe((response: any) => {
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
            this.filteredPropertiesNotNull=false;
          } else if (response.statusCode === 404) {
            console.log(response);
            this.filteredPropertiesNotNull=true;
            console.error(response.Message);
          } else {
            console.error('Unexpected response status:', response.StatusCode);
            this.properties = [];
          }
        }, error => {
          console.error('Error fetching properties:', error);
          this.filteredPropertiesNotNull = true;
          this.properties = [];
        });
        
      }

      properties: Array<{ status: string,title:string ,IsActiveStatusBoolean:string }> = [];
      propertyInsStatus: any = '';
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

      PropertyIsActiveStatusNotActive:boolean=false;

      fetchBlogDetails(): void {
        this.http.get('https://localhost:7190/api/Users/allUploadedBlogs')
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
      editclicked: boolean = false;

      // addNewBlog(): void {
      //   this.addnewBlogclicked = true;
      //   this.editclicked = false;
      //   this.propertytype.reset();  
      //   this.files = [];  
      //   this.files1 = []; 
      // }
      addNewBlog(): void {
        this.addnewBlogclicked = true;
        this.editclicked = false; 
        this.propertytype.reset();  
        this.files = [];  
        this.files1 = []; 
    }

      isUpdateModalOpen:boolean = false;
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

      propID: string = '';

      // editproperty(blogID: string): void {
      //   this.editclicked = true;
      //   this.propID = blogID;  
      //   this.fetchBlogDetailsById(blogID);
      // }
      

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
    
      setPage(page: number): void {
        if (page > 0 && page <= this.totalPages) {
          this.currentPage = page;
        }
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
    
      
}
