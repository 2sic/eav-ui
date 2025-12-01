import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Extension } from '../../models/extension.model';

type GoToUrls = 'edit' | 'download' | 'delete';

@Component({
  selector: 'app-extension-actions',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './extension-actions.html',
  styleUrls: ['./extension-actions.scss'],
})
export class AppExtensionActions {
  protected ext: Extension;
  canEditExtension = signal(false);

  public params: {
    do(verb: GoToUrls, extension: Extension): void;
    urlTo(verb: GoToUrls, extension: Extension): string;
  }

  agInit(params: ICellRendererParams & AppExtensionActions['params']): void {
    this.params = params;
    this.ext = params.data;
    this.canEditExtension.set(!this.ext.configuration.isInstalled);
    console.log('2dm');
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: GoToUrls): void {
    this.params.do(verb, this.ext);
  }
}
