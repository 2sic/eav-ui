import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { Extension } from '../extension.model';

@Component({
  selector: 'app-extensions-link',
  templateUrl: './extensions-link.html',
  styleUrls: ['./extensions-link.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
  ],
})
export class AppExtensionsLinkCell
  extends AgGridActionsBaseComponent<Extension, 'openMain' | 'openDocs' | 'openDemo' | 'openSourceCode'> {

  get mainLink() { return this.data?.configuration?.linkMain; }
  get docsLink() { return this.data?.configuration?.linkDocs; }
  get demosLink() { return this.data?.configuration?.linkDemo; }
  get sourceCodeLink() { return this.data?.configuration?.linkSource; }
}