import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentExportService } from '../app-administration/services/content-export.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentExportRoutingModule } from './content-export-routing.module';
import { ContentExportComponent } from './content-export.component';

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
    AppDialogConfigService,
    ContentTypesService,
  ]
})
export class ContentExportModule { }
