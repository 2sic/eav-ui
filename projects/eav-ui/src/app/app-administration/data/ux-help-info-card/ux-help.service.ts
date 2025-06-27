import { computed, Injectable, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UxHelpService {

  //  Calculates the total height, returns the AG-Grid height, and shows/hides the help card
  //  Content: number of rows
  //  Signal<number> – current calculated height of the AG-Grid view
  helpCardVisibilityHeight<T>(refresh: Signal<number>, content: Signal<T[]>): Signal<number> {
    return computed(() => {
      refresh();

      const rowHeight = document.querySelector('.ag-row')?.clientHeight ?? 0;
      const agGridHeigh = 64 + ((content()?.length ?? 0) * rowHeight);

      const helpCard = document.getElementById('ux-help-info-card');
      const helpCardHeight = helpCard?.clientHeight ?? 0;
      const wrapperHeight = document.querySelector('.grid-wrapper-dynamic')?.clientHeight ?? 0;
      const dialogAction = (document.getElementsByTagName('mat-dialog-actions')[0]?.clientHeight ?? 0) + 11;

      // Show / remove the help card based on the height of the grid
      helpCard?.classList[helpCardHeight + agGridHeigh + dialogAction > wrapperHeight ? 'add' : 'remove']('hidden-uxHelpCard');

      return agGridHeigh;
    });
  }

}
