import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';

interface CustomFile {
  name: string;
  url: string;
  data: Blob;  // or use 'File' if you want to handle the file object itself
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


  ngOnInit(): void {
    this.fetchBlogDetails();
  }

  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      ['image'],
      ['clean'],
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
      // If the input is a File object, read it as a Data URL using FileReader
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Once the file is loaded, set imageUrl to the base64 data URL
        this.imageUrl = e.target.result;
        this.showModal = true;  // Show modal or perform the necessary action
      };
      reader.readAsDataURL(file);  // Read the File as a data URL
    } else {
      // If it's a CustomFile object, use the `url` directly (assumed to be a Blob URL or base64)
      this.imageUrl = file.url;
      this.showModal = true;  // Show modal or perform the necessary action
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

  // onFilesSelected(event: Event): void {
  //   const fileInput = event.target as HTMLInputElement;
  //   const BlogDescription = this.propertytype.get('Blog')?.value;
  //   const name = this.propertytype.get('Name')?.value;
  
  //   if (fileInput?.files?.length) {
  //     const file = fileInput.files[0];  // Get only the first file (in case multiple files are selected)
  //     console.log('Selected file:', file);
  
  //     // Clear any previous files (if necessary)
  //     this.files = [file];
  
  //     // Handle file upload to the server
  //     const formData = new FormData();
  //     formData.append('files', file);
  //     formData.append('blogDescription', BlogDescription);
  //     formData.append('name', name);
  
  //     this.http
  //       .post<{ imageUrl: string }>(
  //         'https://localhost:7075/api/Tables/uploadblogimg',
  //         formData
  //       )
  //       .subscribe({
  //         next: (response) => {
  //           const imageUrl = response.imageUrl;
  //           console.log('Image URL from response:', imageUrl);
  //           if (imageUrl) {
  //             this.imageUrl = imageUrl;  // Store the image URL
  //           }
  //         },
  //         error: (err) => {
  //           console.error('Image upload failed', err);
  //         },
  //       });
  //   }
  // }
  


  // onSubmit(): void {
  //   console.log('Form values:', this.propertytype.value);
  //   if (this.propertytype.invalid || !this.imageUrl) {
  //     console.error('Form is invalid or image not uploaded');
  //     return;
  //   }

  //   const blogContent = this.propertytype.value.Blog;
  //   const formData = new FormData();
  //   formData.append('blogDescription', blogContent);
  //   formData.append('imageUrl', this.imageUrl);
  //   formData.append('name', this.propertytype.get('Name')?.value);

  //   // Add selected files to FormData
  //   this.files.forEach((file) => {
  //     formData.append('files', file, file.name);
  //   });

  //   this.http.post('https://localhost:7075/api/Tables/uploadblog', formData).subscribe({
  //     next: (response) => {
  //       console.log('Blog successfully submitted:', response);
  //     },
  //     error: (err) => {
  //       console.error('Error submitting blog:', err);
  //     },
  //   });
  // }


  onFilesSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
  
    // Clear any previous files (if necessary)
    this.files = [];
  
    if (fileInput?.files?.length) {
      // Push all selected files into the 'files' array
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        console.log('Selected file:', file);
        this.files.push(file);
      }
      console.log("selectd files",this.files);
    }
  }
  
  // onSubmit(): void {
  //   // Make sure the form is valid and that files are selected
  //   console.log('Form values:', this.propertytype.value);

  //   // Check if the form is invalid or no files are selected
  //   if (this.propertytype.invalid || this.files.length === 0) {
  //     console.error('Form is invalid or no files selected');
  //     return;
  //   }

  //   // Initialize FormData to append all the necessary data
  //   const formData = new FormData();

  //   // Get the Blog content and title
  //   const blogContent = this.propertytype.value.Blog;
  //   formData.append('Description', blogContent);
  //   formData.append('title', this.propertytype.get('Name')?.value); // Ensure 'Name' is your blog's title

  //   // Add selected files to FormData
  //   this.files.forEach((file) => {
  //     formData.append('files', file, file.name);
  //   });
  //   this.http
  //     .post<{ message: string, uploadedImage: any }>('https://localhost:7190/api/Users/uploadBlog', formData, {
  //       headers: { 'Content-Type': 'application/json' }
  //     })
  //     .subscribe({
  //       next: (response:any) => {
  //        if(response.statusCode="200"){
  //         this.isUpdateModalOpen=true;
  //         this.propertyInsStatus=response.message;
  //        }
  //        else{
  //         this.isUpdateModalOpen=true;
  //         this.propertyInsStatus=response.message;
  //        }
  //       },
  //       error: (err) => {
  //         console.error('Blog upload failed', err);
  //       },
  //     });
  // }


  onSubmit(): void {
    // Make sure the form is valid and that files are selected
    console.log('Form values:', this.propertytype.value);
  
    // Check if the form is invalid or no files are selected
    if (this.propertytype.invalid || this.files.length === 0) {
      console.error('Form is invalid or no files selected');
      return;
    }
  
    // Initialize FormData to append all the necessary data
    const formData = new FormData();
  
    // Get the Blog content and title
    const blogContent = this.propertytype.value.Blog;
    formData.append('Description', blogContent);
    formData.append('title', this.propertytype.get('Name')?.value); // Ensure 'Name' is your blog's title
  
    // Add selected files to FormData
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });
  
    // Send the request to the backend without 'Content-Type' header
    this.http
      .post<{ message: string, uploadedImage: any }>('https://localhost:7190/api/Users/uploadBlog', formData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {  // Fixed the comparison here
            this.isUpdateModalOpen = true;
            this.propertyInsStatus = response.message;
          } else {
            this.isUpdateModalOpen = true;
            this.propertyInsStatus = response.message;
          }
        },
        error: (err) => {
          console.error('Blog upload failed', err);
        },
      });
  }
  

  UpdateBlog():void{
    // console.log('Form values:', this.propertytype.value);

    // if (this.propertytype.invalid) {
    //   console.error('Form is invalid');
    //   return;
    // }

    // const formData = new FormData();
    // const blogContent = this.propertytype.value.Blog;
    // formData.append('Description', blogContent);
    // formData.append('title', this.propertytype.get('Name')?.value); // Blog title

    // // Add files to FormData if available
    // if (this.files1.length > 0) {
    //   this.files1.forEach((file) => {
    //     formData.append('files', file, file.name);
    //   });
    // }

    // // Assuming the blog ID is available and being updated
    // const blogId = this.propertyId; // Replace with the actual ID
    // this.http.put<{ message: string, updatedBlog: any }>(`https://localhost:7190/api/Users/updateBlog/${blogId}`, formData)
    //   .subscribe({
    //     next: (response) => {
    //       console.log(response.message);
    //       this.isUpdateModalOpen = true;
    //       this.propertyInsStatus = response.message;
    //     },
    //     error: (err) => {
    //       console.error('Blog update failed', err);
    //     },
    //   });
  }



      // fetchImage(id: string): void {
      //   this.http
      //       .get<{ imageUrl: string; blogDescription: string; date: string }>(
      //           `https://localhost:7190/api/Users/allUploadedBlogs/${id}`
      //       )
      //       .subscribe({
      //           next: (response) => {
      //               const imageUrl = response.imageUrl;
      //               const blogDescription = response.blogDescription;
      //               const date = response.date;
      //               const absoluteUrl = `https://localhost:7190${imageUrl}`;
      //               this.imageUrl = absoluteUrl;
      //               this.blogText = blogDescription;
      //               this.blogDate = new Date(date); // Parse and store the date
      //           },
      //           error: (err) => {
      //               console.error('Failed to fetch image and description:', err);
      //           },
      //       });
      // }
      
      files1: CustomFile[] = [];

      // fetchBlogDetailsById(id: string): void {
      //   this.http.get(`https://localhost:7190/api/Users/allUploadedBlogs/${id}`).subscribe({
      //     next: (response: any) => {
      //       if (response) {
      //         // Set the blog details into a form or variable
      //         this.propertytype.patchValue({
      //           Blog: response.description,
      //           Name: response.title,
      //         });
      
      //         // Assuming `response.imageUrl` contains a Base64-encoded string for image data
      //         if (response.imageUrl && response.fileData) {
      //           const filename = response.imageUrl.split('/').pop(); // Extract the filename from the URL
      
      //           // Convert Base64 to binary (decoding it)
      //           const byteCharacters = atob(response.imageData); // Decode base64 to raw binary
      //           const byteArray = new Uint8Array(byteCharacters.length);
      
      //           // Copy the binary data into the byteArray
      //           for (let i = 0; i < byteCharacters.length; i++) {
      //             byteArray[i] = byteCharacters.charCodeAt(i);
      //           }
      
      //           // Create a Blob from the byteArray
      //           const blob = new Blob([byteArray], { type: response.mimeType });
      
      //           // Create an object URL from the Blob
      //           const imageUrl = URL.createObjectURL(blob);
      
      //           // Push the file into the files1 array with filename, imageUrl, and file data
      //           this.files1.push({
      //             name: filename,  // File name extracted from the image URL
      //             url: imageUrl,   // Blob URL for displaying the image
      //             data: blob,      // The Blob object itself
      //           });

      //           console.log(this.files1);
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
      
      fetchBlogDetailsById(id: string): void {
        this.http.get(`https://localhost:7190/api/Users/allUploadedBlogs/${id}`).subscribe({
          next: (response: any) => {
            if (response) {
              // Set the blog details into a form or variable
              this.propertytype.patchValue({
                Blog: response.description,
                Name: response.title,
              });
      
              // Check if fileData exists and is a non-empty string
              if (response.fileData && response.fileData.length > 0) {
                let base64Data = response.fileData;
      
                // Remove the data URL prefix if it exists (optional step, depending on data)
                const base64Prefix = 'data:image/jpeg;base64,';
                if (base64Data.startsWith(base64Prefix)) {
                  base64Data = base64Data.slice(base64Prefix.length);
                }
      
                try {
                  // Decode Base64 to binary (decoding it)
                  const byteCharacters = atob(base64Data);  // Decoding Base64 to raw binary
                  const byteArray = new Uint8Array(byteCharacters.length);
      
                  // Copy the binary data into the byteArray
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                  }
      
                  // Create a Blob from the byteArray
                  const blob = new Blob([byteArray], { type: 'image/jpeg' });  // Use correct MIME type
                  const imageUrl = URL.createObjectURL(blob);  // Create an object URL from the Blob
      
                  // Push the file into the files1 array with filename, imageUrl, and file data
                  const filename = response.fileName;  // Use fileName directly from the API response
                  this.files1.push({
                    name: filename,
                    url: imageUrl,  // Blob URL for displaying the image
                    data: blob      // The Blob object itself
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
      
      

      // fetchBlogDetailsById(id: string): void {
      //   this.http.get(`https://localhost:7190/api/Users/allUploadedBlogs/${id}`).subscribe({
      //     next: (response: any) => {
      //       // Assuming the response is a single blog object, not an array
      //       if (response) {
      //         // Set the blog details into a form or variable
      //         this.propertytype.patchValue({
      //           Blog: response.description,  // or any other property you want to set
      //           Name: response.title,
                
      //         });
      //         this.files = response.imageUrl;
      //       } else {
      //         console.error('Blog not found');
      //       }
      //     },
      //     error: (err) => {
      //       console.error('Error fetching blog details:', err);
      //     }
      //   });
      // }
      

      currentPage = 1;
      pageSize = 5; 
      searchQuery: string = "";
      selectedWhoseProperties: string = '0';
      selectedPropertyStatus1: string = '';
      selectedIsActiveStatus1:string='';
      userID: string = localStorage.getItem('email') || '';
      get filteredProperties() {
        return this.properties.filter(property => 
          property.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

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
      
              // For displaying the image from the base64 encoded data
              let imageUrl = '';
              if (property.fileData) {
                // If fileData is a base64 string, you can display it directly in an <img> tag
                imageUrl = `data:image/jpeg;base64,${property.fileData}`;
              }
      
              return {
                BlogID: property.id,
                title: property.title,
                status: PropertyStatus,
                imageUrl: imageUrl,  // Include the base64 image URL for display
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
      
              // For displaying the image from the base64 encoded data
              let imageUrl = '';
              if (property.fileData) {
                // If fileData is a base64 string, you can display it directly in an <img> tag
                imageUrl = `data:image/jpeg;base64,${property.fileData}`;
              }
      
              return {
                BlogID: property.id,
                title: property.title,
                status: PropertyStatus,
                imageUrl: imageUrl,  // Include the base64 image URL for display
              };
            });
      
            console.log('Mapped properties:', this.properties);
          }, error => {
            console.error('Error fetching properties:', error);
          });
      }
      

      editclicked: boolean = false;
      addnewBlogclicked:boolean=false;

      addNewBlog(){
        this.addnewBlogclicked=true;
        this.editclicked=false;
      }

      isUpdateModalOpen:boolean = false;
      UpdatecloseModal() {
        this.isUpdateModalOpen = false;
      }

      // Handle "OK" button click
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

      editproperty(blogID: string): void {
        this.editclicked = true;
        this.propID = blogID;  
        this.fetchBlogDetailsById(blogID);
      }
      
}
