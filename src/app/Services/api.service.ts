import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public url:any="https://localhost:7190/api/Users/"
  constructor(public http:HttpClient) { }

  newregistration(data:any){
   return this.http.post( this.url+"ins_users",data,{headers: { 'Content-Type': 'application/json' }})
  }

  logincheck(data:any){
    return this.http.post(this.url+"login",data,{headers:{ 'Content-Type': 'application/json' }})

  }

  
}
