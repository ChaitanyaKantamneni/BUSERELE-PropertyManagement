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
  IPAddress = '';

  ngOnInit(): void {

    this.http.get<{ ip: string }>('https://api.ipify.org?format=json').subscribe({
      next: (res) => {
        this.IPAddress = res.ip;
      },
      error: (err) => {
      }
    });
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
  
  imageChanged: boolean = false; 

    onFilesSelected(event: Event): void {
      const fileInput = event.target as HTMLInputElement;
      this.files = [];

      if (fileInput?.files?.length) {
        for (let i = 0; i < fileInput.files.length; i++) {
          const file = fileInput.files[i];
          this.files.push(file);
        }

        this.imageChanged = true; 
      }
    }


  onSubmit(): void {
    if (this.propertytype.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('Description', this.propertytype.value.Blog);
    formData.append('Title', this.propertytype.get('Name')?.value);
    formData.append('CreatedBy', localStorage.getItem('email') || '');
    formData.append('CreatedDate', new Date().toISOString());
    formData.append('CreatedIP', this.IPAddress); 
    formData.append('Flag', '1'); 
    formData.append('Status', '');
  
    if (this.files.length > 0) {
      this.files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }
    this.apiurls.post<{ message: string; uploadedImage: any }>('Proc_Tbl_AddBlogs', formData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
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
          this.propertyInsStatus = 'Failed to submit blog. Please try again.';
          this.isUpdateModalOpen = true;
        }
      });
  }
  
  UpdateBlog(): void {
    if (this.propertytype.invalid || !this.propID) {
      return;
    }
  
    const formData = new FormData();
    formData.append('ID', this.propID.toString());
    formData.append('Description', this.propertytype.value.Blog);
    formData.append('Title', this.propertytype.get('Name')?.value || '');
    formData.append('ModifiedBy', localStorage.getItem('email') || '');
    formData.append('ModifiedDate', new Date().toISOString());
    formData.append('ModifiedIP', this.IPAddress);
    formData.append('Flag', '4');

  
    formData.append('BlogStatus', this.updatedStatus ?? '0');
  
    if (this.files.length > 0) {
      this.files.forEach(file => {
        formData.append('files', file, file.name);
      });
    }
  
    this.apiurls.post<{ message: string; updatedBlog: any }>('Proc_Tbl_AddBlogs', formData)
      .subscribe({
        next: (response: any) => {  
          if (this.updatedStatus === '1') {
            this.propertyInsStatus = 'Blog approved successfully';
          } else if (this.updatedStatus === '2') {
            this.propertyInsStatus = 'Blog declined successfully';
          } else {
            this.propertyInsStatus = response.Message || response.message;
          }
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
          this.propertyInsStatus = 'Failed to update blog. Please try again.';
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
  }

  removeFile1(file1: CustomFile): void {
    const index = this.files1.findIndex(f => f.name === file1.name && f.url === file1.url);
  
    if (index !== -1) {
      this.files1.splice(index, 1);
      this.imageChanged = true;
    }
  }
  
  viewImage1(file1: CustomFile | File): void {  
    if (file1 instanceof File) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.showModal = true;
      };
      reader.readAsDataURL(file1);
    } else {
      this.imageUrl = file1.url.startsWith('http')
        ? file1.url
        : this.apiurls.getImageUrlblog(file1.url);
  
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
    const formData = new FormData();
    formData.append('Flag', '3');
    formData.append('ID', id);
  
    this.apiurls.post<any>('Proc_Tbl_AddBlogs', formData).subscribe({
      next: (response: any) => {
        const blog = response?.data?.[0];
  
        if (response?.statusCode === 200 && blog) {
          this.blog = blog;
          this.updatedStatus = blog.blogStatus;
  
          this.propertytype.patchValue({
            Blog: blog.description,
            Name: blog.title,
            ImageUrl: blog.filePath 
              ? `${this.apiurls.getImageUrlblog}${blog.filePath}` 
              : ''
          });
  
          this.files1 = [];
          this.cdRef.detectChanges(); 

          if (blog.filePath && blog.fileName) {
            const imageUrl = this.apiurls.getImageUrlblog(blog.filePath);
            this.files1 = [{
              name: blog.fileName,
              url: imageUrl,
            }];
          } else {
          }
          
  
        } else {
        }
      },
      error: (err) => {
      }
    });
  }

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
        const data = {
          Title: search ,
          FileName: '',
          FilePath: '',
          Description: search,
          BlogStatus: status ,
          CreatedDate: null,
          CreatedBy: '',
          CreatedIP: '',
          ModifiedDate: null,
          ModifiedBy: '',
          ModifiedIP: '',
          Flag: '6',  
          Status: ''  
        };
      
        this.apiurls.post<any>(`Proc_Tbl_AddBlogs`, data).subscribe({
          next: (response) => {
            if (response.statusCode === 200) {
              this.properties = response.Data.map((property: any) => {
                let PropertyStatus: string = '';
                if (property.status === "2") {
                  PropertyStatus = "Not Approved";
                } else if (property.status === "1") {
                  PropertyStatus = "Approved";
                } else if (property.status === "0") {
                  PropertyStatus = "Pending";
                }
    
                let imageUrl = '';
                if (property.FilePath) {
                  `${this.apiurls.getImageUrlblog}${property.FilePath}`
                }
    
                return {
                  BlogID: property.id,
                  title: property.title,
                  status: PropertyStatus,
                  imageUrl: imageUrl,  
                };
              });
    
              this.filteredPropertiesNotNull = false;
            } else if (response.statusCode === 404) {
              this.filteredPropertiesNotNull = true;
            } else {
              this.properties = [];
            }
          },
          error: (err) => {
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
        const formData = new FormData();
        formData.append('Flag', '2');
      
        this.apiurls.post<any>('Proc_Tbl_AddBlogs', formData)
          .subscribe({
            next: (response: any) => {
              if (response.statusCode === 200 && response.data && response.data.length > 0) {
                this.properties = response.data.map((property: any) => {
                  let PropertyStatus = 'Pending';
                
                  if (property.blogStatus === "1") {
                    PropertyStatus = "Approved";
                  } else if (property.blogStatus === "2") {
                    PropertyStatus = "Not Approved";
                  }
                
                  const imageUrl = property.filePath
                    ? `${this.apiurls.getImageUrlblog}${property.filePath}`
                    : '';
                
                  return {
                    BlogID: property.id,
                    title: property.title,
                    status: PropertyStatus,
                    imageUrl: imageUrl
                  };
                });
                
              } else {
              }
            },
            error: (error) => {
            }
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
