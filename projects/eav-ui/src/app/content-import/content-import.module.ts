import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentImportRoutingModule } from './content-import-routing.module';
import { ContentImportComponent } from './content-import.component';
import { ContentImportService } from './services/content-import.service';

@NgModule({
  declarations: [
    ContentImportComponent,
  ],
  imports: [
    CommonModule,
    ContentImportRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatRadioModule,
  ],
  providers: [
    Context,
    ContentImportService,
    AppDialogConfigService,
    ContentTypesService,
  ]
})
export class ContentImportModule { }
