import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentTypeFieldsActionsComponent } from './content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsInputTypeComponent } from './content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsRoutingModule } from './content-type-fields-routing.module';
import { ContentTypeFieldsSpecialComponent } from './content-type-fields-special/content-type-fields-special.component';
import { ContentTypeFieldsTitleComponent } from './content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTypeComponent } from './content-type-fields-type/content-type-fields-type.component';
import { ContentTypeFieldsComponent } from './content-type-fields.component';
import { EditContentTypeFieldsComponent } from './edit-content-type-fields/edit-content-type-fields.component';
import { ReservedNamesValidatorDirective } from './edit-content-type-fields/reserved-names.directive';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { AddSharingFieldsComponent } from './add-sharing-fields/add-sharing-fields.component';
import { MatCardModule } from '@angular/material/card';
import { ShareOrInheritDialogComponent } from './content-type-fields-actions/share-or-inherit-dialog/share-or-inherit-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { FeaturesModule } from '../features/features.module';

@NgModule({
  declarations: [
    ContentTypeFieldsComponent,
    ContentTypeFieldsTitleComponent,
    ContentTypeFieldsInputTypeComponent,
    ContentTypeFieldsActionsComponent,
    EditContentTypeFieldsComponent,
    ContentTypeFieldsTypeComponent,
    ContentTypeFieldsSpecialComponent,
    ReservedNamesValidatorDirective,
    AddSharingFieldsComponent,
    ShareOrInheritDialogComponent,
  ],
  imports: [
    CommonModule,
    ContentTypeFieldsRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SxcGridModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatRippleModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule,
    MatTableModule,
    MatCardModule,
    TranslateModule,
    FeaturesModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } }
  ]
})
export class ContentTypeFieldsModule { }
