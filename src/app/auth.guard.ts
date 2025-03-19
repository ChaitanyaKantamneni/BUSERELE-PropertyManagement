

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const Email = localStorage.getItem('email');
  const userRole = localStorage.getItem('RollID');
  const lastActivityTime = localStorage.getItem('lastActivityTime');
  
  const TIMEOUT = 10 * 60 * 1000;
  
  if (Email && userRole === "1") {
    if (lastActivityTime && (Date.now() - parseInt(lastActivityTime, 10)) > TIMEOUT) {
      localStorage.clear();
      router.navigate(['/signin']);
      return false;
    }
    return true;
  } else {
    localStorage.clear();
    router.navigate(['/signin']);
    return false;
  }
};

