import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Context } from '../shared/services/context';
import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { FormConfigService } from '../edit/shared/services';

@NgModule({
  imports: [
    ManageContentListRoutingModule,
    // @2dg Remove after Test
    // MatDialogModule,

    // @2dg New in app.Module, remove after Test
    // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
  ],
  providers: [
    Context,
    FormConfigService,
  ]
})
export class ManageContentListModule { }
