import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { GoToMetadata } from '../../../metadata';
import { eavConstants } from '../../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { DialogSettings } from '../../../shared/models/dialog-settings.model';
import { EditForm } from '../../../shared/models/edit-form.model';
import { Context } from '../../../shared/services/context';
import { AppInternalsService } from '../../services/app-internals.service';
import { Subject, Observable, combineLatest, map } from 'rxjs';
import { AppInternals } from '../../models/app-internals.model';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { transient } from '../../../core';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-app-configuration-card',
  templateUrl: './app-configuration-card.component.html',
  styleUrls: ['./app-configuration-card.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatBadgeModule,
    AsyncPipe,
    TippyDirective,
  ],
})
export class AppConfigurationCardComponent implements OnInit, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();
  viewModel$: Observable<ViewModel>;

  #appInternalsSvc = transient(AppInternalsService);

  #contentItemsSvc = transient(ContentItemsService);
  #dialogRouter = transient(DialogRoutingService);
  
  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
  ) {
    // New with proper ViewModel
    this.viewModel$ = combineLatest([
      this.appSettingsInternal$,
      this.#contentItemsSvc.getAll(eavConstants.contentTypes.appConfiguration),
    ]).pipe(map(([settings, contentItems]) => {
      const contentItem = contentItems[0];
      const result: ViewModel = {
        appConfigurationsCount: settings.EntityLists.ToSxcContentApp.length,
        appMetadataCount: settings.MetadataList.Items.length,
        displayName: contentItem?.DisplayName ?? '-',
        folder: contentItem?.Folder ?? '-',
        version: contentItem?.Version ?? '-',
        toSxc: contentItem?.RequiredVersion ?? '-',
        dnn: contentItem?.RequiredDnnVersion ?? '-',
        oqt: contentItem?.RequiredOqtaneVersion ?? '-',
      }
      return result;
    }));
  }

  ngOnInit() {
    this.fetchSettings();
    this.#dialogRouter.doOnDialogClosed(() => { this.fetchSettings(); });
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  edit() {
    const staticName = eavConstants.contentTypes.appConfiguration;
    this.#contentItemsSvc.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;

      if (contentItems.length < 1) throw new Error(`Found no settings for type ${staticName}`);
      if (contentItems.length > 1) throw new Error(`Found too many settings for type ${staticName}`);
      form = {
        items: [{ EntityId: contentItems[0].Id }],
      };

      const formUrl = convertFormToUrl(form);
      this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
    });
  }

  openMetadata() {
    const url = GoToMetadata.getUrlApp(
      this.context.appId,
      `Metadata for App: ${this.dialogSettings.Context.App.Name} (${this.context.appId})`,
    );
    this.#dialogRouter.navParentFirstChild([url]);
  }

  private fetchSettings() {
    const getObservable = this.#appInternalsSvc.getAppInternals();
    getObservable.subscribe(x => {
      // 2dm - New mode for Reactive UI
      this.appSettingsInternal$.next(x);
    });
  }
}

class ViewModel {
  appConfigurationsCount: number;
  appMetadataCount: number;
  displayName: string;
  folder: string;
  version: string;
  toSxc: string;
  dnn: string;
  oqt: string;
}
