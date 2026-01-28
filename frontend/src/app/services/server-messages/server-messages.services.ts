import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServerMessagesServices {
  private _message = new BehaviorSubject<string>('');
  private _isError = new BehaviorSubject<boolean>(false);

  message$ = this._message.asObservable();
  isError$ = this._isError.asObservable();

  private timeoutId: any;

  showMessage(message: string, isError: boolean, duration = 3000) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this._message.next(message);
    this._isError.next(isError);

    this.timeoutId = setTimeout(() => {
      this.clearMessage();
    }, duration);
  }

  clearMessage() {
    this._message.next('');
    this._isError.next(false);
  }
}
