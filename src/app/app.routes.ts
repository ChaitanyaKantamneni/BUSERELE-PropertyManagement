import { Routes } from '@angular/router';
import { ContactUsComponent } from './Main/contact-us/contact-us.component';
import { AboutUsComponent } from './Main/about-us/about-us.component';
import { SignInComponent } from './Common/sign-in/sign-in.component';
import { SignUpComponent } from './Common/sign-up/sign-up.component';
import { DashboardComponent } from './Masters/dashboard/dashboard.component';
import { ProfileComponent } from './Masters/dashboard/profile/profile.component';
import { MembershipDetComponent } from './Masters/dashboard/membership-det/membership-det.component';
import { SearchPropertiesComponent } from './Main/search-properties/search-properties.component';
import { ViewPropertyComponent } from './Main/view-property/view-property.component';
import { DashboardcomponentComponent } from './Masters/dashboard/dashboardcomponent/dashboardcomponent.component';
import { Home1Component } from './Main/home1/home1.component';
import { Review1Component } from './Masters/dashboard/review1/review1.component';
import { AddAminities1Component } from './Masters/dashboard/add-aminities1/add-aminities1.component';
import { AddPropertyComponentComponent } from './Masters/dashboard/add-property-component/add-property-component.component';
import { ReviewsComponentComponent } from './Main/reviews-component/reviews-component.component';
import { PropertyForComponent } from './Masters/dashboard/property-for/property-for.component';
import { UserDashboardComponent } from './Users/user-dashboard/user-dashboard.component';
import { UserDashboardViewComponent } from './Users/user-dashboard/user-dashboard-view/user-dashboard-view.component';
import { AddPropertyByUserComponent } from './Users/user-dashboard/add-property-by-user/add-property-by-user.component';
import { authGuard } from './auth.guard';
import { userAuthGuard } from './user-auth.guard';
import { ForgotPasswordComponent } from './Common/forgot-password/forgot-password.component';
import { UserProfileComponent } from './Users/user-dashboard/user-profile/user-profile.component';
import { BlogComponentComponent } from './Masters/dashboard/blog-component/blog-component.component';
import { PrivacyComponent } from './Common/privacy/privacy.component';
import { ViewblogComponent } from './viewblog/viewblog.component';
import { WhichlistComponent } from './whichlist/whichlist.component';
import { ViewpropertydashboardComponent } from './Masters/dashboard/viewpropertydashboard/viewpropertydashboard.component';
import { ViewuserdashboardComponent } from './Users/user-dashboard/viewuserdashboard/viewuserdashboard.component';
import { UserwhichlistComponent } from './Users/user-dashboard/userwhichlist/userwhichlist.component';
import { UserpropertiesComponent } from './Masters/dashboard/userproperties/userproperties.component';


export const routes: Routes = [
    //{path:'',component:HomeComponent},
    //{path:'home',component:HomeComponent},
    {path:'contact-us',component:ContactUsComponent},
    {path:'about-us',component:AboutUsComponent},
    {path:'signin',component:SignInComponent},
    {path:'sign-up',component:SignUpComponent},
    {path:'privacy',component:PrivacyComponent},
    {path:'forgot-password',component:ForgotPasswordComponent},
    {path:'search-properties',component:SearchPropertiesComponent},
    {path:'search-properties/:propertyAvailabilityOptions',component:SearchPropertiesComponent},
    {path:'search-properties/:propertyType',component:SearchPropertiesComponent},
    {path: 'search-properties/:propertyType/:keyword', component: SearchPropertiesComponent},
    {path: 'search-properties/:propertyType/:propertyFor/:keyword', component: SearchPropertiesComponent},
    {path: 'search-properties/:propertyType/:propertyFor/:CityName/:keyword', component: SearchPropertiesComponent},    
    {path:'view-property/:propertyID',component:ViewPropertyComponent},
    
    // {path:'viewpropertydashboard/:propertyID',component:ViewpropertydashboardComponent},
    // {path:'viewuserdashboard/:propertyID',component:ViewuserdashboardComponent},

    {path:'view-reviews',component:ReviewsComponentComponent},
    {path:'view-reviews/:reviewID',component:ReviewsComponentComponent},

    {path:'dashboard',component:DashboardComponent,
        canActivate:[authGuard],
        children:
        [
            {path:'',component:DashboardcomponentComponent},
            {path:'amenities',component:AddAminities1Component},
            {path:'profile',component:ProfileComponent},
            {path:'membership-details',component:MembershipDetComponent},
            // {path:'addpropertysample',component:AddpropertysampleComponent},
            {path:'addproperty',component:AddPropertyComponentComponent},
            {path:'dashboarddet',component:DashboardcomponentComponent},
            {path:'userReviews',component:Review1Component},
            {path:'addpropertytype',component:PropertyForComponent},
            {path:'blog',component:BlogComponentComponent},
            {path: 'whichlist', component: WhichlistComponent },
            {path:'view-property/:propertyID',component:ViewpropertydashboardComponent},
            {path: 'user-properties', component: UserpropertiesComponent },

           
        ]
    },
    {path:'UserDashboard',component:UserDashboardComponent,
        canActivate:[userAuthGuard],
        children:
        [
            {path:'',component:UserDashboardViewComponent},
            {path:'profile',component:UserProfileComponent},
            //{path:'membership-details',component:MembershipDetComponent},
            // {path:'addpropertysample',component:AddpropertysampleComponent},
            {path:'UserAddProperty',component:AddPropertyByUserComponent},
            {path:'UserDashboardDet',component:UserDashboardViewComponent},
            {path:'userReviews',component:Review1Component},
            // {path:'descriptions',component:DescriptionComponentComponent}
            {path:'userwhichlist',component:UserwhichlistComponent},
            {path:'viewuserdashboard/:propertyID',component:ViewuserdashboardComponent}

        ]
    },


    {path:'',component:Home1Component},
    {path:'home',component:Home1Component},
    // {path:'blogviewpage',component:BlogComponentComponent},
    //  { path: 'viewblog', component: ViewblogComponent },
     { path: 'viewblog/:id', component: ViewblogComponent },  

];

