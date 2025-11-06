import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Extension } from '../../models/extension.model';
import { ExtensionActionsParams, ExtensionItemType } from './extension-actions.model';

type GoToUrls = 'edit' | 'download';

@Component({
  selector: 'app-extension-actions',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './extension-actions.component.html',
  styleUrls: ['./extension-actions.component.scss'],
})
export class ExtensionActionsComponent {
  protected ext: Extension;
  canEditExtension = signal<boolean>(false);

  public params: ExtensionActionsParams & {
    urlTo(verb: GoToUrls, extension: Extension): string;
  };

  agInit(params: ICellRendererParams & ExtensionActionsComponent['params']): void {
    this.params = params;
    this.ext = params.data;
    this.canEditExtension.set(!this.ext.configuration.isInstalled);
    console.log('2dm');
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: ExtensionItemType): void {
    this.params.do(verb, this.ext);
  }
}
