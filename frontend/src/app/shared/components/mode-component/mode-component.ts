import { Component, OnInit } from '@angular/core';
import {ModeServices} from '../../../services/mode/mode.services';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-mode-component',
  standalone: true,
  templateUrl: './mode-component.html',
})
export class ModeComponent implements OnInit {
  isDarkMode = false;
  private subscription!: Subscription;

  constructor(private modeServices: ModeServices) {}

  ngOnInit(): void {
    this.isDarkMode = this.modeServices.isDarkMode;
    this.subscription = this.modeServices.isDarkMode$.subscribe(mode => {
      this.isDarkMode = mode;
    });
  }

  toggleTheme() {
    this.modeServices.toggleTheme();
    this.isDarkMode = this.modeServices.isDarkMode;
  }
}
