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
            // Determine the status string based on the value of data.status
            let reviewStatusUpdated = 'N/A'; // Default value
          
            if (data.status === '2') {
              reviewStatusUpdated = 'Declined';
            } else if (data.status === '1') {
              reviewStatusUpdated = 'Approved';
            } else if (data.status === '0') {
              reviewStatusUpdated = 'Pending';
            }
          
            // Return the object with the desired values
            return {
              propID: data.propID,
              username: data.username,
              useremail: data.useremail,
              usermessage: data.usermessage,
              reviewstatus: reviewStatusUpdated,  // Set the updated review status
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
    // Create the data object containing only the properties you need to update
    const data = {
      id: this.reviewdetails.ID,
      propID: this.reviewdetails.propertyID,
      userID: this.reviewdetails.userID,
      username: this.reviewdetails.username,
      useremail: this.reviewdetails.useremail,
      usernumber: this.reviewdetails.usernumber,
      usermessage: this.reviewdetails.usermessage,
      createdDate: this.reviewdetails.createdDate,
      status: this.updatedStatus,
      modifieddate: new Date().toISOString()
    };
  
    console.log('ReviewID:', ReviewID);
    console.log('Data being sent:', data);
  
    // Send the PUT request to update the review status
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
        // Additional logic can go here if needed when the request completes
      }
    });
  }

  getReviewDet(ReviewID: string) {
    this.apihttp.get(`https://localhost:7190/api/Users/GetReviewDetailsById/${ReviewID}`).subscribe(
      (response: any) => {
        // Ensure response is not null or undefined
        
        
        if (response) {
          let reviewStatusUpdated = 'N/A'; // Default value
          
            if (response.status === '2') {
              reviewStatusUpdated = 'Declined';
            } else if (response.status === '1') {
              reviewStatusUpdated = 'Approved';
            } else if (response.status === '0') {
              reviewStatusUpdated = 'Pending';
            }
          
          this.reviewdetails = {
            ID: response.id || 'N/A',  // Default value if undefined
            propertyID: response.propID || 'N/A',  // Default value if undefined
            userID: response.userID || 'N/A',  // Default value if undefined
            username: response.username || 'Unknown User',  // Default value if undefined
            useremail: response.useremail || 'Email not available',  // Default value if undefined
            usernumber: response.usernumber || 'Phone number not available',  // Default value if undefined
            usermessage: response.usermessage || 'Message not available',  // Default value if undefined
            createdDate: response.createdDate ? new Date(response.createdDate) : new Date(),  // Convert to Date object
            status: reviewStatusUpdated,  // Default value if undefined
            modifiedDate: response.modifieddate ? new Date(response.modifieddate) : new Date(),  // Convert to Date object
          };
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
    event.preventDefault(); // Prevents the default anchor behavior (page reload)
    
    if (this.viewReviewClicked) {
      this.viewReviewClicked = false; // Hide the review approval section
    }
  }
  
}
