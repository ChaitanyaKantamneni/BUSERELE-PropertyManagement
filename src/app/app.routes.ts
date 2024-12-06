import { Routes } from '@angular/router';
import { HomeComponent } from './Main/home/home.component';
import { ContactUsComponent } from './Main/contact-us/contact-us.component';
import { AboutUsComponent } from './Main/about-us/about-us.component';
import { SignInComponent } from './Common/sign-in/sign-in.component';
import { SignUpComponent } from './Common/sign-up/sign-up.component';
import { DashboardComponent } from './Masters/dashboard/dashboard.component';
import { ProfileComponent } from './Masters/dashboard/profile/profile.component';
import { MembershipDetComponent } from './Masters/dashboard/membership-det/membership-det.component';
import { AddAmenitiesComponent } from './Masters/dashboard/add-amenities/add-amenities.component';
import { AddpropertysampleComponent } from './Masters/dashboard/addpropertysample/addpropertysample.component';
import { SearchPropertiesComponent } from './Main/search-properties/search-properties.component';
import { ViewPropertyComponent } from './Main/view-property/view-property.component';
import { DashboardcomponentComponent } from './Masters/dashboard/dashboardcomponent/dashboardcomponent.component';
import { Home1Component } from './Main/home1/home1.component';


export const routes: Routes = [
    //{path:'',component:HomeComponent},
    //{path:'home',component:HomeComponent},
    {path:'contact-us',component:ContactUsComponent},
    {path:'about-us',component:AboutUsComponent},
    {path:'signin',component:SignInComponent},
    {path:'sign-up',component:SignUpComponent},
    {path:'search-properties',component:SearchPropertiesComponent},
    {path:'search-properties/:propertyType',component:SearchPropertiesComponent},
    { path: 'search-properties/:propertyType/:keyword', component: SearchPropertiesComponent},
    {path:'view-property/:propertyID',component:ViewPropertyComponent},
    {path:'dashboard',component:DashboardComponent,
        children:
        [
            {path:'',component:DashboardcomponentComponent},
            {path:'amenities',component:AddAmenitiesComponent},
            {path:'profile',component:ProfileComponent},
            {path:'membership-details',component:MembershipDetComponent},
            {path:'addpropertysample',component:AddpropertysampleComponent},
            {path:'dashboarddet',component:DashboardcomponentComponent}
        ]
    },


    {path:'',component:Home1Component},
    {path:'home',component:Home1Component},

];
