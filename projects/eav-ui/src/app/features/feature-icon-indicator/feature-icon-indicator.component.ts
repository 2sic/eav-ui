import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
    selector: 'app-feature-icon-indicator',
    templateUrl: './feature-icon-indicator.component.html',
    imports: [
        MatIconModule,
        TippyDirective,
    ]
})
export class FeatureIconIndicatorComponent extends FeatureComponentBase { }
