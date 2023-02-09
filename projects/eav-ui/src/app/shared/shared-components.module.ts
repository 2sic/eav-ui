import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { BooleanFilterComponent } from './components/boolean-filter/boolean-filter.component';
import { DialogEntryComponent } from './components/dialog-entry/dialog-entry.component';
import { EmptyRouteComponent } from './components/empty-route/empty-route.component';
import { EntityFilterComponent } from './components/entity-filter/entity-filter.component';
import { FieldHintComponent } from './components/field-hint/field-hint.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { IdFieldComponent } from './components/id-field/id-field.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { MatFormFieldTextareaDirective } from './directives/mat-form-field-textarea.directive';
import { MatInputAutofocusDirective } from './directives/mat-input-autofocus.directive';
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
    EntityFilterComponent,
    MatInputAutofocusDirective,
    FileUploadDialogComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatRadioModule,
    MatRippleModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
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
    EntityFilterComponent,
    MatInputAutofocusDirective,
    FileUploadDialogComponent,
  ],
})
export class SharedComponentsModule { }
