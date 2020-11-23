import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevRestDataTemplateVars } from '..';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-dev-rest-urls-and-code',
  templateUrl: './dev-rest-urls-and-code.component.html',
  styleUrls: ['./dev-rest-urls-and-code.component.scss']
})
export class DevRestUrlsAndCodeComponent {
  @Input() data: DevRestDataTemplateVars;
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
