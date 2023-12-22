import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentExportRoutingModule } from './content-export-routing.module';
import { ContentExportComponent } from './content-export.component';
import { ContentExportService } from './services/content-export.service';

@NgModule({
  declarations: [
    ContentExportComponent,
  ],
  imports: [
    CommonModule,
    ContentExportRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
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
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } }
  ]
})
export class ContentExportModule { }
