import { Directive, HostListener } from '@angular/core';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';

@Directive({ selector: '[appToggleDebug]' })
export class ToggleDebugDirective {

  constructor(private globalConfigService: GlobalConfigService) { }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const CTRL_SHIFT_ALT_CLICK = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.shiftKey && event.altKey;
    if (CTRL_SHIFT_ALT_CLICK) {
      this.globalConfigService.toggleDebugEnabled();
      window.getSelection().removeAllRanges();
    }
  }
}
