import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Extension } from '../../models/extension.model';
import { ExtensionActionsParams, ExtensionItemType } from './extension-actions.model';

type GoToUrls = 'edit'

@Component({
  selector: 'app-extension-actions',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './extension-actions.component.html',
})
export class ExtensionActionsComponent {
  protected ext: Extension;

  public params: ExtensionActionsParams & {
    urlTo(verb: GoToUrls, extension: Extension): string;
  };

  agInit(params: ICellRendererParams & ExtensionActionsComponent['params']): void {
    this.params = params;
    this.ext = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: ExtensionItemType): void {
    this.params.do(verb, this.ext);
  }
}
