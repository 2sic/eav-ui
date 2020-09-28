import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentTypeFieldsActionsComponent } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsInputTypeComponent } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsTitleComponent } from './ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTypeComponent } from './ag-grid-components/content-type-fields-type/content-type-fields-type.component';
import { ContentTypeFieldsRoutingModule } from './content-type-fields-routing.module';
import { ContentTypeFieldsComponent } from './content-type-fields.component';
import { EditContentTypeFieldsComponent } from './edit-content-type-fields/edit-content-type-fields.component';
import { ContentTypesFieldsService } from './services/content-types-fields.service';

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
    MatMenuModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
  ]
})
export class ContentTypeFieldsModule { }
