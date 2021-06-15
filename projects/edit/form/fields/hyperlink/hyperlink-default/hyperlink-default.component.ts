import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AdamItem, AdamPostResponse } from '../../../../../edit-types';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { LinkCacheService } from '../../../../shared/store/ngrx-data';
import { ComponentMetadata } from '../../../builder/fields-builder/component-metadata.decorator';
import { HyperlinkDefaultBaseComponent } from './hyperlink-default-base.component';
import { HyperlinkDefaultLogic } from './hyperlink-default-logic';
import { HyperlinkDefaultTemplateVars } from './hyperlink-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-default',
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.scss'],
})
@ComponentMetadata({
  wrappers: [
    WrappersConstants.DropzoneWrapper,
    WrappersConstants.LocalizationWrapper,
    WrappersConstants.HyperlinkDefaultExpandableWrapper,
    WrappersConstants.AdamAttachWrapper,
  ],
})
export class HyperlinkDefaultComponent extends HyperlinkDefaultBaseComponent implements OnInit, OnDestroy {
  templateVars$: Observable<HyperlinkDefaultTemplateVars>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    adamService: AdamService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    private editRoutingService: EditRoutingService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      adamService,
      dialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
    );
    HyperlinkDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    this.attachAdam();

    const open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    const settings$ = this.settings$.pipe(
      map(settings => ({
        _buttonAdam: settings.Buttons.includes('adam'),
        _buttonPage: settings.Buttons.includes('page'),
        _buttonMore: settings.Buttons.includes('more'),
        ShowAdam: settings.ShowAdam,
        ShowPagePicker: settings.ShowPagePicker,
        ShowImageManager: settings.ShowImageManager,
        ShowFileManager: settings.ShowFileManager,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual)
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([open$, this.preview$, settings$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [open, preview, settings],
      ]) => {
        const templateVars: HyperlinkDefaultTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          open,
          buttonAdam: settings._buttonAdam,
          buttonPage: settings._buttonPage,
          buttonMore: settings._buttonMore,
          showAdam: settings.ShowAdam,
          showPagePicker: settings.ShowPagePicker,
          showImageManager: settings.ShowImageManager,
          showFileManager: settings.ShowFileManager,
          preview,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  toggleAdam(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.config.adam.toggle(usePortalRoot, showImagesOnly);
  }

  private attachAdam() {
    this.subscription.add(
      this.settings$.pipe(
        map(settings => ({
          Paths: settings.Paths,
          FileFilter: settings.FileFilter,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(settings => {
        this.config.adam.onItemClick = (item: AdamItem) => { this.setValue(item); };
        this.config.adam.onItemUpload = (item: AdamPostResponse) => { this.setValue(item); };
        this.config.adam.setConfig({
          rootSubfolder: settings.Paths,
          fileFilter: settings.FileFilter,
          autoLoad: true,
        });
      })
    );
  }

  private setValue(item: AdamItem | AdamPostResponse) {
    const usePath = this.settings$.value.ServerResourceMapping === 'url';
    const newValue = !usePath ? `file:${item.Id}` : (item as AdamItem).Url ?? (item as AdamPostResponse).Path;
    GeneralHelpers.patchControlValue(this.control, newValue);
  }
}
