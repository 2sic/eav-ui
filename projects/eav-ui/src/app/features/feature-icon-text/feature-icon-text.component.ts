import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeatureComponentBase } from '../shared/base-feature.component';

@Component({
    selector: 'app-feature-icon-text',
    templateUrl: './feature-icon-text.component.html',
    styleUrls: ['./feature-icon-text.component.scss'],
    imports: [
        MatIconModule,
        TippyDirective,
    ]
})
export class FeatureIconTextComponent extends FeatureComponentBase { }
