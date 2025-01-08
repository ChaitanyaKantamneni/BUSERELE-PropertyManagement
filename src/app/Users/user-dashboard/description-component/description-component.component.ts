import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-description-component',
  standalone: true,
  imports: [QuillModule, ReactiveFormsModule, FormsModule,NgIf,HttpClientModule],
  templateUrl: './description-component.component.html',
  styleUrl: './description-component.component.css'
})
export class DescriptionComponentComponent implements OnInit {
  propertytype: FormGroup;
  description: string = ''; 
  Specificdescription: string = ''; 
  isDesignMode: boolean = true;

  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean']
    ]
  };

  constructor(private fb: FormBuilder, private http:HttpClient,private sanitizer: DomSanitizer) {
    this.propertytype = this.fb.group({
      description: [''],
      Specificdescription: ['']
    });
  }

  ngOnInit(): void {
    // this.fetchDescription(3);  
  }

  clearContent(editorId: string): void {
    this.propertytype.get('description')?.setValue('');
    this.propertytype.get('Specificdescription')?.setValue('');

    const quillEditor = document.getElementById(editorId) as any;
    if (quillEditor && quillEditor.__quill) {
      quillEditor.__quill.root.innerHTML = '';
    }
  }


  stripHtmlTags(input: string): string {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.body.textContent || '';  
  }

  onSubmit(): void {
    const descriptionData = {
      description: this.propertytype.get('description')?.value || '',
      Specificdescription: this.propertytype.get('Specificdescription')?.value || ''
    };
  
    console.log("Submitting Description:", descriptionData.description);  
    console.log("Submitting Specific Description:", descriptionData.Specificdescription);
  
    if (descriptionData.description || descriptionData.Specificdescription) {
      const postUrl = 'https://localhost:7075/api/Tables/description';
    
      this.http.post(postUrl, descriptionData).subscribe({
        next: (response) => {
          console.log('Description uploaded successfully:', response);
          alert('Description saved successfully!');
          this.propertytype.reset();
        },
        error: (error) => {
          console.error('Error saving description:', error);
          alert(`Error saving description: ${error.message || 'Please try again later.'}`);
        }
      });
    } else {
      alert('Please enter a description before submitting.');
    }
  }
  
  sanitizeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);  
  }

  fetchDescription(id: number): void {
    const getUrl = `https://localhost:7075/api/Tables/description/${id}`;
    this.http.get<any>(getUrl).subscribe({
      next: (response) => {
        console.log('API response:', response);
        this.description = response.description;
        this.Specificdescription = response.Specificdescription;  
      },
      error: (error) => {
        console.error('Error fetching description:', error);
      }
    });
  }
}
