import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-extensions-link-cell',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="grid-container">
      @if (mainLink) {
        <a mat-icon-button [href]="mainLink || '#'" target="_blank" rel="noopener" class="small-icon-button">
          <mat-icon>extension</mat-icon>
        </a>
      } @else {
        <div></div>
      }
      @if (docsLink) {
        <a mat-icon-button [href]="docsLink || '#'" target="_blank" rel="noopener" class="small-icon-button">
          <mat-icon>description</mat-icon>
        </a>
      } @else {
        <div></div>
      }
      @if (demosLink) {
        <a mat-icon-button [href]="demosLink || '#'" target="_blank" rel="noopener" class="small-icon-button">
          <mat-icon>smart_display</mat-icon>
        </a>
      } @else {
        <div></div>
      }
      @if (sourceCodeLink) {
        <a mat-icon-button [href]="sourceCodeLink || '#'" target="_blank" rel="noopener" class="small-icon-button">
          <mat-icon>code</mat-icon>
        </a>
      } @else {
        <div></div>
      }
    </div>
  `,
  styles: [`
    .small-icon-button {
      width: 24px;
      height: 24px;
      padding: 0;
      line-height: 24px;
      display: inline-flex;
    }

    .small-icon-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .grid-container {
      margin-top: 15px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 4px;
    }
  `]
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
