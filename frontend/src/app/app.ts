import { Component, signal } from '@angular/core';
import { Logo } from './shared/components/logo/logo';
import { Footer } from './shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';
import {HomeComponent} from './shared/components/home-component/home-component';

@Component({
  selector: 'app-root',
  imports: [
    Logo,
    Footer,
    HomeComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
