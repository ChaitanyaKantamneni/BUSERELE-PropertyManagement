import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-amenities',
  standalone: true,
  imports: [HttpClientModule,FormsModule,NgFor,NgIf,ReactiveFormsModule,CommonModule],
  templateUrl: './add-amenities.component.html',
  styleUrl: './add-amenities.component.css'
})
export class AddAmenitiesComponent implements OnInit {
  aminities: Array<{ aminitieID: string, aminitieName: string}> = [];
  currentPage = 1;
  pageSize = 4;
  searchQuery: string = '';
  reviewdetails: any = {};

  AminitiesForm:any=new FormGroup({
    id:new FormControl(),
    name:new FormControl(),
    description:new FormControl()
  })

  public AminitiesAddedSuccesfull:string='';
  messageColor:any={red:false,green:false};

  constructor(private apihttp: HttpClient) {}

  ngOnInit(): void {
    this.getAminities();
  }

  get filteredAminities() {
    return this.aminities.filter(aminitie => 
      (aminitie.aminitieID && aminitie.aminitieID.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (aminitie.aminitieName && aminitie.aminitieName.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }
  

  get totalPages(): number {
    return Math.ceil(this.filteredAminities.length / this.pageSize);
  }

  getPaginatedReviews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAminities.slice(start, start + this.pageSize);
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

  getAminities(): void {
    this.apihttp.get('https://localhost:7190/api/Users/GetAllAminities')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          this.aminities = response.data.map((data: any) => ({
            AminitieID: data.aminitieID,
            AminitieName: data.name,
            Description: data.description,
            
          }));
        } else {
          console.error('Unexpected response format or no Aminities found');
          this.aminities = [];
        }
      }, error => {
        console.error('Error fetching Aminities:', error);
      });
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  updatedStatus:string='';
  updatedStatusSubmited:boolean=false;
  viewReviewClicked:boolean=false;
  AddNewClicked:boolean=false;

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
          // Map the response directly to the desired format
          this.reviewdetails = {
            ID: response.id || 'N/A',  // Default value if undefined
            propertyID: response.propID || 'N/A',  // Default value if undefined
            userID: response.userID || 'N/A',  // Default value if undefined
            username: response.username || 'Unknown User',  // Default value if undefined
            useremail: response.useremail || 'Email not available',  // Default value if undefined
            usernumber: response.usernumber || 'Phone number not available',  // Default value if undefined
            usermessage: response.usermessage || 'Message not available',  // Default value if undefined
            createdDate: response.createdDate ? new Date(response.createdDate) : new Date(),  // Convert to Date object
            status: response.status || 'N/A',  // Default value if undefined
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

  AminitiesSubmit(){
      console.log(this.AminitiesForm);
      const Aminities={
        AminitieName:this.AminitiesForm.get('name').value
      }
      this.apihttp.post("https://localhost:7190/api/Users/InsAminities", Aminities, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe({
        next: (result: any) => {
          if (result.message == "Aminities Added successfully!") {
            this.AminitiesAddedSuccesfull = result.Message; 
            this.messageColor ={red:false,green:true};
          } else {
            this.AminitiesAddedSuccesfull = "Aminities Added failed!"; 
            this.messageColor = {red:true,green:false};
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this.AminitiesAddedSuccesfull=error.error;
          this.messageColor={red:true,green:false};
        },
        complete: () => {
          console.log('Request completed');
        }
      });
    }

    generateAminitieID(){
      this.apihttp.get("https://localhost:7190/api/Users/getautoaminitieID", { responseType: 'text' }).subscribe((response: string) => {
        this.AminitiesForm.patchValue({ id: response });
        console.log(this.AminitiesForm.get('id')?.value);
      }, error => {
        console.error('Error fetching property ID:', error);
      });
    }

    AddNew(){
      this.AddNewClicked=true;
      this.generateAminitieID();
    }
}
