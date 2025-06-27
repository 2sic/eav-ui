import { computed, Injectable, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UxHelpService {

   checkHelpCard<T>(refresh: Signal<number>, content: Signal<T[]>): Signal<number> {
    return computed(() => {
      refresh(); 

      const height = document.querySelector('.ag-row')?.clientHeight ?? 0;
      const agGridHeigh = 64 + ((content()?.length ?? 0) * height);

      const helpCard = document.getElementById('ux-help-info-card');
      const helpCardHeight = helpCard?.clientHeight ?? 0;
      const wrapperHeight = document.querySelector('.grid-wrapper-dynamic')?.clientHeight ?? 0;
      const dialogAction = (document.getElementsByTagName('mat-dialog-actions')[0]?.clientHeight ?? 0) + 11;

      if (helpCardHeight + agGridHeigh + dialogAction > wrapperHeight)
        helpCard?.classList.add('hidden-uxHelpCard');
      else
        helpCard?.classList.remove('hidden-uxHelpCard');

      return agGridHeigh;
    });
  }

}
