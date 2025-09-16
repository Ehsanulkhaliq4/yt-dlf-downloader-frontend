import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Download } from '../../service/download';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-progress-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatIcon
  ],
  templateUrl: './progress-dialog.html',
  styleUrl: './progress-dialog.css'
})
export class ProgressDialogComponent implements OnInit, OnDestroy {
  progress = 0;
  status = 'Starting download...';
  downloadComplete = false;
  downloadUrl: string | null = null;
  private intervalId: any;

  constructor(
    public dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { downloadId: string },
    private downloadService: Download
  ) {}

  ngOnInit(): void {
    this.startProgressSimulation();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startProgressSimulation(): void {
    this.intervalId = setInterval(() => {
      this.downloadService.getDownloadProgress(this.data.downloadId).subscribe({
        next: (progressData) => {
          this.progress = progressData.progress;
          this.status = progressData.status;
          
          if (progressData.progress === 100) {
            this.downloadComplete = true;
            this.downloadUrl = progressData.downloadUrl;
            clearInterval(this.intervalId);
          }
        },
        error: () => {
          this.status = 'Download failed';
          clearInterval(this.intervalId);
        }
      });
    }, 2000);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}