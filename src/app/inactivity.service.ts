
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  private inactivityTimer: any;
  private readonly TIMEOUT = 10 * 60 * 1000; 

  constructor(private router: Router) {
    this.resetTimer();
    this.setupActivityListeners();
    // this.setupBeforeUnloadListener();
  }

  private setupActivityListeners() {
    document.addEventListener('mousemove', () => this.resetTimer());
    document.addEventListener('keydown', () => this.resetTimer());
    document.addEventListener('click', () => this.resetTimer());
  }

//   private setupBeforeUnloadListener() {
//     window.addEventListener('beforeunload', () => this.logout());
//   }

  private resetTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => this.logout(), this.TIMEOUT);
    localStorage.setItem('lastActivityTime', Date.now().toString());
  }

  private logout() {
    localStorage.clear();
    this.router.navigate(['/signin']);
  }
}

