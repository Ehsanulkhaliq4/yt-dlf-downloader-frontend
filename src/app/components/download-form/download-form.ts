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
    MatIcon
  ],
  templateUrl: './download-form.html',
  styleUrl: './download-form.css'
})
export class DownloadForm {

  downloadForm: FormGroup;
  isLoading = false;
  formats = [
    { value: 'mp4', label: 'MP4 Video (720p)' },
    { value: 'mp4-1080', label: 'MP4 Video (1080p)' },
    { value: 'mp3', label: 'MP3 Audio' },
    { value: 'webm', label: 'WebM Format' }
  ];

  constructor(private fb: FormBuilder, private downloadService: Download, private dialog: MatDialog , private snackBar: MatSnackBar) {
     this.downloadForm = this.fb.group({
      url: ['', [
        Validators.required,
        Validators.pattern('^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$')
      ]],
      format: ['mp4', Validators.required]
    });
  }

   onSubmit(): void {
    if (this.downloadForm.valid) {
      this.isLoading = true;
      const { url, format } = this.downloadForm.value;

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
