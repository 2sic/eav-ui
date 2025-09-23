import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs';
import { transient } from '../../../../../core';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { AppExtensionsService } from './app-extensions.service';

@Component({
  selector: 'app-extensions',
  templateUrl: './app-extensions.component.html',
  styleUrls: ['./app-extensions.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ]
})
export class AppExtensionsComponent {
  private dialogConfigSvc = transient(DialogConfigAppService);
  private extensionsSvc = transient(AppExtensionsService);

  gettingStartedUrl$ = this.dialogConfigSvc.getCurrent$().pipe(map(
    dialogSettings => dialogSettings.Context.App.GettingStartedUrl
  ));

  // raw JSON from API
  extensions = toSignal(this.extensionsSvc.getExtensions$(), { initialValue: null });
}