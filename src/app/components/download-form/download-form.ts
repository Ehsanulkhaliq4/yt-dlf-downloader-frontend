import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Download, DownloadProgress } from '../../service/download';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface VideoFormat {
  id: string;
  quality: string;
  format: string;  // This matches your data - it's "format" not "format"
  size: string;
  fps: number;
  codec: string | null;
  bitrate: string;
}

@Component({
  selector: 'app-download-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIcon,
    MatCardModule,
    MatProgressBarModule,
  ],
  templateUrl: './download-form.html',
  styleUrl: './download-form.css',
})
export class DownloadForm {
  downloadForm: FormGroup;
  isLoading = false;
  videoDetails: any;
  progress: number = 0;
  activeDownloads: Map<string, DownloadProgress> = new Map();
  formats: VideoFormat[] = [];

  constructor(
    private fb: FormBuilder,
    private downloadService: Download,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.downloadForm = this.fb.group({
      url: [
        '',
        [
          Validators.required,
          Validators.pattern('^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$'),
        ],
      ],
      format: [null, Validators.required],
    });

    // Subscribe to URL changes
    this.downloadForm
      .get('url')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: string) => {
        const v = (value || '').toString().trim();
        if (v && this.isYouTubeUrl(v)) {
          this.fetchVideoInfo(v);
        } else {
          this.videoDetails = null;
          this.formats = [];
          this.downloadForm.patchValue({ format: null }, { emitEvent: false });
        }
      });
  }

  private isYouTubeUrl(value: string): boolean {
    return /(?:youtube\.com|youtu\.be)/i.test(value);
  }

  fetchVideoInfo(url?: string): void {
    const targetUrl = (url || this.downloadForm.value.url || '').toString().trim();
    if (!targetUrl) {
      return;
    }

    console.log('[DownloadForm] fetchVideoInfo called with:', targetUrl);
    this.isLoading = true;
    this.downloadService.getVideoInfo(targetUrl).subscribe({
      next: (info) => {
        this.isLoading = false;
        this.videoDetails = info;
        this.formats = (info.formats || []).filter((format: VideoFormat) => {
          const size = (format.size || '').toString().toUpperCase().trim();
          return !(size.startsWith('0') || size === '' || !size);
        });
        if (this.formats.length === 0) {
          this.showError('No downloadable formats available for this video.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showError('Failed to fetch video info. Please check the URL and try again.');
      },
    });
  }

  onSubmit(): void {
    if (this.downloadForm.valid) {
      this.isLoading = true;
      const { url, format } = this.downloadForm.value;
      this.downloadService.downloadVideo(url, format).subscribe({
        next: (response) => {
          this.startProgressPolling(response.downloadId);
          this.showSuccess('Download started successfully!');
          this.isLoading = false;
          this.openProgressDialog(response.downloadId);
        },
        error: (error) => {
          this.isLoading = false;
          this.showError('Failed to start download. Please try again.');
        },
      });
    }
  }

  startProgressPolling(downloadId: any): void {
    // Add initial progress
    this.activeDownloads.set(downloadId, {
      downloadId,
      percentage: 0,
      status: 'Starting download...',
      speed: '0 KiB/s',
      eta: 'Unknown',
      lastUpdate: Date.now(),
    });

    this.downloadService.pollDownloadProgress(downloadId).subscribe({
      next: (progress) => {
        this.activeDownloads.set(downloadId, progress);
        if (progress.percentage >= 100 && Date.now() - progress.lastUpdate > 30000) {
          this.activeDownloads.delete(downloadId);
        }
      },
      error: (error) => {
        const progress = this.activeDownloads.get(downloadId);
        if (progress) {
          progress.status = 'Error polling progress';
          this.activeDownloads.set(downloadId, progress);
        }
      },
    });
  }

  trackProgress(downloadId: string) {
    const interval = setInterval(() => {
      this.downloadService.getTrackingProgress(downloadId).subscribe((res) => {
        this.progress = res.progress;
        if (this.progress >= 100) {
          clearInterval(interval);
        }
      });
    }, 1000);
  }

  openProgressDialog(downloadId: any): void {
    const dialogRef = this.dialog.open(ProgressDialogComponent, {
      width: '550px',
      data: {
        downloadId: downloadId,
      },
      disableClose: false, // Allow users to close manually
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'completed') {
        this.showSuccess('Download completed successfully!');
      } else {
        this.showSuccess('Download progress monitoring stopped.');
      }
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  getActiveDownloads(): DownloadProgress[] {
    return Array.from(this.activeDownloads.values());
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
    });
  }

  get url() {
    return this.downloadForm.get('url');
  }
}
