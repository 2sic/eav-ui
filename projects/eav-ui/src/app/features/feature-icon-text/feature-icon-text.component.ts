import { Component } from '@angular/core';
import { FeatureComponentBase, FeatureComponentProviders } from '../shared/base-feature.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-feature-icon-text',
    templateUrl: './feature-icon-text.component.html',
    styleUrls: ['./feature-icon-text.component.scss'],
    standalone: true,
    imports: [
      MatIconModule,
      SharedComponentsModule,
      AsyncPipe,
      TranslateModule,
    ],
    providers: [
      ...FeatureComponentProviders,
    ],
})
export class FeatureIconTextComponent extends FeatureComponentBase { }
