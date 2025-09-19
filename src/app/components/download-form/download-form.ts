import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog , MatDialogModule } from '@angular/material/dialog';
import { Download } from '../../service/download';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    MatProgressBarModule
  ],
  templateUrl: './download-form.html',
  styleUrl: './download-form.css'
})
export class DownloadForm {

  downloadForm: FormGroup;
  isLoading = false;
  formats = [];
  videoDetails: any;
  progress: number = 0;

  constructor(private fb: FormBuilder, private downloadService: Download, private dialog: MatDialog , private snackBar: MatSnackBar) {
     this.downloadForm = this.fb.group({
      url: ['', [
        Validators.required,
        Validators.pattern('^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$')
      ]],
      format: ['mp4', Validators.required]
    });
  }

  fetchVideoInfo(): void {
    if (this.downloadForm.valid) {
      this.isLoading = true;
      console.log("Fetching video info...");
      const { url } = this.downloadForm.value;
      this.downloadService.getVideoInfo(url).subscribe({
        next: (info) => {
          this.isLoading = false;
          this.videoDetails = info;
          this.formats = info.formats;
          console.log(this.formats);
          
          console.log("Video info fetched successfully:", this.videoDetails);
        },
        error: (error) => {
          this.isLoading = false;
          console.error("Error fetching video info:", error);
        }
      });
    }
  }

   onSubmit(): void {
    console.log("onSubmit called");
    if (this.downloadForm.valid) {
      this.isLoading = true;
      const { url, format } = this.downloadForm.value;
      console.log(`Submitting download for URL: ${url} with format: ${format}`);
      
      this.downloadService.downloadVideo(url, format).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.openProgressDialog(response.id);
        },
        error: (error) => {
          this.isLoading = false;
          this.showError('Failed to start download. Please try again.');
          console.error('Download error:', error);
        }
      });
    }
  }

  trackProgress(downloadId: string) {
  const interval = setInterval(() => {
   this.downloadService.getTrackingProgress(downloadId).subscribe(res => {
      this.progress = res.progress;
      if (this.progress >= 100) {
        clearInterval(interval);
        console.log("Download completed!");
      }
    });
  }, 1000);
}

  openProgressDialog(downloadId: string): void {
    this.dialog.open(ProgressDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: { downloadId },
      disableClose: true
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  get url() {
    return this.downloadForm.get('url');
  }
}
