import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';

@Component({
    selector: 'app-snack-bar-warning-demo',
    templateUrl: './snack-bar-warning-demo.component.html',
    styleUrls: ['./snack-bar-warning-demo.component.scss'],
    standalone: true,
    imports: [SharedComponentsModule, TranslateModule],
})
export class SnackBarWarningDemoComponent {
  constructor( ) { }
}
