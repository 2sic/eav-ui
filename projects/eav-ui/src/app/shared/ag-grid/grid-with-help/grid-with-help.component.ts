import { AgGridAngular } from '@ag-grid-community/angular';
import { Component, contentChild, effect, ElementRef, input, untracked, viewChild } from '@angular/core';
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
  // ViewChild and ContentChild references - Access to DOM elements
  gridWrapper = viewChild("gridWrapper", { read: ElementRef });
  agGrid = contentChild(AgGridAngular, { read: ElementRef });
  dialogAction = contentChild(MatDialogActions, { read: ElementRef });

  // Input properties - Required data from parent component
  readonly helpText = input.required<GridWithHelpInput>({});
  readonly refresh = input.required<number>();
  readonly rowLength = input.required<number>();

  // Constants - Fixed values for layout calculations
  readonly DEFAULT_ROW_HEIGHT = 47; // Default height for AG Grid rows in pixels
  readonly GRID_HEADER_HEIGHT = 64; // Height of AG Grid header in pixels
  readonly HELP_CARD_BUFFER = 12;   // Additional buffer space for help card in pixels

  constructor() {
    // Effect that reacts to changes in refresh and rowLength signals
    effect(() => {
      const refresh = this.refresh();
      const rowLength = this.rowLength();
      const gridWrapperEl = this.gridWrapper()?.nativeElement;

      // Early return if grid wrapper element is not available
      if (!gridWrapperEl) return;

      // Untracked execution to prevent unnecessary effect re-runs during layout updates
      untracked(() => this.#updateLayout(gridWrapperEl, rowLength));
    });
  }

  /**
   * Main layout update method - Handles the dynamic sizing and positioning of grid and help card
   * @param gridWrapperEl - The main container element
   * @param rowLength - Number of rows in the grid
   */
  #updateLayout(gridWrapperEl: HTMLElement, rowLength: number): void {
    // Get references to essential DOM elements
    const agGridEl = this.agGrid()?.nativeElement;
    const dialogActionEl = this.dialogAction()?.nativeElement;
    const helpCard = gridWrapperEl.querySelector('.help-info-card') as HTMLElement;

    helpCard.classList.toggle('center-center', rowLength === 0);

    // Early return if critical elements are missing
    if (!agGridEl || !dialogActionEl) return;

    helpCard.style.flex = "";

    // Calculate all necessary dimensions for layout
    const dimensions = this.#calculateDimensions(gridWrapperEl, agGridEl, dialogActionEl, helpCard, rowLength);

    // Set AG Grid height based on row count and maximum height to prevent overflow
    agGridEl.style.flex = dimensions.rowHeight ? `0 0 ${dimensions.agGridHeight}px` : '0px';

    // Outer Container for max Size
    const sideNavEl = document.querySelector<HTMLElement>('.mat-sidenav-content'); // with SideNav (settings)
    const dialogEl = document.querySelector<HTMLElement>('.mat-mdc-dialog-container'); // only Dialog (Content)

    const hasNavComponentWrapper = !!document.querySelector<HTMLElement>('.nav-component-wrapper'); // Check, if sideNav Dialog or Single Dialog 
    const outerContainer = hasNavComponentWrapper ? dialogEl : sideNavEl;

    const maxHeight = outerContainer.clientHeight - dimensions.dialogHeaderHeight - dimensions.dialogActionHeight -2;

    agGridEl.style.maxHeight = `${maxHeight}px`;

    // Determine if help card should be hidden when content exceeds available space
    const shouldHideHelp = dimensions.helpCardHeight + dimensions.agGridHeight + dimensions.dialogActionHeight + dimensions.dialogHeaderHeight > dimensions.wrapperHeight;

    helpCard.style.flex = "1 1 auto";
    // Remove Help card from layout if it should be hidden
    helpCard?.classList.toggle('hidden-help-info-card', shouldHideHelp);
  }

  // Calculate dimensions for AG Grid and help card based on current layout
  #calculateDimensions(gridWrapperEl: HTMLElement, agGridEl: HTMLElement, dialogActionEl: HTMLElement, helpCard: HTMLElement, rowLength: number) {
    const rowHeight = agGridEl.querySelector('.ag-row')?.clientHeight ?? this.DEFAULT_ROW_HEIGHT;
    const agGridHeight = this.GRID_HEADER_HEIGHT + (rowLength * rowHeight);
    const helpCardHeight = helpCard.clientHeight + this.HELP_CARD_BUFFER;
    const dialogActionHeight = dialogActionEl.offsetHeight;
    const dialogHeaderHeight = gridWrapperEl.querySelector('.eav-dialog-header')?.clientHeight ?? 0;
    // Get total available wrapper height
    const wrapperHeight = gridWrapperEl.offsetHeight;
    return {
      rowHeight,
      agGridHeight,
      helpCardHeight,
      dialogActionHeight,
      dialogHeaderHeight,
      wrapperHeight
    };
  }


}
