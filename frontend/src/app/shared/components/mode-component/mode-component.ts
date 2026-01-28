import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mode-component',
  standalone: true,
  templateUrl: './mode-component.html',
})
export class ModeComponent implements OnInit {

  isDarkMode = false;

  ngOnInit(): void {
    this.isDarkMode =
      document.documentElement.getAttribute('dataset-bs-theme') === 'dark'
      || window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute(
      'dataset-bs-theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }
}
