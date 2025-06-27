import { AgGridAngular } from '@ag-grid-community/angular';
import { Component, contentChild, effect, ElementRef, input, untracked } from '@angular/core';
import { MatDialogActions } from '@angular/material/dialog';

export interface HelpTextConst {
  empty: GridWithHelpInput;
  content: GridWithHelpInput;
}

export interface GridWithHelpInput {
  description: string;
  hint: string;
}

@Component({
  selector: 'app-grid-with-help',
  imports: [],
  templateUrl: './grid-with-help.component.html',
  styleUrl: './grid-with-help.component.scss'
})

export class GridWithHelpComponent {
  agGrid = contentChild(AgGridAngular, { read: ElementRef });
  dialogAction = contentChild(MatDialogActions, { read: ElementRef });

  helpText = input.required<GridWithHelpInput>({});
  refresh = input.required<number>();
  rowLength = input.required<number>();

  constructor() {
    effect(() => {
      const refresh = this.refresh();
      const rowLength = this.rowLength();

      untracked(() => {

        const agGridEl = this.agGrid()?.nativeElement;
        const dialogActionEl = this.dialogAction()?.nativeElement;
        const helpCard = document.querySelector('.help-info-card');

        // Center help card if no rows
        helpCard?.classList.toggle('center-center', rowLength === 0);

        const wrapperHeight = document.querySelector('.grid-wrapper-dynamic')?.clientHeight ?? 0;

        if (!agGridEl || !dialogActionEl) return;

        const rowHeight = agGridEl.querySelector('.ag-row')?.clientHeight ?? 47;
        const agGridHeight = 64 + (rowLength * rowHeight);
        const helpCardHeight = (helpCard?.clientHeight ?? 0) + 24;
        const dialogActionHeight = (dialogActionEl.clientHeight ?? 0) + 11;

        // Set AG Grid height
        agGridEl.style.height = rowHeight ? `${agGridHeight}px` : `0px`;

        // Hide help card if content exceeds wrapper
        const shouldHideHelp = helpCardHeight + agGridHeight + dialogActionHeight > wrapperHeight;
        helpCard?.classList.toggle('hidden-help-info-card', shouldHideHelp);
      });
    });
  }
}
