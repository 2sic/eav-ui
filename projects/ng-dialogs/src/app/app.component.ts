import { Component } from '@angular/core';

import { Context } from './shared/context/context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private context: Context,
  ) {
    this.context.initRoot();
  }

}
