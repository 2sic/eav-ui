import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, Store } from '@ngrx/store';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatIconModule,
  MatMenuModule,
  MatSnackBarModule,
  MatDialogContent,
  MatDialogModule
} from '@angular/material';

import { MultiItemEditFormComponent } from './multi-item-edit-form/multi-item-edit-form.component';
import { EavDynamicFormModule } from '../eav-dynamic-form/eav-dynamic-form.module';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { EavMaterialControlsModule } from '../eav-material-controls/eav-material-controls.module';
import { reducers } from '../shared/store';

import { ItemEffects } from '../shared/effects/item.effects';
import { ContentTypeEffects } from '../shared/effects/content-type.effects';
import { EavEffects } from '../shared/effects/eav.effects';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { DialogOverviewExampleDialogComponent } from './dialogs/dialog-overview-example-dialog/dialog-overview-example-dialog.component';
import { OpenMultiItemDialogComponent } from './dialogs/open-multi-item-dialog/open-multi-item-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: OpenMultiItemDialogComponent
    // component: MultiItemEditFormComponent
  }
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './../i18n/ng-edit/', '.json');
}

@NgModule({
  declarations: [
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    DialogOverviewExampleDialogComponent,
    OpenMultiItemDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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
    EavDynamicFormModule,
    EavMaterialControlsModule,
    MatDialogModule,
    StoreModule.forFeature('eavItemDialog', reducers),
    EffectsModule.forFeature([ItemEffects, ContentTypeEffects, EavEffects]),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      isolate: true
    })
  ],
  entryComponents: [
    MultiItemEditFormComponent,
    DialogOverviewExampleDialogComponent
  ],
  exports: [RouterModule],
  providers: [],
})
export class EavItemDialogModule { }
