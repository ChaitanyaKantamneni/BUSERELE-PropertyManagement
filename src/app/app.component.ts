import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityService } from './inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BUSERELE';
  constructor(private inactivityService: InactivityService,) {}
}
