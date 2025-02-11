import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-viewblog',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule, HttpClientModule],
  templateUrl: './viewblog.component.html',
  styleUrls: ['./viewblog.component.css'],
})
export class ViewblogComponent {
  blog: any;  // Single blog to hold the fetched blog data
  blogId: string | null = null;
  files1: any[] = []; 

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  // ngOnInit(): void {
  //   this.route.paramMap.subscribe(params => {
  //     const blogId = params.get('id');
  //     if (blogId) {
  //       this.fetchBlogById(blogId);
  //     }
  //   });
  // }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      // Get the blog ID from route parameters
      this.blogId = params.get('id');  
  
      if (this.blogId) {
        // Now you can call the method to fetch blog details
        this.fetchBlogById(this.blogId); 
      } else {
        console.error('Blog ID is missing or invalid');
      }
    });
  }

  fetchBlogById(ID: string): void {
    this.http.get<any>(`https://localhost:7190/api/Users/allUploadedBlogs/${ID}`).subscribe(
      (response) => {
        console.log('Response Date:', response.date);  // Log the date to see the actual value
       
        // Parse and format the date from the response
        const parsedDate = new Date(response.date);
        const formattedDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime())
          ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'Invalid date';
  
        // Assign the formatted date to the blog object
        this.blog = {
          ...response,
          imageUrl: `https://localhost:7075${response.imageUrl}`,
          formattedDate: formattedDate,  // Correctly set the formattedDate here
        };
  
        console.log('Fetched Blog:', this.blog);
  
        // Process image data if available
        if (this.blog.fileData) {
          this.processImageData(this.blog.fileData);
        }
      },
      (error) => {
        console.error('Error fetching blog:', error);
      }
    );
  }
  
  
  
  // Decode and process the Base64 image data
  processImageData(base64Data: string): void {
    // Check for correct prefix and strip it if necessary
    const base64Prefix = 'data:image/jpeg;base64,';
    if (base64Data.startsWith(base64Prefix)) {
      base64Data = base64Data.slice(base64Prefix.length);
    }

    try {
      // Decode the Base64 string to binary data
      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array(byteCharacters.length);

      // Copy binary data to byteArray
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob); // Create an Object URL from the Blob

      // Store the image in the files1 array (you could use this to display the image)
      this.files1.push({ url: imageUrl, data: blob });
    } catch (error) {
      console.error('Error decoding Base64 image data:', error);
    }
  }

  // Navigate to the blog detail page
  goToBlogDetail(blog: any): void {
    const blogId = blog.id;
    if (blogId) {
      this.router.navigate([`/viewblog/${blogId}`]);  // Navigate to the blog detail page
    }
  }
}
