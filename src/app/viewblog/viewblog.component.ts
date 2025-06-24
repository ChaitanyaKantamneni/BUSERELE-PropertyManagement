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
    const formData = new FormData();
    formData.append('Flag', '2');
    this.apiurls.post<any>('Proc_Tbl_AddBlogs', formData).subscribe(
      (response:any) => {
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
  
  fetchBlogById(id: string): void {
    const formData = new FormData();
    formData.append('ID', id);
    formData.append('Flag', '3');
  
    this.apiurls.post<any>('Proc_Tbl_AddBlogs', formData).subscribe(
      (response:any) => {
        const blogData = response.data[0];
        console.log('blog response',blogData);
        let parsedDate: Date | null = null;
        if (blogData?.createdDate) {
          parsedDate = new Date(blogData.createdDate);
          if (isNaN(parsedDate.getTime())) {
            console.error('Invalid date format:', blogData.createdDate);
            parsedDate = null;
          }
        }
  
        const formattedDate = parsedDate
          ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'Invalid date';
  
        this.blog = {
          ...blogData,
          imageUrl: blogData?.filePath
            ? this.apiurls.getImageUrlblog(blogData.filePath)
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
