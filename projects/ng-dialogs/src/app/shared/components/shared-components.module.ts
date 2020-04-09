import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { DialogEntryComponent } from './dialog-entry/dialog-entry.component';
import { FieldHintComponent } from './field-hint/field-hint.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagination.directive';
import { BooleanFilterComponent } from './boolean-filter/boolean-filter.component';
import { IdFieldComponent } from './id-field/id-field.component';

@NgModule({
  declarations: [
    EmptyRouteComponent,
    DialogEntryComponent,
    FieldHintComponent,
    ClickStopPropagationDirective,
    BooleanFilterComponent,
    IdFieldComponent,
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
  ],
  providers: [
  ],
  exports: [
    EmptyRouteComponent,
    DialogEntryComponent,
    FieldHintComponent,
    ClickStopPropagationDirective,
    BooleanFilterComponent,
  ]
})
export class SharedComponentsModule { }
