import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevRestBaseViewModel } from '..';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { InfoBoxComponent } from '../info-box/info-box.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
  selector: 'app-dev-rest-urls-and-code',
  templateUrl: './dev-rest-urls-and-code.component.html',
  styleUrls: ['./dev-rest-urls-and-code.component.scss'],
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    TippyDirective,
    MatIconModule,
    InfoBoxComponent,
  ]
})
export class DevRestUrlsAndCodeComponent {
  @Input() data: DevRestBaseViewModel;
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) { }

  callApiGet(url: string) {
    this.http.get<any>(url).subscribe(res => {
      console.log(`Called ${url} and got this:`, res);
      this.openSnackBar(`Called ${url}. You can see the full result in the F12 console`, 'API call returned');
    });
    this.openSnackBar(`Calling ${url}. You can see the full result in the F12 console`, 'API call sent');
  }

  copyCode(text: string) {
    copyToClipboard(text);
    this.openSnackBar('Copied to clipboard');
  }

  private openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
