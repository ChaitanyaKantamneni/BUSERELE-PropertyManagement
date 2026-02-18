import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'

})
export class ApiServicesService {
  api_url:any;
  api_img_url:any;
  constructor(private http: HttpClient) {
    this.api_url = environment.baseUrl;
    this.api_img_url =environment.imgUrl;
  }

  get<T>(endpoint: string, responseType: 'json' | 'text' = 'json'): Observable<T> {
    return this.http.get<T>(`${this.api_url}/${endpoint}`, {
      responseType: responseType as any
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const isFormData = data instanceof FormData;
    return this.http.post<T>(`${this.api_url}/${endpoint}`, data, {
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      responseType: 'json'
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const isFormData = data instanceof FormData;
    return this.http.put<T>(`${this.api_url}/${endpoint}`, data, {
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.api_url}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text' as 'json'
    });
  }

  getImageUrl(filePath: string): string {
    return filePath ? `${this.api_img_url}=${encodeURIComponent(filePath)}` : 'assets/images/empty.png';
  }

  getviewimage(filePath: string): string {
    return filePath ? `${this.api_img_url}=${encodeURIComponent(filePath)}` : '';
  }

  getImageUrlblog(filePath: string): string {
    return filePath ? `${this.api_img_url}=${encodeURIComponent(filePath)}` : 'assets/images/villa4.jpg';
  }

}
