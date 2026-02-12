import { Routes } from '@angular/router';
import { DownloadForm } from './components/download-form/download-form';
import { DownloadProgressComponent } from './components/download-progress/download-progress';

export const routes: Routes = [
  { path: '', component: DownloadForm },
  { path: 'download', component: DownloadProgressComponent },
  { path: '**', redirectTo: '' }
];
  