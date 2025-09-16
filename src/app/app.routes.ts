import { Routes } from '@angular/router';
import { DownloadForm } from './components/download-form/download-form';

export const routes: Routes = [
  { path: '', component: DownloadForm },
  { path: '**', redirectTo: '' }
];
