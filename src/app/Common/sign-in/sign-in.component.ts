import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf,NgFor} from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from "../../Main/footer/footer.component";
import { ApiServicesService } from '../../api-services.service';

interface navlists{
  navname:string,
  navurl:string
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  providers: [ApiServicesService],
  imports: [ReactiveFormsModule, NgClass, NgIf, HttpClientModule, RouterLink,FooterComponent,NgFor],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  constructor(public http: HttpClient, public routes: Router,private apiurls: ApiServicesService) {}

  ngOnInit(): void {
    localStorage.clear();
    this.generateCaptcha(); 
    this.addSessionTimeoutListeners();
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

  generateCaptcha(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.captchaCode = captcha;
    this.drawCaptcha();
  }


  drawCaptcha(): void {
    const canvas: HTMLCanvasElement = document.getElementById('captchaCanvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 220;  
      canvas.height = 70; 
      context.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#6a11cb');
      gradient.addColorStop(1, '#2575fc');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      // this.addBackgroundNoise(context, canvas);
  
      context.font = 'bold 45px "Arial Black", Gadget, sans-serif';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
  
      const charSpacing = canvas.width / (this.captchaCode.length + 1);
  
      for (let i = 0; i < this.captchaCode.length; i++) {
        const char = this.captchaCode.charAt(i);
        const charGradient = context.createLinearGradient(0, 0, 0, canvas.height);
        charGradient.addColorStop(0, this.getRandomColor());
        charGradient.addColorStop(1, this.getRandomColor());
        context.fillStyle = charGradient;
  
        const x = charSpacing * (i + 1);
        const y = canvas.height / 2;
  
        const angle = (Math.random() - 0.5) * Math.PI / 8; 
  
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.fillText(char, 0, 0);
        context.restore();
      }
  
      this.addRandomLines(context, canvas); 
    }
  }
  
// drawCaptcha(): void {
//   const canvas: HTMLCanvasElement = document.getElementById('captchaCanvas') as HTMLCanvasElement;
//   const context = canvas.getContext('2d');
//   if (context) {
//     canvas.width = 200;  
//     canvas.height = 60;  
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     this.addBackgroundNoise(context, canvas);
//     context.fillStyle = this.getRandomColor();
//     context.fillRect(0, 0, canvas.width, canvas.height);
//     context.font = '40px Arial';
//     context.textBaseline = 'middle';
//     for (let i = 0; i < this.captchaCode.length; i++) {
//       const char = this.captchaCode.charAt(i);
//       context.fillStyle = this.getRandomColor();
//       const x = 30 + i * 30 + Math.random() * 5;  
//       const y = 30 + Math.random() * 10; 
//       const angle = (Math.random() - 0.5) * Math.PI / 5; 
//       context.save();
//       context.translate(x, y);
//       context.rotate(angle);
//       context.fillText(char, 0, 0);  
//       context.restore();
//     }
//     this.addRandomLines(context, canvas);
//   }
// }

// getRandomColor(): string {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }


getRandomColor(): string {
  const h = Math.floor(Math.random() * 360); 
  const s = 70 + Math.random() * 30;  
  const l = 30 + Math.random() * 30;  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// addBackgroundNoise(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
//   const numDots = 30;
//   for (let i = 0; i < numDots; i++) {
//     const x = Math.random() * canvas.width;
//     const y = Math.random() * canvas.height;
//     context.beginPath();
//     context.arc(x, y, 2, 0, Math.PI * 2);
//     context.fillStyle = this.getRandomColor();
//     context.fill();
//   }
// }

addRandomLines(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const numLines = 5;
  for (let i = 0; i < numLines; i++) {
    const x1 = Math.random() * canvas.width;
    const y1 = Math.random() * canvas.height;
    const x2 = Math.random() * canvas.width;
    const y2 = Math.random() * canvas.height;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = this.getRandomColor();
    context.lineWidth = 1;
    context.stroke();
  }
}

  validateCaptcha(): void {
    const enteredCaptcha = this.LoginForms.get('captcha')?.value;
    this.captchaValid = enteredCaptcha === this.captchaCode;
  }
  refreshCaptcha(): void {
    this.generateCaptcha(); 
  }


  LoginForms: any = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    captcha: new FormControl()
  });

  captchaCode: string = '';  
  captchaValid: boolean = false; 

  public loginsuccesfull: boolean = false;
  public LoginStatus: string = "";
  public color = { red: false, green: false };
  public RollID:string="";

  

  get form() {
    return this.LoginForms.controls;
  }


  loginform() {
    this.validateCaptcha();  
  
    if (!this.captchaValid) {
      this.propertyInsStatus = 'CAPTCHA is incorrect. Please try again!';
      this.isUpdateModalOpen = true;
      return;
    }

    const data = {
      Email: this.LoginForms.get('email')?.value,
      Password: this.LoginForms.get('password')?.value,
      Flag: '4',
  
      Name: '',
      LastName: '',
      MobileNo: '',
      CreatedBy: '',
      CreatedIP: '',
      CreatedDate: '',
      ModifiedBy: '',
      ModifiedIP: '',
      ModifiedDate: '',
      RollId: '',
      IsActive: '',
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
  
    this.loginsuccesfull = true;
  
    this.apiurls.post('Tbl_Users_CRUD_Operations', formData).subscribe({
      next: (result: any) => {
        if (!result?.data || result.data.length === 0) {
          this.propertyInsStatus = "Login Failed. Please try again!";
          this.color = { red: true, green: false };
          this.routes.navigate(['/signin']);
          return;
        }
  
        const userData = result.data[0];
  
        this.propertyInsStatus = result.message || "Login Successful!";
        this.color = { red: false, green: true };
  
        const email = this.LoginForms.get('email')?.value;
  
        if (userData.rollId === "1") {
          this.RollID = "1";
          localStorage.setItem("email", email);
          localStorage.setItem("RollID", this.RollID);
          this.routes.navigate(['/dashboard']);
        } else if (userData.rollId === "2") {
          this.RollID = "2";
          localStorage.setItem("email", email);
          localStorage.setItem("RollID", this.RollID);
          this.routes.navigate(['/UserDashboard']);
        } else {
          this.propertyInsStatus = "Login Failed. Please try again!";
          this.color = { red: true, green: false };
          this.routes.navigate(['/signin']);
        }
      },
      error: (error) => {
        this.propertyInsStatus = error?.error?.message || "Login failed due to server error.";
        this.color = { red: true, green: false };
        this.isUpdateModalOpen = true;
      },
      complete: () => {
      }
    });
  }
  
  
  isUpdateModalOpen: boolean = false;
  propertyInsStatus: string = ''; 

  handleOk() {
    this.isUpdateModalOpen = false;
  }
  
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }
  
  private addSessionTimeoutListeners(): void {
    let sessionTimeoutId: any;
    // const sessionTimeoutDuration = 30 * 60 * 1000; 
    const sessionTimeoutDuration = 15 * 60 * 1000;

    const resetSessionTimeout = () => {
      clearTimeout(sessionTimeoutId);
      sessionTimeoutId = setTimeout(() => {
        localStorage.clear();
      }, sessionTimeoutDuration);
    };

    window.addEventListener('click', resetSessionTimeout);
    window.addEventListener('keydown', resetSessionTimeout);
    resetSessionTimeout();
  }

  passwordVisible: boolean = false;
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible; 
  }


}

