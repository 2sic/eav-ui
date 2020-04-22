import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AgGridModule } from '@ag-grid-community/angular';

import { ContentTypeFieldsRoutingModule } from './content-type-fields-routing.module';
import { Context } from '../shared/services/context';
import { ContentTypeFieldsComponent } from './content-type-fields.component';
import { ContentTypeFieldsTitleComponent } from './ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsInputTypeComponent } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsActionsComponent } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypesService } from '../app-administration/shared/services/content-types.service';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { EditContentTypeFieldsComponent } from './edit-content-type-fields/edit-content-type-fields.component';
import { ContentTypeFieldsTypeComponent } from './ag-grid-components/content-type-fields-type/content-type-fields-type.component';

@NgModule({
  declarations: [
    ContentTypeFieldsComponent,
    ContentTypeFieldsTitleComponent,
    ContentTypeFieldsInputTypeComponent,
    ContentTypeFieldsActionsComponent,
    EditContentTypeFieldsComponent,
    ContentTypeFieldsTypeComponent,
  ],
  entryComponents: [
    ContentTypeFieldsComponent,
    ContentTypeFieldsTitleComponent,
    ContentTypeFieldsInputTypeComponent,
    ContentTypeFieldsActionsComponent,
    EditContentTypeFieldsComponent,
    ContentTypeFieldsTypeComponent,
  ],
  imports: [
    CommonModule,
    ContentTypeFieldsRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AgGridModule.withComponents([]),
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatRippleModule,
    MatSnackBarModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
  ]
})
export class ContentTypeFieldsModule { }
