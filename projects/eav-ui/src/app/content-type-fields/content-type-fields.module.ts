import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
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
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
  ]
})
export class ContentTypeFieldsModule { }
