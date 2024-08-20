import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-snack-bar-warning-demo',
  templateUrl: './snack-bar-warning-demo.component.html',
  styleUrls: ['./snack-bar-warning-demo.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    SafeHtmlPipe,
  ],
})
export class SnackBarWarningDemoComponent {
  constructor() { }
}
