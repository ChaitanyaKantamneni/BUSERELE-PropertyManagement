import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
  
})
export class ApiServicesService {
  constructor(private http: HttpClient) { }
  // private baseUrl = 'https://localhost:7190/api/Users';
  // private baseUrl = 'https://localhost:7117/api/Employee';
   private baseUrl = 'https://localhost:7039/api/BUsereleProcedures';

  // get<T>(endpoint: string): Observable<T> {
  //   return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  // }

  get<T>(endpoint: string, responseType: 'json' | 'text' = 'json'): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      responseType: responseType as any
    });
  }
 
  
  
  post<T>(endpoint: string, data: any): Observable<T> {
    const isFormData = data instanceof FormData;
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      responseType: 'json'
    });
  }
  
  put<T>(endpoint: string, data: any): Observable<T> {
    const isFormData = data instanceof FormData;
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    });
  }
  
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text' as 'json' 
    });
  }

  getImageUrl(filePath: string): string {
    return filePath ? `https://localhost:7039${filePath}` : 'assets/images/empty.png';
  }

  getviewimage(filePath: string): string {
    return filePath ? `https://localhost:7039${filePath}` : '';
  }


  getImageUrlblog(filePath: string): string {
    return filePath ? `https://localhost:7039${filePath}` : 'assets/images/villa4.jpg';
  }


  // delete<T>(endpoint: string): Observable<T> {
  //   return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // }
  
  // buildQueryParams(params: { [key: string]: string }): string {
  //   return Object.entries(params)
  //     .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val || '')}`)
  //     .join('&');
  // }


   // post<T>(endpoint: string, data: any): Observable<T> {
  //   return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // }

  // post<T>(endpoint: string, data: any): Observable<T> {
  //   const isFormData = data instanceof FormData;
  //   return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
  //     headers: isFormData ? undefined : { 'Content-Type': 'application/json' }
  //   });
  // }
  
  
    // put<T>(endpoint: string, data: any): Observable<T> {
  //   return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // }

}
