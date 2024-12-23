import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HttpClientModule,FormsModule,ReactiveFormsModule,NgClass,NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
// export class ProfileComponent implements OnInit {
//   constructor(private apihttp: HttpClient) {}

//   ngOnInit(): void {
//     this.profileform.reset();
//   }

//   profileform:FormGroup= new FormGroup({
//     id: new FormControl(''),
//     fname:new FormControl(''),
//     lname:new FormControl(''),
//     email:new FormControl(''),
//     mobile:new FormControl('')
//   })

//   updateProfileDet(){

//   }

//   isModalOpen = false;
//   ProfileUpdateStatus:boolean=false;
//   closeModal() {
//     this.isModalOpen = false;
//   }

//   // Handle "OK" button click
//   handleOk() {
//     this.closeModal();
//   }

//   imagePreview: string | ArrayBuffer | null = null;

//   onFileSelected(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       const reader = new FileReader();

//       reader.onload = () => {
//         this.imagePreview = reader.result; // Set the image preview
//       };

//       reader.readAsDataURL(file); // Read the file as a data URL for preview
//     }
//   }
// }



export class ProfileComponent implements OnInit {

  constructor(private apihttp: HttpClient) {}

  ngOnInit(): void {
    // Initialize the form
    this.profileform.reset();
    const UserID = localStorage.getItem('email') as string;
    this.getProfileDet(UserID);

  }

  // Reactive form setup
  profileform: FormGroup = new FormGroup({
    id: new FormControl(''),
    fname: new FormControl(''),
    lname: new FormControl(''),
    email: new FormControl(''),
    mobile: new FormControl('')
  });

  isModalOpen = false;
  ProfileUpdateStatus: boolean = false; // Flag to control modal status

  // Image preview state
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  // Handle image selection
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; // Set image preview
      };
      reader.readAsDataURL(file); // Convert file to base64 and set for preview
      this.selectedFile = file; // Store the selected file
    }
  }

  getProfileDet(UserID: string) {
    this.apihttp.get(`https://localhost:7190/api/Users/getUserDetailsByID/${UserID}`).subscribe(
      (response: any) => {
        // Ensure response is not null or undefined
        if (response) {
          // Directly patch the form with the response data
          this.profileform.patchValue({
            id: response.propertyTypeID,
            fname: response.name,
            lname: response.lastName,
            email:response.email,
            mobile:response.mobileNo
          });
        } else {
          console.error('Error: Response is null or undefined');
        }
      },
      error => {
        console.error('Error fetching review details:', error);
      }
    );
  }

  // Handle form submission and update profile
  updateProfileDet() {
    const formData = new FormData();
    formData.append('id', this.profileform.get('id')?.value);
    formData.append('fname', this.profileform.get('fname')?.value);
    formData.append('lname', this.profileform.get('lname')?.value);
    formData.append('email', this.profileform.get('email')?.value);
    formData.append('mobile', this.profileform.get('mobile')?.value);

    // Append the profile picture if selected
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    // API call to submit the profile data
    this.apihttp.post("https://your-backend-api-url", formData).subscribe({
      next: (response) => {
        console.log('Profile updated successfully!', response);
        this.ProfileUpdateStatus = true;
        this.isModalOpen = true; // Show the success modal
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true; // Show error modal
      }
    });
  }

  // Handle image upload button click
  uploadImage() {
    if (!this.selectedFile) {
      console.error('No file selected!');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', this.selectedFile, this.selectedFile.name);

    // Call the backend API to upload the image
    this.apihttp.post("https://your-backend-api-url/upload-image", formData).subscribe({
      next: (response) => {
        console.log('Image uploaded successfully', response);
        this.isModalOpen = true;
        this.ProfileUpdateStatus = true;
      },
      error: (error) => {
        console.error('Error uploading image', error);
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
      }
    });
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Handle "OK" button click
  handleOk() {
    this.closeModal();
  }
}
