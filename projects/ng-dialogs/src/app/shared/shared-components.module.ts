import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { EmptyRouteComponent } from './components/empty-route/empty-route.component';
import { DialogEntryComponent } from './components/dialog-entry/dialog-entry.component';
import { FieldHintComponent } from './components/field-hint/field-hint.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { BooleanFilterComponent } from './components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from './components/id-field/id-field.component';
import { MousedownStopPropagationDirective } from './directives/mousedown-stop-propagation.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';

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
  ],
  entryComponents: [
    BooleanFilterComponent,
    IdFieldComponent,
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
  ]
})
export class SharedComponentsModule { }
