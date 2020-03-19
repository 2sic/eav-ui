import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';

import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { DialogEntryComponent } from './dialog-entry/dialog-entry.component';
import { DialogService } from './dialog-service/dialog.service';
import { FieldHintComponent } from './field-hint/field-hint.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagination.directive';
import { BooleanFilterComponent } from './boolean-filter/boolean-filter.component';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    EmptyRouteComponent,
    DialogEntryComponent,
    FieldHintComponent,
    ClickStopPropagationDirective,
    BooleanFilterComponent,
  ],
  entryComponents: [
    BooleanFilterComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatRadioModule,
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
export class SharedComponentsModule {
  static forRoot(): ModuleWithProviders<SharedComponentsModule> {
    return {
      ngModule: SharedComponentsModule,
      providers: [DialogService]
    };
  }
}
