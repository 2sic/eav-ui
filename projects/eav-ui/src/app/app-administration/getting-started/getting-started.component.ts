import { Component } from '@angular/core';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SafeResourceUrlPipe } from '../../shared/pipes/safe-resource-url';
import { transient } from '../../core';
import { DialogConfigAppService } from '../services/dialog-config-app.service';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    SafeResourceUrlPipe,
  ],
})
export class GettingStartedComponent {

  private dialogConfigSvc = transient(DialogConfigAppService);

  gettingStartedUrl$ = this.dialogConfigSvc.getCurrent$().pipe(map(
    dialogSettings => dialogSettings.Context.App.GettingStartedUrl
  ));


}
