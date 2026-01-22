import { Component } from '@angular/core';
import {Footer} from "../footer/footer";
import {Header} from "../header/header";
import {HomeComponent} from "../home-component/home-component";

@Component({
  selector: 'app-home-page',
    imports: [
        Footer,
        Header,
        HomeComponent
    ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {

}
