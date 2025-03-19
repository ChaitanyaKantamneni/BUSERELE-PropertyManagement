import { Component } from '@angular/core';
import { FooterComponent } from '../../Main/footer/footer.component';
import { TopNav1Component } from '../../Main/top-nav-1/top-nav-1.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [FooterComponent,TopNav1Component],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent {

}
