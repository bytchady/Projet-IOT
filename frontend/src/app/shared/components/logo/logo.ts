import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [
    RouterLink
  ],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo implements OnInit {
  name1!: string;
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.name1 = "ThermoCESI";
    this.cd.detectChanges();
  }
}
