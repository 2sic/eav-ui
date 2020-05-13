import { Component, ElementRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DnnAppComponent, Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from './shared/services/context';
import { keyModuleId, keyContentBlockId } from './shared/constants/session.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DnnAppComponent {
  constructor(el: ElementRef, dnnContext: DnnContext, private context: Context, private matIconRegistry: MatIconRegistry) {
    super(
      el,
      dnnContext.preConfigure({
        moduleId: parseInt(sessionStorage.getItem(keyModuleId), 10),
        contentBlockId: parseInt(sessionStorage.getItem(keyContentBlockId), 10),
      }),
    );
    this.context.initRoot();
    this.matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }
}
