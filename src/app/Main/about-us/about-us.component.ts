import { Component, ElementRef } from '@angular/core';
import { TopNav1Component } from "../top-nav-1/top-nav-1.component";
import { FooterComponent } from "../footer/footer.component";
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeResourceUrl,DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [TopNav1Component, FooterComponent,RouterLink,ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  constructor(private el: ElementRef, private sanitizer: DomSanitizer) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/EFB33r7u4tY?autoplay=1');
  }

  ngAfterViewInit() {
    this.animateNumbers();
  }

  animateNumbers() {
    const statItems: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.stat-item .value');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const finalValue = parseInt(target.textContent || "0", 10);
          let startValue = 0;
          const duration = 2000; 
          const interval = 10;
          const increment = (finalValue / (duration / interval));
  
          const counter = setInterval(() => {
            startValue += increment;
            if (startValue >= finalValue) {
              target.textContent = finalValue.toString();
              clearInterval(counter);
            } else {
              target.textContent = Math.floor(startValue).toString();
            }
          }, interval);
  
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });
  
    statItems.forEach((stat: HTMLElement) => observer.observe(stat));
  }
  
  videoLoaded = false;
  videoPlaying = false;
  videoUrl: SafeResourceUrl;

  playVideo() {
    this.videoPlaying = true;
  }

  

}
