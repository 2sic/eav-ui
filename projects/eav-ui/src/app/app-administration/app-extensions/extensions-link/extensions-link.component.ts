import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-extensions-link',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './extensions-link.component.html',
  styleUrls: ['./extensions-link.component.scss']
})
export class AppExtensionsLinkCellComponent implements ICellRendererAngularComp {
  mainLink?: string | undefined;
  docsLink?: string | undefined;
  demosLink?: string | undefined;
  sourceCodeLink?: string | undefined;

  agInit(params: any): void {
    this.mainLink = params.mainLink;
    this.docsLink = params.docsLink;
    this.demosLink = params.demosLink;
    this.sourceCodeLink = params.sourceCodeLink;
  }

  refresh(params?: any): boolean {
    if (params) {
      this.mainLink = params.mainLink;
      this.docsLink = params.docsLink;
      this.demosLink = params.demosLink;
      this.sourceCodeLink = params.sourceCodeLink;
    }
    return true;
  }
}
