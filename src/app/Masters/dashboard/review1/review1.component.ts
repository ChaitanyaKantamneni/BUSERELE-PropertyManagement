import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms'; // Import NgModel if needed
import { NgFor, NgIf } from '@angular/common';
import { ApiServicesService } from '../../../api-services.service';

@Component({
  selector: 'app-review1',
  standalone:true,
  providers: [ApiServicesService],
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
  rating: number = 0; 
  stars: number[] = [1, 2, 3, 4, 5]; 
  updatedStatus:string='';
  updatedStatusSubmited:boolean=false;
  viewReviewClicked:boolean=false;
  visiblePageCount: number = 3; 
  IPAddress = '';

  constructor(public http:HttpClient,private apihttp: HttpClient,private apiurls: ApiServicesService) {}

  ngOnInit(): void {
    this.http.get<{ ip: string }>('https://api.ipify.org?format=json').subscribe({
      next: (res) => {
        this.IPAddress = res.ip;
      },
      error: (err) => {
      }
    });
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

setPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
  }
}
getVisiblePages(): number[] {
  let startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePageCount / 2));
  let endPage = Math.min(this.totalPages, startPage + this.visiblePageCount - 1);
  if (endPage - startPage < this.visiblePageCount - 1) {
    startPage = Math.max(1, endPage - this.visiblePageCount + 1);
  }

  
 
  let pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
  }
  return pages;
}

  getreviews(status: string): void {
    const data={
          reviewstatus:status,
          flag:'2'
        }
    this.apiurls.post<any>('Tbl_Reviews_CRUD_Operations', data).subscribe({
      next: (response: any) => {  
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          this.reviews = response.data.map((item: any) => {
            let reviewStatusUpdated = 'N/A';
            if (data.reviewstatus === '2') {
              reviewStatusUpdated = 'Declined';
            } else if (data.reviewstatus === '1') {
              reviewStatusUpdated = 'Approved';
            } else if (data.reviewstatus === '0') {
              reviewStatusUpdated = 'Pending';
            }
  
            return {
                          propID: item.propID,
                          username: item.username,
                          useremail: item.useremail,
                          usernumber: item.usernumber,
                          usermessage: item.usermessage,
                          rating: item.rating,
                          reviewstatus: reviewStatusUpdated,
                          reviewID: item.reviewID 
                        };
          });
  
          this.filteredReviews = this.reviews;
        } else {
          this.reviews = [];
          this.filteredReviews = [];
        }
      },error: (err) => {
              this.reviews = [];
              this.filteredReviews = [];
            }
      });
  }
 
  filteredReviews: any[] = []; 

  onWhosePropertySelectionChange(event: any): void {
    const selectedValue = event.target.value;
    if (selectedValue === '1') {
      this.getreviews('1');
    } else if (selectedValue === '2') {
      this.getreviews('2');
    } else {
      this.getreviews('0'); 
    }
  }
  
  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  updateReviewDet(reviewID: string): void {
    const currentUserEmail = localStorage.getItem('email') || '';
    const data = {
      Flag: '4',
      ReviewID: reviewID,
      propID: this.reviewdetails.propertyID,
      userID: this.reviewdetails.userID,
      username: this.reviewdetails.username,
      useremail: this.reviewdetails.useremail,
      usernumber: this.reviewdetails.usernumber,
      usermessage: this.reviewdetails.usermessage,
      rating: this.reviewdetails.rating,
      reviewstatus: this.updatedStatus,
      modifiedDate: new Date().toISOString(),
      ModifiedBy: currentUserEmail,
      ModifiedIP: this.IPAddress,
    }; 
    this.apiurls.post<any>('Tbl_Reviews_CRUD_Operations', data).subscribe({
      next: (response) => {
        this.updatedStatusSubmited = true;
  
        switch (this.updatedStatus) {
          case '1':
            this.subscriptionStatus = 'Review Approved Successfully!';
            break;
          case '2':
            this.subscriptionStatus = 'Review Declined Successfully!';
            break;
          default:
            this.subscriptionStatus = 'Review status updated successfully!';
            break;
        }
  
        this.isUpdateModalOpen = true;
      },
      error: (error) => {
        if (error.error) {
        }
        alert('There was an error with your request');
      }
    });
  }
  
  isUpdateModalOpen: boolean = false;
  subscriptionStatus: string = '';

  getReviewDet(ReviewID: string): void {
    const data = {
      flag: '3',
      reviewID: ReviewID  
    };
    this.apiurls.post<any>('Tbl_Reviews_CRUD_Operations', data).subscribe({
      next: (response) => {
        if (response?.data?.length > 0) {
          const review = response.data[0];
  
          let reviewStatusUpdated = 'N/A';
          switch (review.reviewstatus) {
            case '0':
              reviewStatusUpdated = 'Pending';
              break;
            case '1':
              reviewStatusUpdated = 'Approved';
              break;
            case '2':
              reviewStatusUpdated = 'Declined';
              break;
          }
  
          this.reviewdetails = {
            ID: review.reviewID || 'N/A',
            propertyID: review.propID || 'N/A',
            userID: review.userID || 'N/A',
            username: review.username || 'Unknown User',
            useremail: review.useremail || 'Email not available',
            usernumber: review.usernumber || 'Phone number not available',
            usermessage: review.usermessage || 'Message not available',
            rating: review.rating || 'Rating not found',
            createdDate: review.createdDate ? new Date(review.createdDate) : new Date(),
            status: reviewStatusUpdated,
            modifiedDate: review.modifiedDate ? new Date(review.modifiedDate) : new Date()
          };
        } else {
        }
      },
      error: (err) => {
      }
    });
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



  onSearchChange(): void {
    this.currentPage = 1;
  }


  selectedReviewFilter: string = '0';
  onReviewFilterChange(event: any): void {
    this.selectedReviewFilter = event.target.value;
    this.getreviews(this.selectedReviewFilter);
  }

  backclick(event: Event): void {
    event.preventDefault();
    this.viewReviewClicked = false;
    this.searchQuery = '';
    this.getreviews(this.selectedReviewFilter);
  }
  UpdatecloseModal(): void {
    this.handleOk();
  }

handleOk(): void {
  this.isUpdateModalOpen = false;
  this.viewReviewClicked = false;
  this.searchQuery = '';
  this.getreviews(this.selectedReviewFilter);
}
}
