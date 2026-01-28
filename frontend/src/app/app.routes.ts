import {RouterModule, Routes} from '@angular/router';
import {HomePage} from './shared/components/home-page/home-page';
import {Dashboard} from './shared/components/dashboard/dashboard';
import {Report} from './shared/components/report/report';
import {Login} from './shared/components/login/login';
import {NgModule} from '@angular/core';

export const routes: Routes = [
  {path: 'login', component: Login},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: '', component: HomePage},
  {path: 'rooms/:id', component: Dashboard},
  {path: 'report', component: Report},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
