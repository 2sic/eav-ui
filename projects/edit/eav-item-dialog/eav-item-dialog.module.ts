import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';

import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { EavDynamicFormModule } from '../eav-dynamic-form/eav-dynamic-form.module';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { EavMaterialControlsModule } from '../eav-material-controls/eav-material-controls.module';

import { MultiItemEditFormHeaderComponent } from './multi-item-edit-form-header/multi-item-edit-form-header.component';
import { MultiItemEditFormDebugComponent } from './multi-item-edit-form-debug/multi-item-edit-form-debug.component';
import { LoadIconsService } from '../shared/services/load-icons.service';
import { BuildFieldsService } from './item-edit-form/item-edit-form-services/build-fields.service';

@NgModule({
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    MultiItemEditFormHeaderComponent,
    MultiItemEditFormDebugComponent
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
  ],
  entryComponents: [
    MultiItemEditFormComponent
  ],
  exports: [],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    LoadIconsService,
    BuildFieldsService,
  ],
})
export class EavItemDialogModule { }
