import { Component, computed, input, OnDestroy } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { DocsLinkHelper } from '../../../admin-shared/docs-link-helper/docs-link-helper';
import { GoToMetadata } from '../../../metadata';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { DialogSettings } from '../../../shared/models/dialog-settings.model';
import { ItemIdHelper } from '../../../shared/models/item-id-helper';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { Context } from '../../../shared/services/context';
import { convertFormToUrl } from '../../../shared/url/url-converter';
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

  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
  ) { }

  contentItem = computed(() => this.appSettingsInternal()?.EntityLists.AppConfig);
  appConfigurationUrl = computed(() => this.urlToEdit());

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  protected clipboard = transient(ClipboardService);

  #urlTo(url: string, queryParams?: { [key: string]: string }, errComponent?: string) {
    let newUrl = this.#dialogRouter.linkSubRoute(url);

    if (queryParams)
      newUrl += `?${new URLSearchParams(queryParams).toString()}`;
    if (errComponent)
      newUrl += `&errComponent=${errComponent}`;

    return newUrl;
  }

  urlToEdit() {
    const contentItems = this.contentItem();
    if (!contentItems)
      return '';
    if (contentItems.length !== 1)
      return this.#urlTo('message/e', { error: 'AppAdmin.ErrorTooManyAppSettings', errComponent: 'App-Specifications', openUrl:"/data/System.App" });

    return this.#urlTo(
      `edit/${convertFormToUrl({
        items: [ItemIdHelper.editId(contentItems[0].Id)],
      })}`
    );
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
