import { Component } from '@angular/core';
import { map } from 'rxjs';
import { AppDialogConfigService } from '../services/app-dialog-config.service';
import { AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../../shared/shared-components.module';

@Component({
    selector: 'app-getting-started',
    templateUrl: './getting-started.component.html',
    styleUrls: ['./getting-started.component.scss'],
    standalone: true,
    imports: [SharedComponentsModule, AsyncPipe],
})
export class GettingStartedComponent {

  gettingStartedUrl$ = this.appDialogConfigService.getCurrent$().pipe(map(
    dialogSettings => dialogSettings.Context.App.GettingStartedUrl
  ));

  constructor(private appDialogConfigService: AppDialogConfigService)
   {}


}
