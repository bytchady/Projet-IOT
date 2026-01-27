import {AfterViewInit, Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  ngAfterViewInit() {
    setTimeout(() => window.dispatchEvent(new Event('resize')));
  }
}

