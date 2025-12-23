import { ICellRendererParams } from '@ag-grid-community/core';

import { Component, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { Extension } from '../extension.model';

type GoToUrls = 'edit' | 'download' | 'delete' | 'inspect' | 'openSettings' | 'openResources';

@Component({
  selector: 'app-extension-actions',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    TippyDirective
],
  templateUrl: './extension-actions.html',
  styleUrls: ['./extension-actions.scss'],
})
export class AppExtensionActions {
  protected ext: Extension;
  canEditExtension = signal(false);
  extHasConfig = signal(false);
  hasSettings = signal(false);
  hasResources = signal(false);

  public params: {
    do(verb: GoToUrls, extension: Extension): void;
    urlTo(verb: GoToUrls, extension: Extension): string;
  }

  agInit(params: ICellRendererParams & AppExtensionActions['params']): void {
    this.params = params;
    this.ext = params.data;
    this.canEditExtension.set(!this.ext.configuration.isInstalled);
    this.extHasConfig.set(!!this.ext.configuration);
    this.hasSettings.set(!!this.ext.configuration?.settingsContentType);
    this.hasResources.set(!!this.ext.configuration?.resourcesContentType);
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: GoToUrls): void {
    this.params.do(verb, this.ext);
  }
}
