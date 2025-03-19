import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms'; // Import NgModel if needed
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-review1',
  standalone:true,
  imports:[HttpClientModule,FormsModule,NgFor,NgIf,ReactiveFormsModule],
  templateUrl: './review1.component.html',
  styleUrls: ['./review1.component.css']
})
export class Review1Component implements OnInit {
  reviews: Array<{ propID: string, username: string, useremail: string, usermessage: string }> = [];
  currentPage = 1;
  pageSize = 5;
  searchQuery: string = '';
  reviewdetails: any = {};

  constructor(private apihttp: HttpClient) {}

  ngOnInit(): void {
    this.getreviews('0');
  }

  get filteredreviews() {
    return this.reviews.filter(review => 
      review.propID.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      review.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      review.useremail.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredreviews.length / this.pageSize);
  }

  getPaginatedReviews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredreviews.slice(start, start + this.pageSize);
  }

  setPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getreviews(status: string): void {
    this.apihttp.get(`https://localhost:7190/api/Users/GetUserReviewsStatus?status=${status}`)
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          
          this.reviews = response.data.map((data: any) => {
            let reviewStatusUpdated = 'N/A'; 
          
            if (data.status === '2') {
              reviewStatusUpdated = 'Declined';
            } else if (data.status === '1') {
              reviewStatusUpdated = 'Approved';
            } else if (data.status === '0') {
              reviewStatusUpdated = 'Pending';
            }
          
            return {
              propID: data.propID,
              username: data.username,
              useremail: data.useremail,
              usermessage: data.usermessage,
              rating:data.rating,
              reviewstatus: reviewStatusUpdated,  
              reviewId: data.id

            };
          });
          
        } else {
          console.error('Unexpected response format or no reviews found');
          this.reviews = [];
        }
      }, error => {
        console.error('Error fetching reviews:', error);
      });
  }

  onWhosePropertySelectionChange(event:any):void{
    console.log(event.target.value);
    if(event.target.value=='1'){
      this.getreviews('1');
    }
    else if(event.target.value=='2'){
      this.getreviews('2');
    }
    else{
      this.getreviews('0');
    }
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  updatedStatus:string='';
  updatedStatusSubmited:boolean=false;
  viewReviewClicked:boolean=false;

  updateReviewDet(ReviewID: string) {
    const data = {
      id: this.reviewdetails.ID,
      propID: this.reviewdetails.propertyID,
      userID: this.reviewdetails.userID,
      username: this.reviewdetails.username,
      useremail: this.reviewdetails.useremail,
      usernumber: this.reviewdetails.usernumber,
      usermessage: this.reviewdetails.usermessage,
      rating:this.reviewdetails.rating,
      createdDate: this.reviewdetails.createdDate,
      status: this.updatedStatus,
      modifieddate: new Date().toISOString()
    };
  
    console.log('ReviewID:', ReviewID);
    console.log('Data being sent:', data);
  
    this.apihttp.put(`https://localhost:7190/api/Users/updateReviewStatus/${ReviewID}`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        this.updatedStatusSubmited = true;
        alert('Review updated successfully');
        console.log('Response:', response);
      },
      error: (error) => {
        console.error("Error details:", error);
        if (error.error) {
          console.error("Server Response:", error.error);
        }
        alert('There was an error with your request');
      },
      complete: () => {
      }
    });
  }

  rating: number = 0; 
  stars: number[] = [1, 2, 3, 4, 5]; 

  getReviewDet(ReviewID: string) {
    this.apihttp.get(`https://localhost:7190/api/Users/GetReviewDetailsById/${ReviewID}`).subscribe(
      (response: any) => {
        
        
        if (response) {
          let reviewStatusUpdated = 'N/A';
          
            if (response.status === '2') {
              reviewStatusUpdated = 'Declined';
            } else if (response.status === '1') {
              reviewStatusUpdated = 'Approved';
            } else if (response.status === '0') {
              reviewStatusUpdated = 'Pending';
            }
          
          this.reviewdetails = {
            ID: response.id || 'N/A',  
            propertyID: response.propID || 'N/A',  
            userID: response.userID || 'N/A',  
            username: response.username || 'Unknown User',  
            useremail: response.useremail || 'Email not available', 
            usernumber: response.usernumber || 'Phone number not available',  
            usermessage: response.usermessage || 'Message not available',  
            rating:response.rating || 'rating not found',
            createdDate: response.createdDate ? new Date(response.createdDate) : new Date(),  
            status: reviewStatusUpdated,  
            modifiedDate: response.modifieddate ? new Date(response.modifieddate) : new Date(), 
          };
          console.log('Original Response:', response);
          console.log('Response:', this.reviewdetails);
        } else {
          console.error('Error: Response is null or undefined');
        }
      },
      error => {
        console.error('Error fetching review details:', error);
      }
    );
  }
  

  editreview(reviewID: string): void {
    this.updateReviewDet(reviewID);
  }

  viewReview(reviewID: string): void {
    this.getReviewDet(reviewID);
    this.viewReviewClicked=true;
  }

  declineReview(reviewID: string): void {
    this.updatedStatus='2';
    this.updateReviewDet(reviewID);
  }

  approveReview(reviewID: string): void {
    this.updatedStatus='1';
    this.updateReviewDet(reviewID);
  }

  backclick(event: Event): void {
    event.preventDefault(); 
    
    if (this.viewReviewClicked) {
      this.viewReviewClicked = false; 
    }
  }
  
}
