import { Routes } from '@angular/router';
import {HomePage} from './shared/components/home-page/home-page';
import {RoomDashboard} from './shared/components/room-dashboard/room-dashboard';

export const routes: Routes = [
  {path: '', component: HomePage},
  { path: 'rooms/:id', component: RoomDashboard },
  { path: '**', redirectTo: '' }
];
