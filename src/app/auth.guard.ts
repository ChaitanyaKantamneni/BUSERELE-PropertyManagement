import { inject } from '@angular/core';
import { CanActivateFn,Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router=inject(Router)
  const Email=localStorage.getItem('email');
  const userRole = localStorage.getItem('RollID');

  console.log('authGuard check:', Email, userRole);
  if(Email && userRole=="1"){
    return true;
  }
  else{
    router.navigate(['/signin'])
    return false;
  }
  
};
