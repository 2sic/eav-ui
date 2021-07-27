import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BooleanFilterComponent } from './components/boolean-filter/boolean-filter.component';
import { DialogEntryComponent } from './components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from './components/empty-route/empty-route.component';
import { FieldHintComponent } from './components/field-hint/field-hint.component';
import { IdFieldComponent } from './components/id-field/id-field.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { MatFormFieldTextareaDirective } from './directives/mat-form-field-textarea.directive';
import { MousedownStopPropagationDirective } from './directives/mousedown-stop-propagation.directive';
import { TippyDirective } from './directives/tippy.directive';
import { ToggleDebugDirective } from './directives/toggle-debug.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url';

/** Stuff that is shared and only has to be initialized once */
@NgModule({
  declarations: [
    EmptyRouteComponent,
    DialogEntryComponent,
    FieldHintComponent,
    ClickStopPropagationDirective,
    DragAndDropDirective,
    MousedownStopPropagationDirective,
    BooleanFilterComponent,
    IdFieldComponent,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    ToggleDebugDirective,
    MatFormFieldTextareaDirective,
    TippyDirective,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatRadioModule,
    MatTooltipModule,
    MatRippleModule,
    MatIconModule,
  ],
  providers: [
  ],
  exports: [
    EmptyRouteComponent,
    DialogEntryComponent,
    FieldHintComponent,
    ClickStopPropagationDirective,
    DragAndDropDirective,
    MousedownStopPropagationDirective,
    BooleanFilterComponent,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    ToggleDebugDirective,
    MatFormFieldTextareaDirective,
    TippyDirective,
  ]
})
export class SharedComponentsModule { }
