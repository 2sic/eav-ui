import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureIconComponent } from './feature-icon/feature-icon.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { TranslateModule } from '@ngx-translate/core';
import { buildTranslateConfiguration } from '../shared/translation';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';
import { FeatureService } from '../edit/shared/store/ngrx-data';
import { FeatureInfoDialogComponent } from './feature-info-dialog/feature-info-dialog.component';


@NgModule({
  declarations: [
    FeatureIconComponent,
    FeatureInfoDialogComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    SharedComponentsModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
  ],
  exports: [
    FeatureIconComponent,
    FeatureInfoDialogComponent,
  ],
  providers: [
    FeatureService,
  ]
})
export class FeaturesModule { }
