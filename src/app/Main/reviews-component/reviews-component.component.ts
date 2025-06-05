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


  // ngOnInit(): void {
  //   this.route.paramMap.subscribe(params => {
  //     this.reviewId = params.get('reviewID');
  //     console.log(this.reviewId)
  //     if (this.reviewId) {
  //       this.reviewWithReviewID=true;
  //       this.loadReviewDetailsByReviewID(this.reviewId || '');
  //     } 
  //     else {
  //       // alert("No Reviews Available with this ID.");
  //       // this.router.navigate(['/home']);
  //       this.reviewWithReviewID=false;
  //       this.getTestimonials();
  //     }
  //     this.getTestimonials();
  //   });
    
  // }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const encodedReviewId = params.get('reviewID');
      if (encodedReviewId) {
        const decodedReviewId = this.decodeID(encodedReviewId); 
        this.loadReviewDetailsByReviewID(decodedReviewId); 
      } else {
        // alert("No Reviews Available with this ID.");
        // this.router.navigate(['/home']);
        this.reviewWithReviewID = false;
        this.getTestimonials();
      }
      this.getTestimonials();
    });
  }
  decodeID(encodedID: string): string {
    try {
      return atob(encodedID);  
    } catch (error) {
      console.error('Error decoding ID:', error);
      return ''; 
    }
  }
 
  
  getTestimonials() {
    this.isLoadingReviews = true;
    this.apiurls.get<any>('GetUserReviewsStatus1')
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

  // openReview(review: any): void {
  //   this.selectedReview = review;
  //   this.remainingReviews = this.Reviews.filter((r) => r !== review); 
  //   this.router.navigate(['/view-reviews'], { state: { selectedReview: this.selectedReview, remainingReviews: this.remainingReviews } });
  // }
  
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
    // const encodedID = btoa(review.reviewID);
    // this.router.navigate(['/view-reviews', encodedID]);
  }
  
  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

 
  loadReviewDetailsByReviewID(reviewId: string) {    
    this.isLoadingReviews=true;
    // this.apiurl.get<any>(`https://localhost:7190/api/Users/GetReviewDetailsById/${reviewId}`)
    this.apiurls.get<any>(`GetReviewDetailsById/${reviewId}`)
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);
  
          if (response) {            
            const formattedListDate = this.formatDate(response.createdDate);
            this.reviewDetails = [{
              reviewID: response.id || 'N/A',
              Name: response.username || 'Unknown Property',
              date: formattedListDate,
              review: response.usermessage || 'Address not available',
              rating: response.rating || 'Area not available',
              imageurl:'assets/images/usericon.jpg'            
            }];  
            this.isLoadingReviews=false
          } else {
            alert("No Reviews Available with this ID.");
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          if (error.status === 404) {
            alert("No Reviews Available with this ID.");
            this.router.navigate(['/home']);
          } else {
            alert("An error occurred while fetching Review details.");
          }
        }
      );
  }
  
}
