import { Component } from '@angular/core';
import { map } from 'rxjs';
import { AppDialogConfigService } from '../services/app-dialog-config.service';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
})
export class GettingStartedComponent {

  gettingStartedUrl$ = this.appDialogConfigService.getShared$().pipe(map(
    dialogSettings => dialogSettings.Context.App.GettingStartedUrl
  ));

  constructor(private appDialogConfigService: AppDialogConfigService)
   {}


}
