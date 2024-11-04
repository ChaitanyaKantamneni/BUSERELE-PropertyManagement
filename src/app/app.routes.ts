import { Routes } from '@angular/router';
import { HomeComponent } from './Main/home/home.component';
import { ContactUsComponent } from './Main/contact-us/contact-us.component';
import { AboutUsComponent } from './Main/about-us/about-us.component';
import { SignInComponent } from './Common/sign-in/sign-in.component';
import { SignUpComponent } from './Common/sign-up/sign-up.component';
export const routes: Routes = [
    {path:'',component:HomeComponent},
    {path:'home',component:HomeComponent},
    {path:'contact-us',component:ContactUsComponent},
    {path:'about-us',component:AboutUsComponent},
    {path:'signup',component:SignUpComponent},
    {path:'signin',component:SignInComponent}
];
