import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { GoToMetadata } from '../../../metadata';
import { BaseWithChildDialogComponent } from '../../../shared/components/base-component/base-with-child-dialog.component';
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
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-app-configuration-card',
    templateUrl: './app-configuration-card.component.html',
    styleUrls: ['./app-configuration-card.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        MatIconModule,
        SharedComponentsModule,
        NgTemplateOutlet,
        MatButtonModule,
        MatBadgeModule,
        AsyncPipe,
    ],
})
export class AppConfigurationCardComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();
  viewModel$: Observable<ViewModel>;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private context: Context,
    private snackBar: MatSnackBar,
    private appInternalsService: AppInternalsService) {
    super(router, route);

    // New with proper ViewModel
    this.viewModel$ = combineLatest([
      this.appSettingsInternal$,
      this.contentItemsService.getAll(eavConstants.contentTypes.appConfiguration),
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
    this.subscription.add(this.childDialogClosed$().subscribe(() => { this.fetchSettings(); }));
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
    super.ngOnDestroy();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  edit() {
    const staticName = eavConstants.contentTypes.appConfiguration;
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;

      if (contentItems.length < 1) throw new Error(`Found no settings for type ${staticName}`);
      if (contentItems.length > 1) throw new Error(`Found too many settings for type ${staticName}`);
      form = {
        items: [{ EntityId: contentItems[0].Id }],
      };

      const formUrl = convertFormToUrl(form);
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.parent.firstChild });
    });
  }

  openMetadata() {
    const url = GoToMetadata.getUrlApp(
      this.context.appId,
      `Metadata for App: ${this.dialogSettings.Context.App.Name} (${this.context.appId})`,
    );
    this.router.navigate([url], { relativeTo: this.route.parent.firstChild });
  }

  private fetchSettings() {
    const getObservable = this.appInternalsService.getAppInternals(eavConstants.metadata.app.targetType, eavConstants.metadata.app.keyType, this.context.appId);
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
