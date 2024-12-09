import { HttpClient } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevRestBaseModel } from '..';
import { transient } from '../../../../../core/transient';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { InfoBoxComponent } from '../info-box/info-box.component';

@Component({
    selector: 'app-dev-rest-urls-and-code',
    templateUrl: './dev-rest-urls-and-code.component.html',
    styleUrls: ['./dev-rest-urls-and-code.component.scss'],
    imports: [
        MatExpansionModule,
        MatButtonModule,
        TippyDirective,
        MatIconModule,
        InfoBoxComponent,
    ]
})
export class DevRestUrlsAndCodeComponent {
  data = input<DevRestBaseModel>();

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) { }

  protected clipboard = transient(ClipboardService);

  callApiGet(url: string) {
    this.http.get<any>(url).subscribe(res => {
      console.log(`Called ${url} and got this:`, res);
      this.openSnackBar(`Called ${url}. You can see the full result in the F12 console`, 'API call returned');
    });
    this.openSnackBar(`Calling ${url}. You can see the full result in the F12 console`, 'API call sent');
  }

  private openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
