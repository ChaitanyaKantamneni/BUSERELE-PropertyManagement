// import { Component } from '@angular/core';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ReactiveFormsModule } from '@angular/forms';
// import { CommonModule, NgFor, NgIf } from '@angular/common';
// import { FooterComponent } from "../Main/footer/footer.component";
// import { TopNav1Component } from '../Main/top-nav-1/top-nav-1.component';

// @Component({
//   selector: 'app-viewblog',
//   standalone: true,
//   imports: [ReactiveFormsModule, NgIf, CommonModule, HttpClientModule, FooterComponent, TopNav1Component],
//   templateUrl: './viewblog.component.html',
//   styleUrls: ['./viewblog.component.css'],
// })
// export class ViewblogComponent {
//   blog: any;  
//   blogId: string | null = null;
//   latestBlogs: any[] = []; 
//   displayedBlogs: any[] = []; 
//   isLoadingBlogs: boolean = false;
//   intervalId: any;
//   currentPage = 0;
//   blogsPerPage = 4;
  
  
//   constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

//   ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       this.blogId = params.get('id');
//       if (this.blogId) {
//         this.fetchBlogById(this.blogId); 
//       } else {
//         console.error('Blog ID is missing or invalid');
//       }
//       this.fetchLatestBlogs(); 
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.intervalId) {
//       clearInterval(this.intervalId); 
//     }
//   }

//   fetchLatestBlogs(): void {
//     this.http.get<any>(`https://localhost:7190/api/Users/latestBlogs`).subscribe(
//       (response) => {
//         console.log('API Response:', response);
  
//         if (response && Array.isArray(response.data)) {
//           this.latestBlogs = response.data.map((blog: any) => {
//             let parsedDate = null;
//             if (blog.createdDate) {
//               parsedDate = new Date(blog.createdDate);
//               if (isNaN(parsedDate.getTime())) {
//                 parsedDate = null;
//               }
//             }
  
//             const formattedDate = parsedDate
//               ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
//               : 'Invalid date'; 
  
//             return {
//               ...blog,
//               BlogCreatedDate: formattedDate,
//               imageUrl: `https://localhost:7190/${blog.filePath}` 
//             };
//           });
  
//           console.log('Fetched Latest Blogs:', this.latestBlogs);
  
//           this.displayedBlogs = [...this.latestBlogs]; 
//           this.rotateBlogs(); 
//         } else {
//           console.error('API response does not contain an array in the data field:', response);
//         }
//       },
//       (error) => {
//         console.error('Error fetching latest blogs:', error);
//       }
//     );
//   }

//   rotateBlogs(): void {
//     this.intervalId = setInterval(() => {
//       const firstBlog = this.latestBlogs.shift(); 
//       if (firstBlog) {
//         this.latestBlogs.push(firstBlog); 
//       }
//       this.displayedBlogs = [...this.latestBlogs]; 
//     }, 20000);
//   }

//   getShortDescription(description: string): string {
//     const maxLength = 150;
//     return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
//   }

//   fetchBlogById(ID: string): void {
//     this.http.get<any>(`https://localhost:7190/api/Users/allUploadedBlogs/${ID}`).subscribe(
//       (response) => {
//         let parsedDate: Date | null = null;
//         if (response.createdDate) {
//           parsedDate = new Date(response.createdDate);
//           if (isNaN(parsedDate.getTime())) {
//             console.error('Invalid date format:', response.createdDate);
//             parsedDate = null;
//           }
//         }

//         const formattedDate = parsedDate
//           ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
//           : 'Invalid date';

//         this.blog = {
//           ...response,
//           imageUrl: response.imageUrl ? `https://localhost:7190${response.imageUrl}` : 'assets/images/img2.jpg',
//           BlogCreatedDate: formattedDate,
//         };
//       },
//       (error) => {
//         console.error('Error fetching blog:', error);
//       }
//     );
//   }

//   goToBlogDetail(blog: any): void {
//     const blogId = blog.id;
//     if (blogId) {
//       this.router.navigate([`/viewblog/${blogId}`]);
//     }
//   }
// }



import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FooterComponent } from "../Main/footer/footer.component";
import { TopNav1Component } from '../Main/top-nav-1/top-nav-1.component';

