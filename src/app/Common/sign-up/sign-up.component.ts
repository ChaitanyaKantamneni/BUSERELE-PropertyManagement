import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FooterComponent } from '../../Main/footer/footer.component';
import { ApiServicesService } from '../../api-services.service';

interface navlists{
  navname:string,
  navurl:string
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  providers: [ApiServicesService],
  imports: [HttpClientModule, NgClass, ReactiveFormsModule, NgIf, RouterLink,NgClass,FooterComponent,NgFor],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  signupform!: FormGroup; 
  submited: boolean = false;
  registredsuccesfull: string = '';
  clr = { red: false, green: false }; 
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false; 
  constructor(private http: HttpClient,private router:Router,private apiurls: ApiServicesService) { }

  ngOnInit(): void {
    this.signupform = new FormGroup({
      FirstName: new FormControl('', Validators.required),
       LastName: new FormControl('', Validators.required),
      Mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), 
      Email: new FormControl('', [Validators.required, Validators.email]),
      Password: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$') 
      ]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator });
  }

  public navitems:navlists[]=[{
    navname:'HOME',
    navurl:'/'
  },
  {
    navname:'ABOUT',
    navurl:'/about-us'
  },
  {
    navname:'CONTACT',
    navurl:'/contact-us'
  }
  ];

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { passwordMismatch: true };
  }


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible; 
  }
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible; 
  }

  signup() {
    if (this.signupform.invalid) {
      this.submited = true;
      return;
    }
  
    const data = {
      Name: this.signupform.get('FirstName')?.value,
      LastName: this.signupform.get('LastName')?.value,
      Email: this.signupform.get('Email')?.value,
      MobileNo: this.signupform.get('Mobile')?.value,
      Password: this.signupform.get('Password')?.value,
  
      CreatedBy: this.signupform.get('Email')?.value,
      CreatedDate: new Date().toISOString(), 
      CreatedIP: '',
      ModifiedBy: '',
      ModifiedIP: '',
      ModifiedDate: '',
      RollId: '2',
      IsActive: '1',
      Flag: '1',  
      OldPassword: '',
      NewPassword: '',
      Status: '',
      FileName: '',
      FilePath: ''
    };
  
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, (data as any)[key]);
    });
  
    this.submited = true;
  
    this.apiurls.post('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (result: any) => {
        if (result.statusCode === 200) {
          this.registredsuccesfull = 'Registration Successful!';
          this.clr = { red: false, green: true };
          this.router.navigate(['/signin']);
        } else {
          this.registredsuccesfull = result.message || 'Registration failed!';
          this.clr = { red: true, green: false };
        }
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'An unexpected error occurred.';
        this.registredsuccesfull = errorMessage;
        this.clr = { red: true, green: false };
      }
    });
  }
}
