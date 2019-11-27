import { Component, OnInit } from '@angular/core';
import { Context } from './shared/context/context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(context: Context) {
    context.initRoot();
   }

  ngOnInit() {
  }

}
