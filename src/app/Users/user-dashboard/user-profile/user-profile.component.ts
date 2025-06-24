import { NgClass, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiServicesService } from '../../../api-services.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule,FormsModule,ReactiveFormsModule,NgClass,NgIf],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  constructor(private apihttp: HttpClient,private router: Router,private apiurls: ApiServicesService,private cdRef: ChangeDetectorRef) {}
  isFormChanged = false;
  ngOnInit(): void {
    this.profileform.reset();
    const UserID = localStorage.getItem('email') as string;
    this.ProfileDeactivatedSuccesful=false;
    this.getProfileDet(UserID);
    this.fetchProfileimage(UserID);
    this.profileform.valueChanges.subscribe(() => {
      this.isFormChanged = this.profileform.dirty;  
    });
  }

  profileform: FormGroup = new FormGroup({
    id: new FormControl(''),
    fname: new FormControl(''),
    lname: new FormControl(''),
    email: new FormControl(''),
    mobile: new FormControl('')
  });


  profilePasswordChangeform: FormGroup = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    ConfirmPassword: new FormControl('', Validators.required)
  }, { validators: this.passwordMatchValidator.bind(this) });
  


  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const oldPassword = control.get('oldPassword')?.value;
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
  
    if (!password || !confirmPassword || !oldPassword) return null;
  
    const errors: any = {};
  
    if (password !== confirmPassword) {
      errors.passwordMismatch = true;
    }
  
    if (oldPassword === password) {
      errors.sameAsOld = true;
    }
  
    return Object.keys(errors).length ? errors : null;
  }
  

  isModalOpen = false;
  ProfileUpdateStatus: boolean = false;
  ProfileDeactivatedSuccesful:boolean=false;
  updateStausMessage:string='';

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; 
      };
      reader.readAsDataURL(file); 
      this.selectedFile = file; 
    }
  }

  getProfileDet(UserID: string) {
    const data = {
      Name: '',
      LastName: '',
      MobileNo: '',
      Email: UserID,      
      Password: '',
      RollId: '2',
      IsActive: '1',
      CreatedBy: '',
      CreatedDate: null,
      CreatedIP: '',
      ModifiedBy: '',
      ModifiedDate: null,
      ModifiedIP: '',
      Flag: '3',         
      Status: '',
      OldPassword: '',
      NewPassword: '',
      FileName: '',
      FilePath: '',
    };
  
    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, (data as any)[key] === null ? '' : (data as any)[key].toString());
      }
    }
    
    this.apiurls.post<any>('Tbl_Users_CRUD_Operations', formData).subscribe(
      (response: any) => {
        if (response && response.data && response.data.length > 0) {
          const user = response.data[0];
          this.profileform.patchValue({
            fname: user.name,
            lname: user.lastName,
            email: user.email,
            mobile: user.mobileNo
          });
          this.initialFormData = this.profileform.getRawValue();
          this.isFormChanged = false;
        } else {
          console.error('No user data found');
        }
      },
      error => {
        console.error('Error fetching profile details:', error);
      }
    );
  }
  
  initialFormData: any;
  checkFormChanged(): boolean {
    if (!this.initialFormData) return false;
    const current = this.profileform.getRawValue();
    return (
      current.fname !== this.initialFormData.fname ||
      current.lname !== this.initialFormData.lname ||
      current.mobile !== this.initialFormData.mobile
    );
  }
  // getProfileDet(UserID: string) {
 
  //   this.apiurls.get<any>(`Tbl_Users_CRUD_Operations`).subscribe(
  //     (response: any) => {
  //       if (response) {
  //         this.profileform.patchValue({
  //           fname: response.name,
  //           lname: response.lastName,
  //           email:response.email,
  //           mobile:response.mobileNo
  //         });
  //       } else {
  //         console.error('Error: Response is null or undefined');
  //       }
  //     },
  //     error => {
  //       console.error('Error fetching review details:', error);
  //     }
  //   );
  // }


  
  updateProfileDet() {
    const UserID = this.profileform.get('email')?.value;
  
    const updatedProfileData = {
      Name: this.profileform.get('fname')?.value ?? '',
      LastName: this.profileform.get('lname')?.value ?? '',
      MobileNo: this.profileform.get('mobile')?.value ?? '',
      Email: UserID ?? '',
      Password: '',
      CreatedBy: '',
      CreatedIP: '',
      CreatedDate: null,
      ModifiedBy: UserID ?? '',
      ModifiedIP: '',
      ModifiedDate: null,
      RollId: '2',
      IsActive: '1',
      Flag: '7', 
      Status: '',
      OldPassword: '',
      NewPassword: '',
      FileName: '',  
      FilePath: ''
    };
  
    const formData = new FormData();
    for (const key in updatedProfileData) {
      if (updatedProfileData.hasOwnProperty(key)) {
        const value = updatedProfileData[key as keyof typeof updatedProfileData];
        formData.append(key, value === null ? '' : value.toString());
      }
    }
  
    this.apiurls.post<any>('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          let msg = response.data[0].Message || response.data[0].Status || 'Profile updated successfully.';
          this.updateStausMessage = msg;
          this.ProfileUpdateStatus = true;
          this.isModalOpen = true;
          this.initialFormData = this.profileform.getRawValue();
          this.isFormChanged = false;
          this.cdRef.detectChanges();
        } else {
          this.updateStausMessage = 'Failed to update profile.';
          this.ProfileUpdateStatus = false;
          this.isModalOpen = true;
        }
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.updateStausMessage = 'Error updating profile.';
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
      }
    });
    
  }
  onProfilePhotoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('files', file, file.name); 
      formData.append('email', this.profileform.get('email')?.value);
      formData.append('Flag', '7');
  
      this.updateProfileImage(formData);
    }
  }


  updateProfileImage(formData: FormData): void {
    this.apiurls.post<any>('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (response) => {
        console.log('Profile Image updated successfully:', response);
        const emailId = this.profileform.get('email')?.value;
        this.fetchProfileimage(emailId);
      },
      error: (error) => {
        console.error('Upload failed:', error);
      }
    });
  }
  
  closeModal() {
    this.isModalOpen = false;
    this.profilePasswordChangeform.reset();
    this.changePasswordClicked = false;
    this.cdRef.detectChanges();
  }

  handleOk() {
    if(this.ProfileDeactivatedSuccesful === true){
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

  // updatePassword(){
  //   const formData = new FormData();
  //   formData.append('OPassword', this.profilePasswordChangeform.get('oldPassword')?.value);
  //   formData.append('NPassword', this.profilePasswordChangeform.get('Password')?.value);
  //   const OPassword=this.profilePasswordChangeform.get('oldPassword')?.value;
  //   const NPassword=this.profilePasswordChangeform.get('Password')?.value;
  //   const UserID=this.profileform.get('email')?.value;

  //   const passwordUpdateUrl = `ChangePassword/${encodeURIComponent(UserID)}?OPassword=${encodeURIComponent(OPassword)}&NPassword=${encodeURIComponent(NPassword)}`;
  //   this.apiurls.put<any>(passwordUpdateUrl, {}).subscribe({
  //     next: (response: any) => {
  //       if (response.statusCode === 200) {
  //         this.updateStausMessage = response.message;
  //         this.profilePasswordChangeform.reset();
  //         this.changePasswordClicked = false;
  //         this.isModalOpen = true;
  //         this.cdRef.detectChanges();
  //       } else {
  //         this.updateStausMessage = response.message;
  //         this.ProfileUpdateStatus = false;
  //         this.isModalOpen = true;

  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error updating password', error);
  //       this.ProfileUpdateStatus = false;
  //       this.isModalOpen = true;
  //     }
  //   });
  // }
  
  updatePassword() {
    const OPassword = this.profilePasswordChangeform.get('oldPassword')?.value;
    const NPassword = this.profilePasswordChangeform.get('Password')?.value;
    const UserID = this.profileform.get('email')?.value;
  
    const formData = new FormData();
    formData.append('Email', UserID);
    formData.append('OldPassword', OPassword);
    formData.append('NewPassword', NPassword);
    formData.append('IsActive', '1');
    formData.append('Flag', '9');
  
    this.apiurls.post<any>('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (response) => {
        const msg = response?.Message || response?.message || '';
  
        if (msg.toLowerCase().includes('old password is incorrect')) {
          this.updateStausMessage = 'Old password is incorrect.';
          this.ProfileUpdateStatus = false;
        } else if (
          (response.StatusCode === 200 || response.statusCode === 200) &&
          msg.toLowerCase().includes('password updated')
        ) {
          this.updateStausMessage = 'Password updated successfully.';
          this.profilePasswordChangeform.reset();
          this.changePasswordClicked = false;
          this.ProfileUpdateStatus = true;
        } else {
          this.updateStausMessage = msg || 'Failed to update password.';
          this.ProfileUpdateStatus = false;
        }
  
        this.isModalOpen = true;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        if (error.status === 400 && error.error?.Message?.includes('No result')) {
          this.updateStausMessage = 'Old password is incorrect.';
        } else {
          this.updateStausMessage = error.error?.Message || 'Error updating password. Please try again.';
        }
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
        this.cdRef.detectChanges();
      }
    });
  }
  
  
  
 
  deactivateAccount(): void {
    const confirmed = window.confirm("Are you sure you want to deactivate your account?");
    if (!confirmed) return;
  
    const email = this.profileform.get('email')?.value;
  
    const data = {
      Name: '',
      LastName: '',
      MobileNo: '',
      Email: email,
      Password: '',
      CreatedBy: '',
      CreatedDate: null,
      CreatedIP: '',
      ModifiedBy: email,
      ModifiedDate: null,
      ModifiedIP: '',
      RollId: '',
      IsActive: '0',
      Flag: '8',
      OldPassword: '',
      NewPassword: '',
      Status: ''
    };
  
    this.apiurls.post<any>('Tbl_Users_CRUD_Operations', data).subscribe({
      next: (response: any) => {
        if (response && response.statusCode) {
          if (response.statusCode === 200) {
            this.updateStausMessage = response.message || "Deactivated successfully.";
            this.ProfileUpdateStatus = true;
            this.ProfileDeactivatedSuccesful = true;
          } else {
            this.updateStausMessage = response.message || "Failed to deactivate account.";
            this.ProfileUpdateStatus = false;
            this.ProfileDeactivatedSuccesful = false;
          }
        } else {
          console.warn('Unexpected response format.');
          this.updateStausMessage = "Unexpected response from server.";
          this.ProfileUpdateStatus = false;
          this.ProfileDeactivatedSuccesful = false;
        }
        this.isModalOpen = true;
      },
      error: (error) => {
        console.error('Error deactivating account:', error);
        this.updateStausMessage = "An error occurred while deactivating the account.";
        this.ProfileUpdateStatus = false;
        this.ProfileDeactivatedSuccesful = false;
        this.isModalOpen = true;
      }
    });
  }
  
    
  // deactivateAccount(): void {
  //   const email = this.profileform.get('email')?.value;
  //   const url = `DeactivateAccount?email=${email}`;
  //   this.apiurls.put<any>(url, {}).subscribe({
  //     next: (response: any) => {
  //       if (response && response.statusCode) {
  //         if (response.statusCode === 200) { 
  //           this.updateStausMessage = response.message;
  //           this.ProfileUpdateStatus = true;
  //           this.ProfileDeactivatedSuccesful = true;
  //         } else {
  //           this.updateStausMessage = response.message;
  //           this.ProfileUpdateStatus = false;
  //           this.ProfileDeactivatedSuccesful = false;
  //         }
  //         this.isModalOpen = true; 
  //       } else {
  //         console.warn('Unexpected response format.');
  //         this.updateStausMessage = "Unexpected response from server.";
  //         this.ProfileUpdateStatus = false;
  //         this.ProfileDeactivatedSuccesful = false;
  //         this.isModalOpen = true;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error deactivating account:', error);
  //       this.updateStausMessage = "An error occurred while deactivating the account.";
  //       this.ProfileUpdateStatus = false;
  //       this.ProfileDeactivatedSuccesful = false;
  //       this.isModalOpen = true;
  //     }
  //   });
  // }
  
  profilePhotoUrl: string = 'assets/images/usericon.jpg';
  profilePhoto: string[] = [];

  fetchProfileimage(email: string): void {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('Flag', '3'); 
  
    this.apiurls.post<any>('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
  
        const users = response?.data;
        const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
  
        if (user && user.filePath) {
          this.profilePhotoUrl = this.apiurls.getImageUrl(user.filePath);
        } else {
          // this.profilePhotoUrl = '';  
        }
      },
      error: (error) => console.error('Error fetching profile image:', error),
    });
  }
  triggerFileInput(): void {
    document.getElementById('profilePhoto')?.click();
  }


  passwordVisible = false; 
  confirmPasswordVisible = false;  
  
  togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
  }
  
  toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
  
}
