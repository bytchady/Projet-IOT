import {RouterModule, Routes} from '@angular/router';
import {HomePage} from './shared/components/home-page/home-page';
import {Dashboard} from './shared/components/dashboard/dashboard';
import {Report} from './shared/components/report/report';
import {Login} from './shared/components/login/login';
import {NgModule} from '@angular/core';
import {publicGuard} from './guards/public/public-guard';
import {authGuard} from './guards/auth/auth-guard';

export const routes: Routes = [
  {path: '', component: HomePage, canActivate: [authGuard]},
  {path: 'login', component: Login, canActivate: [publicGuard]},
  {path: 'rooms/:id', component: Dashboard, canActivate: [authGuard]},
  {path: 'report', component: Report, canActivate: [authGuard]},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
