import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Context } from '../shared/services/context';
import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { EavService } from '../edit/shared/services';
import { TranslateModule } from '@ngx-translate/core';
import { buildTranslateConfiguration } from '../shared/translation';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';

@NgModule({
  imports: [
    ManageContentListRoutingModule,
    MatDialogModule,
    // @2dg New in app.Module, remove after Test
    // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
  ],
  providers: [
    Context,
    EavService,
  ]
})
export class ManageContentListModule { }
