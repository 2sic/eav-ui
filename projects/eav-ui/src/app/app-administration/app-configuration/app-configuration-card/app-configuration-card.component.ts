import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../../core';
import { ContentItem } from '../../../content-items/models/content-item.model';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { GoToMetadata } from '../../../metadata';
import { eavConstants } from '../../../shared/constants/eav.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { DialogSettings } from '../../../shared/models/dialog-settings.model';
import { EditForm, EditPrep } from '../../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { Context } from '../../../shared/services/context';
import { AppInternals } from '../../models/app-internals.model';
import { AppInternalsService } from '../../services/app-internals.service';

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
    TippyDirective,
  ],
})
export class AppConfigurationCardComponent implements OnInit, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  contentItem = signal<ContentItem>(undefined);
  appSettingsInternal = signal<AppInternals>(undefined);

  #appInternalsSvc = transient(AppInternalsService);
  #contentItemsSvc = transient(ContentItemsService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.fetchSettings();
    this.#dialogRouter.doOnDialogClosed(() => { this.fetchSettings(); });

    this.#contentItemsSvc.getAll(eavConstants.contentTypes.appConfiguration).subscribe(contentItems => {
      this.contentItem.set(contentItems[0]);
    });
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
        items: [EditPrep.editId(contentItems[0].Id)],
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
      this.appSettingsInternal.set(x);
    });
  }

  formatValue(value?: string): string {
    return value === "" ? "-" : value ?? "-";
  }

}

