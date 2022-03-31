import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExtendedFabSpeedDialActionDirective } from './extended-fab-speed-dial-action.directive';
import { ExtendedFabSpeedDialActionsContentDirective } from './extended-fab-speed-dial-actions-content.directive';
import { ExtendedFabSpeedDialTriggerContentDirective } from './extended-fab-speed-dial-trigger-content.directive';
import { ExtendedFabSpeedDialTriggerDirective } from './extended-fab-speed-dial-trigger.directive';
import { ExtendedFabSpeedDialComponent } from './extended-fab-speed-dial.component';

@NgModule({
  declarations: [
    ExtendedFabSpeedDialComponent,
    ExtendedFabSpeedDialTriggerContentDirective,
    ExtendedFabSpeedDialActionsContentDirective,
    ExtendedFabSpeedDialTriggerDirective,
    ExtendedFabSpeedDialActionDirective,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ExtendedFabSpeedDialComponent,
    ExtendedFabSpeedDialTriggerContentDirective,
    ExtendedFabSpeedDialActionsContentDirective,
    ExtendedFabSpeedDialTriggerDirective,
    ExtendedFabSpeedDialActionDirective,
  ],
})
export class ExtendedFabSpeedDialModule { }
