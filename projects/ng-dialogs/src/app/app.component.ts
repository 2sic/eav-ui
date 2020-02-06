import { Component, ElementRef } from '@angular/core';
import { environment } from '../environments/environment';
import { DnnAppComponent, Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from './shared/context/context';
import { keyModuleId, keyContentBlockId } from './shared/constants/sessions-keys';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DnnAppComponent {
  production: boolean;

  constructor(
    el: ElementRef,
    dnnContext: DnnContext,
    private context: Context,
  ) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: parseInt(sessionStorage.getItem(keyModuleId), 10),
        contentBlockId: parseInt(sessionStorage.getItem(keyContentBlockId), 10),
      }),
    );
    this.production = environment.production;
    this.context.initRoot();
  }

}
