// // import { NgFor, NgIf } from '@angular/common';
// // import { HttpClient, HttpClientModule } from '@angular/common/http';
// // import { Component, OnInit } from '@angular/core';
// // import { RouterModule } from '@angular/router';
// // import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
// // import { FooterComponent } from "../footer/footer.component";

// // interface Review {
// //   reviewID: string;
// //   Username: string;
// //   posteddate: string;
// //   review: string;
// //   imageurl: string;
// // }

// // @Component({
// //   selector: 'app-reviews-component',
// //   standalone: true,
// //   imports: [NgIf, NgFor, HttpClientModule, RouterModule, TopNav1Component, FooterComponent],
// //   templateUrl: './reviews-component.component.html',
// //   styleUrl: './reviews-component.component.css'
// // })
// // export class ReviewsComponentComponent implements OnInit {
// //   constructor(public apiurl:HttpClient){}
// //   ngOnInit(): void {
// //     this.getTestimonials();
// //   }
// //   isLoadingReviews:boolean=false;


  
// //   rating: number = 0; 
// //   stars: number[] = [1, 2, 3, 4, 5]; 
// //   Reviews:any[]=[];
// //   getTestimonials() {
// //     this.isLoadingReviews=true;
// //     this.apiurl.get<Review[]>("https://localhost:7190/api/Users/GetUserReviewsStatus1")
// //     .subscribe(
// //       (response: any) => {
        
// //         this.Reviews = response.data.map((testimonial: any) => {

// //           return {
// //             reviewID: testimonial.id || 'N/A',
// //             username: testimonial.username || 'N/A',
// //             posteddate: this.formatDate(testimonial.createdDate) || 'N/A',
// //             review: testimonial.usermessage || 'N/A',
// //             imageurl:  'assets/images/usericon.jpg',
// //             rating: testimonial.rating || 0,  
// //           };
// //         });
// //         this.isLoadingReviews=false;
// //       },
// //       (error) => {
// //         console.error('Error fetching property details:', error);
// //         this.isLoadingReviews = false;
// //       }
// //     );
// //   }
// //   formatDate(dateString: string): string {
// //     const date = new Date(dateString);
// //     const day = String(date.getDate()).padStart(2, '0');
// //     const month = String(date.getMonth() + 1).padStart(2, '0');
// //     const year = date.getFullYear();
// //     return `${day}-${month}-${year}`;
// //   }
// // }

// import { NgFor, NgIf } from '@angular/common';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { RouterModule, Router } from '@angular/router';
// import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
// import { FooterComponent } from "../footer/footer.component";

// interface Review {
//   reviewID: string;
//   Username: string;
//   posteddate: string;
//   review: string;
//   imageurl: string;
// }

// @Component({
//   selector: 'app-reviews-component',
//   standalone: true,
//   imports: [NgIf, NgFor, HttpClientModule, RouterModule, TopNav1Component, FooterComponent],
//   templateUrl: './reviews-component.component.html',
//   styleUrl: './reviews-component.component.css'
// })
// export class ReviewsComponentComponent implements OnInit {
//   constructor(public apiurl: HttpClient, private router: Router) {}
//   ngOnInit(): void {
//     this.getTestimonials();
//   }
//   isLoadingReviews: boolean = false;
//   selectedReview: any;

//   rating: number = 0;
//   stars: number[] = [1, 2, 3, 4, 5];
//   Reviews: any[] = [];

//   getTestimonials() {
//     this.isLoadingReviews = true;
//     this.apiurl.get<Review[]>("https://localhost:7190/api/Users/GetUserReviewsStatus1")
//       .subscribe(
//         (response: any) => {
//           this.Reviews = response.data.map((testimonial: any) => {
//             return {
//               reviewID: testimonial.id || 'N/A',
//               username: testimonial.username || 'N/A',
//               posteddate: this.formatDate(testimonial.createdDate) || 'N/A',
//               review: testimonial.usermessage || 'N/A',
//               imageurl: 'assets/images/usericon.jpg',
//               rating: testimonial.rating || 0,
//             };
//           });
//           this.isLoadingReviews = false;
//         },
//         (error) => {
//           console.error('Error fetching property details:', error);
//           this.isLoadingReviews = false;
//         }
//       );
//   }

//   formatDate(dateString: string): string {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   }

//   openReview(review: any): void {
//     this.selectedReview = review;
//     this.router.navigate(['/view-reviews'], { state: { selectedReview: this.selectedReview } });
//   }
// }

import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";

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
  imports: [NgIf, NgFor, HttpClientModule, RouterModule, TopNav1Component, FooterComponent],
  templateUrl: './reviews-component.component.html',
  styleUrls: ['./reviews-component.component.css']
})
export class ReviewsComponentComponent implements OnInit {
  constructor(public apiurl: HttpClient, private router: Router,private route: ActivatedRoute) {}

  reviewId:string|null=null;
  reviewWithReviewID:boolean=false;
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.reviewId = params.get('reviewID');
      console.log(this.reviewId)
      if (this.reviewId) {
        this.reviewWithReviewID=true;
        this.loadReviewDetailsByReviewID(this.reviewId || '');
        
        
      } else {
        // alert("No Reviews Available with this ID.");
        // this.router.navigate(['/home']);
        this.reviewWithReviewID=false;
        this.getTestimonials();
      }
      this.getTestimonials();
    });
    
    // this.isLoadingReviews = true;
    // const navigation = this.router.getCurrentNavigation();
    // if (navigation?.extras.state) {
    //   this.selectedReview = navigation.extras.state.selectedReview;
    //   // Optionally, you can set up remainingReviews if you need to pass other reviews
    //   this.remainingReviews = navigation.extras.state.remainingReviews || [];
    // }
  }


  // ngOnInit(): void {
  //   this.route.paramMap.subscribe(params => {
  //     this.reviewId = params.get('reviewID');
  
  //     if (this.reviewId) {
  //       this.loadReviewDetailsByReviewID(this.reviewId);
  //     } else {
  //       this.getTestimonials();  // Load all reviews if no specific review is selected
  //     }
      
  //   });
  
  //   // Ensure reloading works when navigating to /view-reviews
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationEnd && event.url === '/view-reviews') {
  //       this.getTestimonials();
  //     }
  //   });
  // }
  
  isLoadingReviews: boolean = false;
  selectedReview: any;
  remainingReviews: any[] = [];
  rating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];
  Reviews: any[] = [];

  // Get testimonials from API
  getTestimonials() {
    this.isLoadingReviews = true;
    this.apiurl.get<Review[]>("https://localhost:7190/api/Users/GetUserReviewsStatus1")
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
          // Set the remaining reviews after selecting one
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
  }
  
  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  reviewDetails: any[] = [];
  loadReviewDetailsByReviewID(reviewId: string) {    
    this.isLoadingReviews=true;
    this.apiurl.get<any>(`https://localhost:7190/api/Users/GetReviewDetailsById/${reviewId}`)
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
