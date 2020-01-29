import { Component, ElementRef } from '@angular/core';
import { DnnAppComponent, Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context, keyModuleId, keyContentBlockId } from './shared/context/context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DnnAppComponent {

  constructor(
    el: ElementRef,
    dnnContext: DnnContext,
    private context: Context,
  ) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: sessionStorage[keyModuleId],
        contentBlockId: sessionStorage[keyContentBlockId],
      }),
    );
    this.context.initRoot();
  }

}
