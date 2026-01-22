import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-server-message',
  standalone: true,
  imports: [NgClass],
  templateUrl: './server-message.html',
  styleUrls: ['./server-message.scss'],
})
export class ServerMessage {
  @Input() message: string = '';
  @Input() isError: boolean | null = false;
}
