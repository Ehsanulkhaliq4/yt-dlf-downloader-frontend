import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Download, DownloadProgress } from '../../service/download';
import { MatCardModule } from '@angular/material/card';
import { catchError, interval, of, Subscription, switchMap, takeWhile } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-progress-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './progress-dialog.html',
  styleUrl: './progress-dialog.css',
})
export class ProgressDialogComponent implements OnInit, OnDestroy {
  progress: DownloadProgress = {
    downloadId: '',
    percentage: 0,
    status: 'Starting...',
    speed: '0 KiB/s',
    eta: '00:00',
    lastUpdate: Date.now(),
  };
  isLoading = true;
  private progressSubscription!: Subscription;
  private readonly POLLING_INTERVAL = 1000;

  constructor(
    public dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { downloadId: string },
    private downloadService: Download
  ) {}

  ngOnInit(): void {
    this.startProgressPolling();
  }

  ngOnDestroy(): void {
    this.stopProgressPolling();
  }

  private startProgressPolling(): void {
    this.progressSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        switchMap(() => {
          return this.downloadService.getDownloadProgress(this.data.downloadId).pipe(
            catchError((error) => {
              return of({
                ...this.progress,
                status: 'ERROR: ' + error.message,
                percentage: 0,
              });
            })
          );
        }),
        takeWhile((progress) => progress.percentage < 100, true) // Continue until 100%
      )
      .subscribe({
        next: (progress) => {
          this.isLoading = false;
          this.progress = progress;
          // Update dialog title when completed
          if (progress.percentage >= 100) {
            // Auto-close after 3 seconds when completed
            setTimeout(() => {
              this.dialogRef.close('completed');
            }, 3000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.progress.status = 'ERROR: Failed to get updates';
        },
      });
  }
  private stopProgressPolling(): void {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  getProgressColor(): string {
    if (this.progress.percentage >= 100) return 'primary';
    if (this.progress.status.includes('ERROR')) return 'warn';
    return 'accent';
  }

  getStatusIcon(): string {
    if (this.progress.percentage >= 100) return 'check_circle';
    if (this.progress.status.includes('ERROR')) return 'error';
    if (this.progress.status.includes('Downloading')) return 'downloading';
    return 'pending';
  }

  getStatusColor(): string {
    if (this.progress.percentage >= 100) return 'success';
    if (this.progress.status.includes('ERROR')) return 'warn';
    return 'accent';
  }

  formatTime(epochTime: number): string {
    return new Date(epochTime).toLocaleTimeString();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
