import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo implements OnInit {
  name1!: string;

  ngOnInit() {
    this.name1 = "ThermoCESI";
  }
}
