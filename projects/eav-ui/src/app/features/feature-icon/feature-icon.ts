import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeatureComponentBase } from '../shared/base-feature';

@Component({
    selector: 'app-feature-icon',
    templateUrl: './feature-icon.html',
    imports: [
        MatIconModule,
        TippyDirective,
    ]
})
export class FeatureIconComponent extends FeatureComponentBase { }
