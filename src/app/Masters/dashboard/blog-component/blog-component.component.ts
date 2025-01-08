import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-blog-component',
  standalone: true,
  imports: [HttpClientModule,ReactiveFormsModule,FormsModule,QuillModule,NgIf,NgFor],
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


  ngOnInit(): void {}

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
    const BlogDescription = this.propertytype.get('Blog')?.value;
    const name = this.propertytype.get('Name')?.value;
  
    if (fileInput?.files?.length) {
      const file = fileInput.files[0];  // Get only the first file (in case multiple files are selected)
      console.log('Selected file:', file);
  
      // Clear any previous files (if necessary)
      this.files = [file];
  
      // Handle file upload to the server
      const formData = new FormData();
      formData.append('files', file);
      formData.append('blogDescription', BlogDescription);
      formData.append('name', name);
  
      this.http
        .post<{ imageUrl: string }>(
          'https://localhost:7075/api/Tables/uploadblogimg',
          formData
        )
        .subscribe({
          next: (response) => {
            const imageUrl = response.imageUrl;
            console.log('Image URL from response:', imageUrl);
            if (imageUrl) {
              this.imageUrl = imageUrl;  // Store the image URL
            }
          },
          error: (err) => {
            console.error('Image upload failed', err);
          },
        });
    }
  }
  


  onSubmit(): void {
    console.log('Form values:', this.propertytype.value);
    if (this.propertytype.invalid || !this.imageUrl) {
      console.error('Form is invalid or image not uploaded');
      return;
    }

    const blogContent = this.propertytype.value.Blog;
    const formData = new FormData();
    formData.append('blogDescription', blogContent);
    formData.append('imageUrl', this.imageUrl);
    formData.append('name', this.propertytype.get('Name')?.value);

    // Add selected files to FormData
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    this.http.post('https://localhost:7075/api/Tables/uploadblog', formData).subscribe({
      next: (response) => {
        console.log('Blog successfully submitted:', response);
      },
      error: (err) => {
        console.error('Error submitting blog:', err);
      },
    });
  }



  fetchImage(id: number): void {
    this.http
        .get<{ imageUrl: string; blogDescription: string; date: string }>(
            `https://localhost:7075/api/Tables/all/${id}`
        )
        .subscribe({
            next: (response) => {
                const imageUrl = response.imageUrl;
                const blogDescription = response.blogDescription;
                const date = response.date;
                const absoluteUrl = `https://localhost:7075${imageUrl}`;
                this.imageUrl = absoluteUrl;
                this.blogText = blogDescription;
                this.blogDate = new Date(date); // Parse and store the date
            },
            error: (err) => {
                console.error('Failed to fetch image and description:', err);
            },
        });
}
}
