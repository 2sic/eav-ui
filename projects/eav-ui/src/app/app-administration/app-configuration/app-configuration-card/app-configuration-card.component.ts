import { Component, computed, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { DocsLinkHelperComponent } from '../../../admin-shared/docs-link-helper/docs-link-helper.component';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { GoToMetadata } from '../../../metadata';
import { eavConstants } from '../../../shared/constants/eav.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { DialogSettings } from '../../../shared/models/dialog-settings.model';
import { EditPrep } from '../../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { Context } from '../../../shared/services/context';
import { AppInternalsService } from '../../services/app-internals.service';

@Component({
    selector: 'app-app-configuration-card',
    templateUrl: './app-configuration-card.component.html',
    styleUrls: ['./app-configuration-card.component.scss'],
    imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatBadgeModule,
        TippyDirective,
        DocsLinkHelperComponent,
    ]
})
export class AppConfigurationCardComponent implements OnInit, OnDestroy {
  dialogSettings = input.required<DialogSettings>();

  #appInternalsSvc = transient(AppInternalsService);
  #contentItemsSvc = transient(ContentItemsService);
  #dialogRouter = transient(DialogRoutingService);

  appConfigurationUrl = signal('');

  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
  ) {
    this.appConfigurationUrl = (this.urlToEdit());
  }

  contentItem = this.#contentItemsSvc.getAllSig(eavConstants.contentTypes.appConfiguration, undefined);

  #refresh = signal(0);

  appSettingsInternal = computed(() => {
    const refresh = this.#refresh();
    return this.#appInternalsSvc.getAppInternals(undefined);
  });

  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => {
      this.#refresh.update(value => value + 1);
    });
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  protected clipboard = transient(ClipboardService);

  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  urlToEdit() {
    let url = signal('');
    const staticName = eavConstants.contentTypes.appConfiguration;
    this.#contentItemsSvc.getAll(staticName).subscribe(contentItems => {

      if (contentItems.length < 1)
        this.#dialogRouter.navRelative(['message/e'], {
          queryParams: { error: 'AppAdmin.ErrorNoAppSettings' },
        });
      if (contentItems.length > 1)
        this.#dialogRouter.navRelative(['message/e'], {
          queryParams: { error: 'AppAdmin.ErrorTooManyAppSettings' },
        });

      url.set(this.#urlTo(
        `edit/${convertFormToUrl({
          items: [EditPrep.editId(contentItems[0].Id)],
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
