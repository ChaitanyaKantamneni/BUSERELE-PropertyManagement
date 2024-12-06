import { Component } from '@angular/core';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [TopNav1Component, FooterComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {

}
