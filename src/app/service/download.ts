import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, of, throwError } from 'rxjs';
import { catchError, delay, filter, startWith, switchMap } from 'rxjs/operators';

export interface DownloadResponse {
  downloadId(downloadId: any): unknown;
  id: string;
  status: string;
  message: string;
}

export interface DownloadProgress {
  downloadId: string;
  percentage: number;
  status: string;
  speed: string;
  eta: string;
  lastUpdate: number;
}

@Injectable({
  providedIn: 'root',
})
export class Download {
  private apiUrl = 'http://localhost:8080/api/download';

  // private apiUrl = 'https://dlf-fast-downloader-production.up.railway.app/api/download';

  constructor(private http: HttpClient) {}

  getVideoInfo(url: string): Observable<any> {
    const params = new HttpParams().set('url', url);
    return this.http.get<any>(`${this.apiUrl}/info`, { params });
  }

  downloadVideo(url: string, format: string): Observable<DownloadResponse> {
    return this.http.post<DownloadResponse>(`${this.apiUrl}/request`, { url, format });
  }
  getDownloadHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  getTrackingProgress(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/progress/${id}`);
  }

  getDownloadProgress(downloadId: string): Observable<DownloadProgress> {
    return this.http.get<DownloadProgress>(`${this.apiUrl}/progress/${downloadId}`).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        return throwError(
          () => new Error(error.error?.error || error.message || 'Failed to get progress')
        );
      })
    );
  }

  pollDownloadProgress(downloadId: string): Observable<DownloadProgress> {
    return interval(1000).pipe(
      startWith(0),
      switchMap(() => this.getDownloadProgress(downloadId)),
      filter((progress) => !!progress)
    );
  }
}
