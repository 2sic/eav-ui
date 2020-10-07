import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HelpPopupComponent, SelectorWithHelpComponent } from '.';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { DevRestRoutingModule } from './dev-rest-routing.module';
import { DevRestComponent } from './dev-rest.component';

@NgModule({
  declarations: [
    DevRestComponent,
    SelectorWithHelpComponent,
    HelpPopupComponent,
  ],
  entryComponents: [
    DevRestComponent,
    SelectorWithHelpComponent,
    HelpPopupComponent,
  ],
  imports: [
    CommonModule,
    DevRestRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatListModule,
    MatIconModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    AppDialogConfigService,
  ]
})
export class DevRestModule { }
