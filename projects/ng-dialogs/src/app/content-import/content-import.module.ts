import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
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
