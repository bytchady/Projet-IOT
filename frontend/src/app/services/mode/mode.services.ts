import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModeServices {
  private _isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this._isDarkMode.asObservable();

  constructor() {
    // Vérifie localStorage ou préférences du système au démarrage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this._isDarkMode.next(savedTheme === 'dark' || (!savedTheme && prefersDark));
    this.applyTheme(this._isDarkMode.value);
  }

  toggleTheme() {
    const newMode = !this._isDarkMode.value;
    this._isDarkMode.next(newMode);
    this.applyTheme(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  }

  applyTheme(isDark: boolean) {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }

  get isDarkMode() {
    return this._isDarkMode.value;
  }
}
