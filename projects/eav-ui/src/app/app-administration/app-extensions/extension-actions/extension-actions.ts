import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { Extension } from '../extension.model';

type GoToUrls = 'edit' | 'download' | 'delete' | 'inspect' | 'info' | 'openSettings' | 'openResources';

@Component({
  selector: 'app-extension-actions',
  templateUrl: './extension-actions.html',
  styleUrls: ['./extension-actions.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    TippyDirective
  ],
})
export class AppExtensionActions {
  protected ext: Extension;
  canEditExtension = signal(false);
  showInfoButton = signal(false);
  extHasConfig = signal(false);
  hasSettings = signal(false);
  hasResources = signal(false);

  public params: {
    do(verb: GoToUrls | 'info', extension: Extension): void;
    urlTo(verb: GoToUrls, extension: Extension): string;
  }

  agInit(params: ICellRendererParams & AppExtensionActions['params']): void {
    this.params = params;
    this.ext = params.data;
    const config = this.ext.configuration;
    this.canEditExtension.set(!config.isInstalled);
    this.showInfoButton.set(config.isInstalled);
    this.extHasConfig.set(!!config);
    this.hasSettings.set(!!config?.settingsContentType);
    this.hasResources.set(!!config?.resourcesContentType);
  }

  do(verb: GoToUrls): void {
    this.params.do(verb, this.ext);
  }
}
