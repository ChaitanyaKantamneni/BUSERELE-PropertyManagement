import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";

interface Review {
  reviewID: string;
  Username: string;
  posteddate: string;
  review: string;
  imageurl: string;
}

@Component({
  selector: 'app-reviews-component',
  standalone: true,
  imports: [NgIf, NgFor, HttpClientModule, RouterModule, TopNav1Component, FooterComponent],
  templateUrl: './reviews-component.component.html',
  styleUrl: './reviews-component.component.css'
})
export class ReviewsComponentComponent implements OnInit {
  constructor(public apiurl:HttpClient){}
  ngOnInit(): void {
    this.getTestimonials();
  }
  isLoadingReviews:boolean=false;
  Reviews:any[]=[];
  getTestimonials() {
    this.isLoadingReviews=true;
    this.apiurl.get<Review[]>("https://localhost:7190/api/Users/GetUserReviewsStatus1")
    .subscribe(
      (response: any) => {
        
        this.Reviews = response.data.map((testimonial: any) => {

          return {
            reviewID: testimonial.id || 'N/A',
            username: testimonial.username || 'N/A',
            posteddate: this.formatDate(testimonial.createdDate) || 'N/A',
            review: testimonial.usermessage || 'N/A',
            imageurl:  'assets/images/usericon.jpg'
          };
        });
        this.isLoadingReviews=false;
      },
      (error) => {
        console.error('Error fetching property details:', error);
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
}
