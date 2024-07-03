import { Type } from '@angular/core';
import { ExtendedFabSpeedDialActionDirective } from './extended-fab-speed-dial-action.directive';
import { ExtendedFabSpeedDialActionsContentDirective } from './extended-fab-speed-dial-actions-content.directive';
import { ExtendedFabSpeedDialTriggerContentDirective } from './extended-fab-speed-dial-trigger-content.directive';
import { ExtendedFabSpeedDialTriggerDirective } from './extended-fab-speed-dial-trigger.directive';
import { ExtendedFabSpeedDialComponent } from './extended-fab-speed-dial.component';

/**
 * The Extended Fab Speed Dial needs a component and a set of directives to work.
 * 
 * Note: for reasons I can't fully explain, the import { ... } must use a relative path.
 * So this works  : import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
 * Bu this doesn't: import { ExtendedFabSpeedDialImports } from 'projects/eav-ui/src/app/shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
 * @usage in a imports: [...ExtendedFabSpeedDialImports]
 */
export const ExtendedFabSpeedDialImports: Type<any>[] = [
  ExtendedFabSpeedDialComponent,
  ExtendedFabSpeedDialTriggerDirective,
  ExtendedFabSpeedDialActionDirective,
  ExtendedFabSpeedDialTriggerContentDirective,
  ExtendedFabSpeedDialActionsContentDirective,
];
