
import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FooterComponent } from "../Main/footer/footer.component";
import { TopNav1Component } from '../Main/top-nav-1/top-nav-1.component';
import { ApiServicesService } from '../api-services.service';

@Component({
  selector: 'app-viewblog',
  standalone: true,
  providers: [ApiServicesService],
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, FooterComponent, TopNav1Component],
  templateUrl: './viewblog.component.html',
  styleUrls: ['./viewblog.component.css'],
})
export class ViewblogComponent {
  blog: any;
  blogId: string | null = null;
  allBlogs: any[] = []; 
  displayedBlogs: any[] = []; 
  isLoadingBlogs: boolean = false;
  intervalId: any;
  currentPage = 0;
  blogsPerPage = 3; 
  totalPages: number = 0;
  dots: number[] = [];
  currentSlideIndex = 0;
  autoSlideInterval: any;
  slideSize = 3;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router,private apiurls: ApiServicesService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const encodedBlogId = params.get('id'); 
      
      if (encodedBlogId) {
        const decodedBlogId = this.decodeID(encodedBlogId);
        this.fetchBlogById(decodedBlogId); 
      } else {
        console.error('Blog ID is missing or invalid');
      }
      this.fetchAllBlogs(); 
    });
  }
  decodeID(encoded: string): string {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4) {
      encoded += '=';  
    }
    return atob(encoded);  
  }
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
    }
  }

  fetchAllBlogs(): void {
    this.isLoadingBlogs = true;
    this.apiurls.get<any>(`getAllBlogs`).subscribe(
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
              imageUrl: blog.filePath ? this.apiurls.getImageUrlblog(blog.filePath) : 'assets/images/villa4.jpg'
            };
          });
  
          this.totalPages = Math.ceil(this.allBlogs.length / this.blogsPerPage);
          this.dots = Array(this.totalPages).fill(0).map((_, index) => index);
          this.updateDisplayedBlogs();
          this.startRotation();
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
  
  // fetchAllBlogs(): void {
  //   this.isLoadingBlogs = true;
  //   this.apiurls.get<any>(`getAllBlogs`).subscribe(
  //     (response) => {
  //       if (response && response.data && Array.isArray(response.data)) {
  //         this.allBlogs = response.data.map((blog: any) => {
  //           let parsedDate = null;
  //           if (blog.createdDate) {
  //             parsedDate = new Date(blog.createdDate);
  //             if (isNaN(parsedDate.getTime())) {
  //               parsedDate = null;
  //             }
  //           }
  
  //           const formattedDate = parsedDate
  //             ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  //             : 'Invalid date';
  
  //           return {
  //             ...blog,
  //             BlogCreatedDate: formattedDate,
  //             // imageUrl: blog.filePath ? `https://localhost:7190/${blog.filePath}` : 'assets/images/villa4.jpg'
  //             imageUrl: blog.filePath ? this.apiurls.getImageUrlblog(blog.filePath) : 'assets/images/villa4.jpg'
  //           };
  //         });
  
  //         this.totalPages = Math.ceil(this.allBlogs.length / this.blogsPerPage);
  //         this.dots = Array(this.totalPages).fill(0).map((_, index) => index);  
  //         this.updateDisplayedBlogs(); 
  //         this.startRotation(); 
  //       } else {
  //         console.error('Error: Invalid response data');
  //       }
  //       this.isLoadingBlogs = false;
  //     },
  //     (error) => {
  //       console.error('Error fetching blogs:', error);
  //       this.isLoadingBlogs = false;
  //     }
  //   );
  // }

  updateDisplayedBlogs(): void {
    const startIndex = this.currentPage * this.blogsPerPage;
    this.displayedBlogs = this.allBlogs.slice(startIndex, startIndex + this.blogsPerPage);
    this.currentSlideIndex = this.currentPage;
  }

  startRotation(): void {
    this.intervalId = setInterval(() => {
      this.currentPage = (this.currentPage + 1) % this.totalPages; 
      this.updateDisplayedBlogs(); 
    }, 20000); 
  }
  
  fetchBlogById(ID: string): void {
   this.apiurls.get<any>(`allUploadedBlogs/${ID}`).subscribe(
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
          // imageUrl: response.imageUrl ? `https://localhost:7190${response.imageUrl}` : 'assets/images/villa4.jpg',
          imageUrl: response.imageUrl 
          ? this.apiurls.getImageUrlblog(response.imageUrl) 
          : 'assets/images/villa4.jpg',
           BlogCreatedDate: formattedDate,
        };
      },
      (error) => {
        console.error('Error fetching blog:', error);
      }
    );
  }
  
  goToBlogDetail(blog: any): void {
    const blogId = blog.id;
    if (blogId) {
      const encodedBlogId = this.encodeID(blogId);
      this.router.navigate([`/viewblog/${encodedBlogId}`]);
    }
  }
  encodeID(id: string): string {
    return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  goToSlide(index: number): void {
    this.currentPage = index;
    this.currentSlideIndex = index;
    this.updateDisplayedBlogs();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.startRotation();
    }
  }


}
