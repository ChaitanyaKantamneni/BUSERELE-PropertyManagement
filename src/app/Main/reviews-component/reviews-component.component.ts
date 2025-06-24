import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";
import { ApiServicesService } from '../../api-services.service';

interface Review {
  reviewID: string;
  username: string;
  posteddate: string;
  review: string;
  imageurl: string;
  rating: number;
}

@Component({
  selector: 'app-reviews-component',
  standalone: true,
  providers: [ApiServicesService],
  imports: [NgIf, NgFor, HttpClientModule, RouterModule, TopNav1Component, FooterComponent],
  templateUrl: './reviews-component.component.html',
  styleUrls: ['./reviews-component.component.css']
})
export class ReviewsComponentComponent implements OnInit {
  constructor(public apiurl: HttpClient, private router: Router,private route: ActivatedRoute,private apiurls: ApiServicesService) {}

  reviewId:string|null=null;
  reviewWithReviewID:boolean=false;
  isLoadingReviews: boolean = false;
  selectedReview: any;
  remainingReviews: any[] = [];
  rating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];
  Reviews: any[] = [];
  reviewDetails: any[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const encodedReviewId = params.get('reviewID');
      console.log('encodedReviewId',encodedReviewId);
      if (encodedReviewId) {
        const decodedReviewId = this.decodeID(encodedReviewId); 
        this.loadReviewDetailsByReviewID(decodedReviewId); 
      } else {
        this.reviewWithReviewID = false;
        this.getTestimonials();
      }
      this.getTestimonials();
    });
  }

  decodeID(encodedID: string): string {
    try {
      const ID= atob(encodedID); 
      console.log('encodedID',ID);
      return ID;
    } catch (error) {
      console.error('Error decoding ID:', error);
      return ''; 
    }
  }
 
  getTestimonials() {
    this.isLoadingReviews = true;
    const data={
      reviewstatus:'1',
      flag:'2'
    }
    this.apiurls.post<any>('Tbl_Reviews_CRUD_Operations',data)
          .subscribe(
        (response: any) => {
          this.Reviews = response.data.map((testimonial: any) => {
            return {
              reviewID: testimonial.id || 'N/A',
              username: testimonial.username || 'N/A',
              posteddate: this.formatDate(testimonial.createdDate) || 'N/A',
              review: testimonial.usermessage || 'N/A',
              imageurl: 'assets/images/usericon.jpg',
              rating: testimonial.rating || 0,
            };
          });
          this.isLoadingReviews = false;
          this.remainingReviews = [...this.Reviews];
        },
        (error) => {
          console.error('Error fetching property details:', error);
          this.isLoadingReviews = false;
        }
      );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getShortReview(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) : text;
  }
  
  openReview(review: any): void {
    this.reviewWithReviewID=true;
    this.reviewDetails = [{
      reviewID: review.reviewID,
      Name: review.username,
      date: review.posteddate,
      review: review.review,
      rating: review.rating,
      imageurl:'assets/images/usericon.jpg'
    }];
  }
  
  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  loadReviewDetailsByReviewID(reviewId: string) {    
    this.isLoadingReviews = true;
  
    const data = {
      ReviewID: reviewId,
      flag: '3'
    };
    this.apiurls.post<any>('Tbl_Reviews_CRUD_Operations', data).subscribe(
      (response: any) => {
        const review = response?.data?.[0];
        console.log('review',review);
        if (review) {
          const formattedDate = this.formatDate(review.createdDate);
  
          this.reviewDetails = [{
            reviewID: review.reviewID ?? '',
            Name: review.username ?? 'Unknown User',
            date: formattedDate,
            review: review.usermessage ?? 'No message available',
            rating: review.rating ?? 0,
            imageurl: 'assets/images/usericon.jpg'
          }];
  
          this.isLoadingReviews = false;
          this.reviewWithReviewID = true;
        } else {
          this.isLoadingReviews = false;
          alert("No Reviews Available with this ID.");
          this.router.navigate(['/home']);
        }
      },
      (error) => {
        this.isLoadingReviews = false;
  
        if (error.status === 404) {
          alert("No Reviews Available with this ID.");
        } else {
          alert("An error occurred while fetching Review details.");
        }
  
        this.router.navigate(['/home']);
      }
    );
  }
}
