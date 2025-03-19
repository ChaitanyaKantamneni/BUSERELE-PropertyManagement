import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const router=inject(Router)
  const Email=localStorage.getItem('email');
  const userRole = localStorage.getItem('RollID');
  const lastActivityTime = localStorage.getItem('lastActivityTime');
  
  
  const TIMEOUT = 10 * 60 * 1000; 
  console.log('userAuthGuard check:', Email, userRole);
  if(Email && userRole=="2"){
    if (lastActivityTime && (Date.now() - parseInt(lastActivityTime, 10)) > TIMEOUT) {
      localStorage.clear();
      router.navigate(['/signin']);
      return false;
    }  
    return true;
  }
  else{
    localStorage.clear();
    router.navigate(['/signin'])
    return false;
  }

};
