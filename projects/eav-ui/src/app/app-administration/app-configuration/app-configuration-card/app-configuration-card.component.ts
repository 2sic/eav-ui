import { Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { transient } from '../../../../../../core';
import { DocsLinkHelperComponent } from '../../../admin-shared/docs-link-helper/docs-link-helper.component';
import { ClosingDialogState, DialogRoutingState } from '../../../apps-management/models/routeState.model';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { SaveEavFormData } from '../../../edit/dialog/main/edit-dialog-main.models';
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
  router = inject(Router);


  appConfigurationUrl = signal('');
  appConfigAvailable = signal(false);

  tempDisplayName = signal(''); 

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

  // TODO: @2pp - you recently changed this to customSettings which is wrong, unclear why you did it
  // contentItem = this.#contentItemsSvc.getAllSig(eavConstants.contentTypes.customSettings, /* initial: */ null);
  contentItem = this.#contentItemsSvc.getAllSig(eavConstants.contentTypes.appConfiguration, /* initial: */ null);

  #refresh = signal(0);

  appSettingsInternal = computed(() => {
    const _ = this.#refresh();
    return this.#appInternalsSvc.getAppInternals(undefined);
  });

  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => {
      this.#refresh.update(v => ++v);
    });


    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state && navigation.extras.state.dialogValue) {
          const state = navigation?.extras.state as ClosingDialogState<SaveEavFormData>;

          console.log("2dg Data after Close", state.dialogValue)
          const displayName = state.dialogValue?.Items?.[0]?.Entity?.Attributes?.String?.DisplayName?.["*"];
          this.tempDisplayName.set(displayName ?? '');
        }
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
    this.#contentItemsSvc.getAll(
      eavConstants.contentTypes.appConfiguration
    ).subscribe(contentItems => {

      if (contentItems.length !== 1)
        return ''

      this.appConfigAvailable.set(true);
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

  openAppConfigurationClick() {

    const data = {
      dialogValue: {
        Items: [
          {
            Entity: {
              Attributes: {
                String: {
                  DisplayName: {
                    "*": "Image Compare"
                  }
                }
              }
            }
          }
        ]
      }
    };

    let url = this.appConfigurationUrl();
    url = url.replace('#', '');
    this.router.navigate([url], {
      state: { returnValue: true, data: data  } as DialogRoutingState<any> // TODO: Type any
    });
  }

  formatValue(value?: string): string {
    return value === "" ? "-" : value ?? "-";
  }
}
