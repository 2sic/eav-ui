import { Component } from '@angular/core';
import { map } from 'rxjs';
import { transient } from '../../../../../core';
import { DialogConfigAppService } from '../services/dialog-config-app.service';

@Component({
  selector: 'app-extensions',
  templateUrl: './app-extensions.component.html',
  styleUrls: ['./app-extensions.component.scss'],
})
export class AppExtensionsComponent {

  private dialogConfigSvc = transient(DialogConfigAppService);

  gettingStartedUrl$ = this.dialogConfigSvc.getCurrent$().pipe(map(
    dialogSettings => dialogSettings.Context.App.GettingStartedUrl
  ));
}
