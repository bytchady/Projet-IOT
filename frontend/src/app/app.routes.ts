import { Routes } from '@angular/router';
import {HomePage} from './shared/components/home-page/home-page';
import {Dashboard} from './shared/components/dashboard/dashboard';
import {Report} from './shared/components/report/report';

export const routes: Routes = [
  {path: '', component: HomePage},
  { path: 'rooms/:id', component: Dashboard },
  { path: 'report', component: Report },
  { path: '**', redirectTo: '' }
];
