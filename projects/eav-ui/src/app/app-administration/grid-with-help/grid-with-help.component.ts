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
  // Reference to the AG Grid component element
  agGrid = contentChild(AgGridAngular, { read: ElementRef });
  // Reference to the dialog action buttons
  dialogAction = contentChild(MatDialogActions, { read: ElementRef });

  helpText = input.required<GridWithHelpInput>({}); // Help text content (required)
  refresh = input.required<number>();  // triggering a refresh (required)
  rowLength = input.required<number>(); // representing the number of rows in the grid (required)

  constructor() {
    effect(() => {
      const refresh = this.refresh();
      const rowLength = this.rowLength();

      if (this.agGrid() === undefined || this.dialogAction() === undefined)
        return; // Ensure that the AG Grid and dialog action elements are available before proceeding

      // Get the height of a single AG-Grid row (default to 0 if not available)
      const rowHeight = this.agGrid().nativeElement.querySelector('.ag-row')?.clientHeight ?? 47;

      untracked(() => {
        const helpCard = document.querySelector('.help-info-card');
        // Set Center if there are now rows in the grid
        helpCard?.classList[rowLength === 0 ? 'add' : 'remove']('center-center');

        if (rowHeight) {
          // Calculate the total height of the AG-Grid including header (64px) and set it on the element
          // Dynamically set the AG-Grid height based on row count and row height
          const agGridHeight = 64 + ((rowLength ?? 0) * rowHeight);

          this.agGrid().nativeElement.style.height = `${agGridHeight}px`;

          const helpCardHeight = (helpCard?.clientHeight ?? 0) + 24;
          // Get the height of the Full Page
          const wrapperHeight = document.querySelector('.grid-wrapper-dynamic')?.clientHeight ?? 0;
          const dialogActionHeight = (this.dialogAction()?.nativeElement?.clientHeight ?? 0) + 11;

          // Conditionally hide the help card if the combined heights exceed the wrapper height
          helpCard?.classList[helpCardHeight + agGridHeight + dialogActionHeight > wrapperHeight ? 'add' : 'remove']('hidden-help-info-card');
        } else {
          this.agGrid().nativeElement.style.height = `0px`;
        }
      })
    })
  }

}
