import { Component, computed, Input, OnDestroy, OnInit, signal } from '@angular/core';
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
import { EditForm, EditPrep } from '../../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { Context } from '../../../shared/services/context';
import { AppInternalsService } from '../../services/app-internals.service';

@Component({
  selector: 'app-app-configuration-card',
  templateUrl: './app-configuration-card.component.html',
  styleUrls: ['./app-configuration-card.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    TippyDirective,
    DocsLinkHelperComponent,
  ],
})
export class AppConfigurationCardComponent implements OnInit, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  #appInternalsSvc = transient(AppInternalsService);
  #contentItemsSvc = transient(ContentItemsService);
  #dialogRouter = transient(DialogRoutingService);


  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
  ) { }

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

  formatValue(value?: string): string {
    return value === "" ? "-" : value ?? "-";
  }

}

