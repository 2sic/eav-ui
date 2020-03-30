import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AgGridModule } from '@ag-grid-community/angular';

import { ContentTypeFieldsRoutingModule } from './content-type-fields-routing.module';
import { Context } from '../shared/context/context';
import { ContentTypeFieldsComponent } from './content-type-fields.component';
import { ContentTypeFieldsTitleComponent } from './content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsInputTypeComponent } from './content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsActionsComponent } from './content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypesService } from '../app-administration/shared/services/content-types.service';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { EditContentTypeFieldsComponent } from './edit-content-type-fields/edit-content-type-fields.component';

@NgModule({
  declarations: [
    ContentTypeFieldsComponent,
    ContentTypeFieldsTitleComponent,
    ContentTypeFieldsInputTypeComponent,
    ContentTypeFieldsActionsComponent,
    EditContentTypeFieldsComponent,
  ],
  entryComponents: [
    ContentTypeFieldsComponent,
    ContentTypeFieldsTitleComponent,
    ContentTypeFieldsInputTypeComponent,
    ContentTypeFieldsActionsComponent,
    EditContentTypeFieldsComponent,
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
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
  ]
})
export class ContentTypeFieldsModule { }
