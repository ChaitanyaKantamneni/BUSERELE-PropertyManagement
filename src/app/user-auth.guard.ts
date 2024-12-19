import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const router=inject(Router)
  const Email=localStorage.getItem('email');
  const userRole = localStorage.getItem('RollID');

  console.log('userAuthGuard check:', Email, userRole);
  if(Email && userRole=="2"){
    return true;
  }
  else{
    router.navigate(['/signin'])
    return false;
  }
};
