import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureIconTextComponent } from './feature-icon-text/feature-icon-text.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { TranslateModule } from '@ngx-translate/core';
import { buildTranslateConfiguration } from '../shared/translation';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';
import { FeatureService } from '../edit/shared/store/ngrx-data';
import { FeatureInfoDialogComponent } from './feature-info-dialog/feature-info-dialog.component';
import { FeatureIconComponent } from './feature-icon/feature-icon.component';


@NgModule({
  declarations: [
    FeatureIconComponent,
    FeatureIconTextComponent,
    FeatureInfoDialogComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SharedComponentsModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
  ],
  exports: [
    FeatureIconComponent,
    FeatureIconTextComponent,
    FeatureInfoDialogComponent,
  ],
  providers: [
    FeatureService,
  ]
})
export class FeaturesModule { }
