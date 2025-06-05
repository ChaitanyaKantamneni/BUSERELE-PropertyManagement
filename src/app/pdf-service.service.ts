import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfServiceService {

  constructor(private http: HttpClient) { }

  getPropertyDetails(propID: string): Observable<any> {
    return this.http.get<any>(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propID}`);
  }

  generatePdf(htmlContent: string): Observable<Blob> {
    return this.http.post<Blob>('https://localhost:7190/api/Users/UsersEnquiryForProperty', htmlContent, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'blob' as 'json'
    });
  }
}
