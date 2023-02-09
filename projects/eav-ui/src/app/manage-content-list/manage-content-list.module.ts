import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { ManageContentListComponent } from './manage-content-list.component';
import { ContentGroupService } from './services/content-group.service';
import { buildTranslateConfiguration } from '../shared/translation';
import { EavService } from '../edit/shared/services';
import { AppDialogConfigService } from '../app-administration/services';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';

@NgModule({
  declarations: [
    ManageContentListComponent,
  ],
  imports: [
    CommonModule,
    ManageContentListRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    MatSnackBarModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
  ],
  providers: [
    Context,
    ContentGroupService,
    EavService,
    AppDialogConfigService
  ]
})
export class ManageContentListModule { }
