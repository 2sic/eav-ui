import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

import { ContentExportRoutingModule } from './content-export-routing.module';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentExportComponent } from './content-export.component';
import { ContentExportService } from '../app-administration/shared/services/content-export.service';
import { Context } from '../shared/services/context';

@NgModule({
  declarations: [
    ContentExportComponent,
  ],
  entryComponents: [
    ContentExportComponent,
  ],
  imports: [
    CommonModule,
    ContentExportRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
  ],
  providers: [
    Context,
    ContentExportService,
  ]
})
export class ContentExportModule { }
