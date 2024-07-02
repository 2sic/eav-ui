import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { MatFormFieldTextareaDirective } from './directives/mat-form-field-textarea.directive';
import { MatInputAutofocusDirective } from './directives/mat-input-autofocus.directive';
import { MousedownStopPropagationDirective } from './directives/mousedown-stop-propagation.directive';
import { ToggleDebugDirective } from './directives/toggle-debug.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url';
import { AgBoolIconRenderer } from './ag-grid/apps-list-show/ag-bool-icon-renderer.component';
import { BreadcrumbModule } from 'xng-breadcrumb';

/** Stuff that is shared and only has to be initialized once */
@NgModule({
    declarations: [
        // AgBoolIconRenderer, // TODO:: @2dg not in used??
        // MatInputAutofocusDirective, // TODO:: @2dg not in used??
        FileUploadDialogComponent,
        DragAndDropDirective,
        MousedownStopPropagationDirective,
        ToggleDebugDirective,
        MatFormFieldTextareaDirective,
        SafeResourceUrlPipe,
    ],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }
    ],
    exports: [
        BreadcrumbModule,
        FileUploadDialogComponent,
        DragAndDropDirective,
        MousedownStopPropagationDirective,
        ToggleDebugDirective,
        MatFormFieldTextareaDirective,
        SafeResourceUrlPipe,
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
        BreadcrumbModule,
        SafeHtmlPipe
    ]
})
export class SharedComponentsModule { }
