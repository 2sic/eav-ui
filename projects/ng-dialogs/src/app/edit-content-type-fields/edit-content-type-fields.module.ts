import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

import { EditContentTypeFieldsRoutingModule } from './edit-content-type-fields-routing.module';
import { EditContentTypeFieldsComponent } from './edit-content-type-fields.component';
import { Context } from '../shared/context/context';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { ContentTypesService } from '../app-administration/shared/services/content-types.service';
import { ContentTypesFieldsService } from '../app-administration/shared/services/content-types-fields.service';

@NgModule({
  declarations: [
    EditContentTypeFieldsComponent,
  ],
  entryComponents: [
    EditContentTypeFieldsComponent,
  ],
  imports: [
    CommonModule,
    EditContentTypeFieldsRoutingModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    SharedComponentsModule,
    MatDialogModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
  ]
})
export class EditContentTypeFieldsModule { }
