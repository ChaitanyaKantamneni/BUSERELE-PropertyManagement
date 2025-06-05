import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ApiServicesService } from '../../../api-services.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule,FormsModule,ReactiveFormsModule,NgClass,NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  isFormChanged = false;
  isModalOpen = false;
  ProfileUpdateStatus: boolean = false;
  updateStausMessage:string='';
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  passwordVisible = false;  
  confirmPasswordVisible = false;  
  profilePhoto: string[] = [];
  changePasswordClicked:boolean=false;
  profilePhotoUrl: string = 'assets/images/usericon.jpg';

  constructor(private apihttp: HttpClient,private apiurls: ApiServicesService,private cdRef: ChangeDetectorRef) {}
 
  ngOnInit(): void {
    this.profileform.reset();
    const UserID = localStorage.getItem('email') as string;
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

  // profilePasswordChangeform:FormGroup=new FormGroup({
  //   oldPassword:new FormControl(''),
  //   Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  //   ConfirmPassword: new FormControl('', [Validators.required])
  // }, { validators: this.passwordMatchValidator })

  // passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  //   const password = control.get('Password')?.value;
  //   const confirmPassword = control.get('ConfirmPassword')?.value;
  //   return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  // }

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
  // profilePasswordChangeform: FormGroup = new FormGroup({
  //   oldPassword: new FormControl(''),
  //   Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  //   ConfirmPassword: new FormControl('', [Validators.required])
  // }, { validators: this.passwordMatchValidator });
  

  // passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  //   const password = control.get('Password')?.value;
  //   const confirmPassword = control.get('ConfirmPassword')?.value;
  //   if (!password || !confirmPassword) {
  //     return null;
  //   }
  //   return password === confirmPassword ? null : { passwordMismatch: true };
  // }
  

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
    this.apiurls.get<any>(`getUserDetailsByID/${UserID}`).subscribe(
      (response: any) => {
        if (response) {
          this.profileform.patchValue({
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

  updateProfileDet() {
    const updatedProfileData = {
      name: this.profileform.get('fname')?.value, 
      lastName: this.profileform.get('lname')?.value,
      mobileNo: this.profileform.get('mobile')?.value,
      createdBy: null,
      createdIP: null,
      createdDate:null,
      modifiedBy: localStorage.getItem('email') as string,
      modifiedIP: null,
      modifiedDate:null
    };
    const UserID=this.profileform.get('email')?.value;

    // this.apihttp.put(`https://localhost:7190/api/Users/ChangeProfileDet/${UserID}`, updatedProfileData, {
    //   headers: { 'Content-Type': 'application/json' }
    // }).subscribe({
    //   next: (response:any) => {
    //     if(response.statusCode="200"){
    //       this.updateStausMessage=response.message;
    //       this.ProfileUpdateStatus = true;
    //       this.isModalOpen = true;

    this.apiurls.put<{ message: string; statusCode: number }>(`ChangeProfileDet/${UserID}`, updatedProfileData)
    .subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.updateStausMessage = response.message;
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
  updateProfileImage(formData: FormData): void {
    const emailId: string = this.profileform.get('email')?.value;
    // this.apihttp.put(`https://localhost:7190/api/Users/updateProfileimage/${emailId}`, formData).subscribe(
    //   (response) => {
    //     console.log('Profile Image updated successfully:', response);
    //     this.fetchProfileimage(emailId); 
    //   },
    //   (error) => {
    //     console.error('Upload failed:', error);
    //   }
    // );
    
    this.apiurls.put<any>(`updateProfileimage/${emailId}`, formData).subscribe({
      next: (response) => {
        console.log('Profile Image updated successfully:', response);
        this.fetchProfileimage(emailId);  
      },
      error: (error) => {
        console.error('Upload failed:', error);
      }
    }
  );
  }
  closeModal() {
    this.isModalOpen = false;
    this.profilePasswordChangeform.reset();
    this.changePasswordClicked = false;
    this.cdRef.detectChanges();
  }

  handleOk() {
    this.closeModal();
  }

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

    // this.apihttp.put(`https://localhost:7190/api/Users/ChangePassword/${encodeURIComponent(UserID)}?OPassword=${encodeURIComponent(OPassword)}&NPassword=${encodeURIComponent(NPassword)}`,{}).subscribe({
    //   next: (response:any) => {
    //     if(response.statusCode="200"){
    //       this.updateStausMessage=response.message;
    //       this.ProfileUpdateStatus = true;
    //       this.isModalOpen = true;
    //     }
    //     else{
    //       this.updateStausMessage=response.message;
    //       this.ProfileUpdateStatus = false;
    //       this.isModalOpen = true;
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error updating profile', error);
    //     this.ProfileUpdateStatus = false;
    //     this.isModalOpen = true;
    //   }
    // });

    const passwordUpdateUrl = `ChangePassword/${encodeURIComponent(UserID)}?OPassword=${encodeURIComponent(OPassword)}&NPassword=${encodeURIComponent(NPassword)}`;
    this.apiurls.put<any>(passwordUpdateUrl, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.updateStausMessage = response.message;
          this.ProfileUpdateStatus = true;
          this.isModalOpen = true;
          this.cdRef.detectChanges();
        } else {
          this.updateStausMessage = response.message;
          this.ProfileUpdateStatus = false;
          this.isModalOpen = true;
        }
      },
      error: (error) => {
        console.error('Error updating password', error);
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
      }
    });
  
  }
  
  deactivateAccount(email: string): void{
    // const url = `https://localhost:7190/api/Users/DeactivateAccount?email=${email}`;
    // this.apihttp.put(url,{}).subscribe({
    //   next: (response:any) => {
    //     if (response && response.statusCode) {
    //       if(response.statusCode="200"){
    //         this.updateStausMessage=response.message;
    //         this.ProfileUpdateStatus = true;
    //         this.isModalOpen = true;

    const url = `DeactivateAccount?email=${email}`;
    this.apiurls.put<any>(url, {}).subscribe({
      next: (response: any) => {
        if (response && response.statusCode) {
          if (response.statusCode === 200) {
            this.updateStausMessage = response.message;
            this.ProfileUpdateStatus = true;
            this.isModalOpen = true;
          }
          else{
            this.updateStausMessage=response.message;
            this.ProfileUpdateStatus = false;
            this.isModalOpen = true;
          }
        } else {
          console.warn('Profile image not found.');
        }
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.ProfileUpdateStatus = false;
        this.isModalOpen = true;
      }
    })
  }

  

  fetchProfileimage(email: string): void {
    // const url = `https://localhost:7190/api/Users/GetProfileimage?email=${email}`;
  
    // this.apihttp.get<any>(url).subscribe({
    //   next: (response) => {
    //     if (response && response.fileData) {
    //       const imageUrl = `data:image/jpeg;base64,${response.fileData}`;
    //       this.profilePhotoUrl = imageUrl;  
    
    const url = `GetProfileimage?email=${email}`;
    this.apiurls.get<any>(url).subscribe({
      next: (response: any) => {
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


  togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
  }
  
  toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

}
