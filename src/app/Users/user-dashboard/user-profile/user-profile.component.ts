import { NgClass, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [HttpClientModule,FormsModule,ReactiveFormsModule,NgClass,NgIf],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  constructor(private apihttp: HttpClient,private router: Router) {}

  ngOnInit(): void {
    // Initialize the form
    this.profileform.reset();
    const UserID = localStorage.getItem('email') as string;
    this.ProfileDeactivatedSuccesful=false;
    this.getProfileDet(UserID);
    this.fetchProfileimage(UserID);
  }

  // Reactive form setup
  profileform: FormGroup = new FormGroup({
    id: new FormControl(''),
    fname: new FormControl(''),
    lname: new FormControl(''),
    email: new FormControl(''),
    mobile: new FormControl('')
  });

  profilePasswordChangeform:FormGroup=new FormGroup({
    oldPassword:new FormControl(''),
    Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    ConfirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator })

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  }

  isModalOpen = false;
  ProfileUpdateStatus: boolean = false;
  ProfileDeactivatedSuccesful:boolean=false;
  updateStausMessage:string='';

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
            // id: response.propertyTypeID,
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
    const updatedProfileData = {
      name: this.profileform.get('fname')?.value, 
      lastName: this.profileform.get('lname')?.value,
      mobileNo: this.profileform.get('mobile')?.value,
      createdBy: null,
      createdIP: null,
      createdDate:null,
      modifiedBy: null,
      modifiedIP: null,
      modifiedDate:null
    };
    const UserID=this.profileform.get('email')?.value;

    this.apihttp.put(`https://localhost:7190/api/Users/ChangeProfileDet/${UserID}`, updatedProfileData, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response:any) => {
        if(response.statusCode="200"){
          this.updateStausMessage=response.message;
          this.ProfileUpdateStatus = true;
          this.isModalOpen = true;
        }
        else{
          this.updateStausMessage=response.message;
          this.ProfileUpdateStatus = false;
          this.isModalOpen = true;
        }
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
      }
    });
  }


  onProfilePhotoChange(event: any): void {
    const file = event.target.files[0];  
    if (file) {
      const formData = new FormData();
      formData.append('images', file, file.name);  
      formData.append('email', this.profileform.get('email')?.value);  
  
      this.updateProfileImage(formData);
    }
  }
  // Handle image upload button click
  updateProfileImage(formData: FormData): void {
    const emailId: string = this.profileform.get('email')?.value;
    this.apihttp.put(`https://localhost:7190/api/Users/updateProfileimage/${emailId}`, formData).subscribe(
      (response) => {
        console.log('Profile Image updated successfully:', response);
        this.fetchProfileimage(emailId); 
      },
      (error) => {
        console.error('Upload failed:', error);
      }
    );
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Handle "OK" button click
  handleOk() {
    if(this.ProfileDeactivatedSuccesful==true){
      this.router.navigate(['/signin'])
      localStorage.clear();
      this.closeModal();
    }
    else{
      this.closeModal();
    }
  }

  changePasswordClicked:boolean=false;
  changepassword(){
    this.changePasswordClicked=true;
  }

  updatePassword(){
    const formData = new FormData();
    formData.append('OPassword', this.profilePasswordChangeform.get('oldPassword')?.value);
    formData.append('NPassword', this.profilePasswordChangeform.get('Password')?.value);

    const OPassword=this.profilePasswordChangeform.get('oldPassword')?.value;
    const NPassword=this.profilePasswordChangeform.get('Password')?.value;
    const UserID=this.profileform.get('email')?.value;

    this.apihttp.put(`https://localhost:7190/api/Users/ChangePassword/${encodeURIComponent(UserID)}?OPassword=${encodeURIComponent(OPassword)}&NPassword=${encodeURIComponent(NPassword)}`,{}).subscribe({
      next: (response:any) => {
        if(response.statusCode="200"){
          this.updateStausMessage=response.message;
          this.ProfileUpdateStatus = true;
          this.isModalOpen = true;
        }
        else{
          this.updateStausMessage=response.message;
          this.ProfileUpdateStatus = false;
          this.isModalOpen = true;
        }
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
      }
    });
  }
  
  deactivateAccount(): void{
    const email=this.profileform.get('email')?.value;
    const url = `https://localhost:7190/api/Users/DeactivateAccount/${email}`;
    this.apihttp.put<any>(url,{}).subscribe({
      next: (response:any) => {
        if (response && response.statusCode) {
          if(response.statusCode="200"){
            this.updateStausMessage=response.message;
            this.ProfileUpdateStatus = true;
            this.ProfileDeactivatedSuccesful=true;
            this.isModalOpen = true;
          }
          else{
            this.updateStausMessage=response.message;
            this.ProfileUpdateStatus = false;
            this.ProfileDeactivatedSuccesful=false;
            this.isModalOpen = true;
          }
        } else {
          console.warn('Profile image not found.');
        }
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.ProfileUpdateStatus = false;
        this.ProfileDeactivatedSuccesful=false;
        this.isModalOpen = true;
      }
    })
  }

  profilePhotoUrl: string = 'assets/images/usericon.jpg';
  profilePhoto: string[] = [];

  fetchProfileimage(email: string): void {
    const url = `https://localhost:7190/api/Users/GetProfileimage?email=${email}`;
  
    this.apihttp.get<any>(url).subscribe({
      next: (response) => {
        if (response && response.fileData) {
          const imageUrl = `data:image/jpeg;base64,${response.fileData}`;
          this.profilePhotoUrl = imageUrl;  
        } else {
          console.warn('Profile image not found.');
        }
      },
      error: (error) => console.error('Error fetching profile image:', error),
    });
  }

  triggerFileInput(): void {
    document.getElementById('profilePhoto')?.click();
  }
}