@Component({
  selector: 'app-viewblog',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule, HttpClientModule, FooterComponent, TopNav1Component],
  templateUrl: './viewblog.component.html',
  styleUrls: ['./viewblog.component.css'],
})
export class ViewblogComponent {
  blog: any;
  blogId: string | null = null;
  allBlogs: any[] = []; // Store all blogs fetched from API
  displayedBlogs: any[] = []; // Store the blogs to display per page
  isLoadingBlogs: boolean = false;
  intervalId: any;

  // Pagination settings
  currentPage = 0;
  blogsPerPage = 3;  // Show 3 blogs per page
  totalPages: number = 0;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.blogId = params.get('id');
      if (this.blogId) {
        this.fetchBlogById(this.blogId);
      } else {
        console.error('Blog ID is missing or invalid');
      }
      this.fetchAllBlogs(); // Fetch all blogs initially
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear interval when component is destroyed
    }
  }

  // Fetch all blogs from the API
  fetchAllBlogs(): void {
    this.isLoadingBlogs = true;
    this.http.get<any>(`https://localhost:7190/api/Users/getAllBlogs`).subscribe(
      (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.allBlogs = response.data.map((blog: any) => {
            let parsedDate = null;
            if (blog.createdDate) {
              parsedDate = new Date(blog.createdDate);
              if (isNaN(parsedDate.getTime())) {
                parsedDate = null;
              }
            }

            const formattedDate = parsedDate
              ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Invalid date';

            return {
              ...blog,
              BlogCreatedDate: formattedDate,
              imageUrl: `https://localhost:7190/${blog.filePath}`,
            };
          });

          this.totalPages = Math.ceil(this.allBlogs.length / this.blogsPerPage);
          this.updateDisplayedBlogs(); // Update the displayed blogs for the first page
          this.startRotation(); // Start rotating blogs every 20 seconds
        } else {
          console.error('Error: Invalid response data');
        }
        this.isLoadingBlogs = false;
      },
      (error) => {
        console.error('Error fetching blogs:', error);
        this.isLoadingBlogs = false;
      }
    );
  }

  // Update the displayed blogs for the current page
  updateDisplayedBlogs(): void {
    const startIndex = this.currentPage * this.blogsPerPage;
    this.displayedBlogs = this.allBlogs.slice(startIndex, startIndex + this.blogsPerPage);
  }

  // Rotate the blogs every 20 seconds
  startRotation(): void {
    this.intervalId = setInterval(() => {
      this.currentPage = (this.currentPage + 1) % this.totalPages; // Loop back to the first page
      this.updateDisplayedBlogs(); // Update the displayed blogs for the next page
    }, 20000); // Rotate every 20 seconds
  }

  // Fetch a single blog by ID (for detailed view)
  fetchBlogById(ID: string): void {
    this.http.get<any>(`https://localhost:7190/api/Users/allUploadedBlogs/${ID}`).subscribe(
      (response) => {
        let parsedDate: Date | null = null;
        if (response.createdDate) {
          parsedDate = new Date(response.createdDate);
          if (isNaN(parsedDate.getTime())) {
            console.error('Invalid date format:', response.createdDate);
            parsedDate = null;
          }
        }

        const formattedDate = parsedDate
          ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'Invalid date';

        this.blog = {
          ...response,
          imageUrl: response.imageUrl ? `https://localhost:7190${response.imageUrl}` : 'assets/images/img2.jpg',
          BlogCreatedDate: formattedDate,
        };
      },
      (error) => {
        console.error('Error fetching blog:', error);
      }
    );
  }

  // Navigate to blog details page
  goToBlogDetail(blog: any): void {
    const blogId = blog.id;
    if (blogId) {
      this.router.navigate([`/viewblog/${blogId}`]);
    }
  }
}
