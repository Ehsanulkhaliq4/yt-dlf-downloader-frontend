import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DownloadResponse {
  id: string;
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class Download {

  private apiUrl = 'http://localhost:8080/api/download';

   constructor(private http: HttpClient) { }

   getVideoInfo(url: string): Observable<any> {
    console.log(`Fetching video info for URL: ${url}`);
     const params = new HttpParams().set('url', url);
     return this.http.get<any>(`${this.apiUrl}/info`, { params });
   }

     downloadVideo(url: string, format: string): Observable<DownloadResponse> {
    // Simulate API call
    return of({
      id: 'dl-' + Date.now(),
      status: 'started',
      message: 'Download initiated successfully'
    }).pipe(delay(1000));
  }

   getDownloadProgress(id: string): Observable<any> {
    // Simulate progress updates
    const progress = Math.min(100, Math.floor(Math.random() * 30) + 10);
    return of({
      progress,
      status: progress < 100 ? 'Downloading...' : 'Complete',
      downloadUrl: progress === 100 ? '/assets/sample.txt' : null
    }).pipe(delay(1500));
  }
  getDownloadHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
}
