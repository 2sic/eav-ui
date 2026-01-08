import { Component, input, OnDestroy, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { DocsLinkHelper } from '../../../admin-shared/docs-link-helper/docs-link-helper';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { GoToMetadata } from '../../../metadata';
import { eavConstants } from '../../../shared/constants/eav.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { DialogSettings } from '../../../shared/models/dialog-settings.model';
import { ItemIdHelper } from '../../../shared/models/item-id-helper';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { Context } from '../../../shared/services/context';
import { AppInternals } from '../../models/app-internals.model';

@Component({
  selector: 'app-app-configuration-card',
  templateUrl: './app-configuration-card.html',
  styleUrls: ['./app-configuration-card.scss'],
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    TippyDirective,
    DocsLinkHelper,
  ]
})
export class AppConfigurationCard implements OnDestroy {
  dialogSettings = input.required<DialogSettings>();
  appSettingsInternal = input.required<AppInternals>();
  refresh = input.required<number>();

  #contentItemsSvc = transient(ContentItemsService);
  #dialogRouter = transient(DialogRoutingService);

  appConfigurationUrl = signal('');
  appConfigAvailable = signal(false);

  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
  ) {
    this.appConfigurationUrl = (this.urlToEdit());

    // debug
    // effect(() => {
    //   const ci = this.contentItem();
    //   console.log("CI", ci);
    // });
  }

  contentItem = this.#contentItemsSvc.getAllLive(
    eavConstants.contentTypes.appConfiguration,
    this.refresh
  ).value;

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  protected clipboard = transient(ClipboardService);

  #urlTo(url: string, queryParams?: { [key: string]: string }, errComponent?: string) {
    let newUrl = '#' + this.#dialogRouter.urlSubRoute(url);

    if (queryParams)
      newUrl += `?${new URLSearchParams(queryParams).toString()}`;
    if (errComponent)
      newUrl += `&errComponent=${errComponent}`;

    return newUrl;
  }

  urlToEdit() {
    let url = signal('');
    this.#contentItemsSvc.getAllPromise(
      eavConstants.contentTypes.appConfiguration
    ).then(contentItems => {

      if (contentItems.length !== 1) {
        url.set(this.#urlTo('message/e', { error: 'AppAdmin.ErrorTooManyAppSettings', errComponent: 'App-Specifications', openUrl:"/data/System.App" }));
        return url;
      }

      this.appConfigAvailable.set(true);

      url.set(this.#urlTo(
        `edit/${convertFormToUrl({
          items: [ItemIdHelper.editId(contentItems[0].Id)],
        })}`
      ));
    });
    return url;
  }

  urlToOpenMetadata() {
    return this.#urlTo(
      GoToMetadata.getUrlApp(
        this.context.appId,
        `Metadata for App: ${this.dialogSettings().Context.App.Name} (${this.context.appId})`,
      )
    );
  }

  formatValue(value?: string): string {
    return value === "" ? "-" : value ?? "-";
  }
}
