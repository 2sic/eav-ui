import { NgModule } from '@angular/core';
import { FeatureIconTextComponent } from './feature-icon-text/feature-icon-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { buildTranslateConfiguration } from '../shared/translation';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';
import { FeatureInfoDialogComponent } from './feature-info-dialog/feature-info-dialog.component';
import { FeatureIconComponent } from './feature-icon/feature-icon.component';
import { FeatureTextInfoComponent } from './feature-text-info/feature-text-info.component';
import { FeatureIconIndicatorComponent } from './feature-icon-indicator/feature-icon-indicator.component';
import { FeatureDetailService } from './services/feature-detail.service';

@NgModule({
    imports: [
        // @2dg New in app.Module, remove after Test
        // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
        FeatureIconComponent,
        FeatureIconTextComponent,
        FeatureInfoDialogComponent,
        FeatureTextInfoComponent,
        FeatureIconIndicatorComponent,
    ],
    exports: [
        FeatureIconComponent,
        FeatureIconTextComponent,
        FeatureInfoDialogComponent,
        FeatureTextInfoComponent,
        FeatureIconIndicatorComponent,
    ],
    providers: [
        FeatureDetailService
    ]
})
export class FeaturesModule { }
