import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '../../ng-dialogs/src/app/shared/shared-components.module';
import { EavDynamicFormModule } from '../eav-dynamic-form/eav-dynamic-form.module';
import { EavMaterialControlsModule } from '../eav-material-controls/eav-material-controls.module';
import { EditEntryComponent } from '../edit-entry/edit-entry.component';
import { LoadIconsService } from '../shared/services/load-icons.service';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { MultiItemEditFormDebugComponent } from './multi-item-edit-form-debug/multi-item-edit-form-debug.component';
import { MultiItemEditFormHeaderComponent } from './multi-item-edit-form-header/multi-item-edit-form-header.component';
import { FormSlideDirective } from './multi-item-edit-form/form-slide.directive';
import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';

@NgModule({
  declarations: [
    EditEntryComponent,
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    MultiItemEditFormHeaderComponent,
    MultiItemEditFormDebugComponent,
    FormSlideDirective,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    EavDynamicFormModule,
    EavMaterialControlsModule,
    MatDialogModule,
    MatDividerModule,
    FlexLayoutModule,
    TranslateModule,
    SharedComponentsModule,
  ],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    LoadIconsService,
  ],
})
export class EavItemDialogModule { }
