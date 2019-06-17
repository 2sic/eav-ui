import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, Store } from '@ngrx/store';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
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

import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { EavDynamicFormModule } from '../eav-dynamic-form/eav-dynamic-form.module';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { EavMaterialControlsModule } from '../eav-material-controls/eav-material-controls.module';
import { reducers } from '../shared/store';

// import { ItemEffects } from '../shared/effects/item.effects';
// import { ContentTypeEffects } from '../shared/effects/content-type.effects';
// import { EavEffects } from '../shared/effects/eav.effects';
import { TranslateModule } from '@ngx-translate/core';
import { OpenMultiItemDialogComponent } from './dialogs/open-multi-item-dialog/open-multi-item-dialog.component';
import { MultiItemEditFormHeaderComponent } from './multi-item-edit-form-header/multi-item-edit-form-header.component';
import { MultiItemEditFormDebugComponent } from './multi-item-edit-form-debug/multi-item-edit-form-debug.component';

@NgModule({
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    OpenMultiItemDialogComponent,
    MultiItemEditFormHeaderComponent,
    MultiItemEditFormDebugComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
    StoreModule.forFeature('eavItemDialog', reducers),
    // EffectsModule.forFeature([ItemEffects, ContentTypeEffects, EavEffects]),
    TranslateModule.forChild()
  ],
  entryComponents: [
    MultiItemEditFormComponent
  ],
  exports: [RouterModule],
  providers: [],
})
export class EavItemDialogModule { }
