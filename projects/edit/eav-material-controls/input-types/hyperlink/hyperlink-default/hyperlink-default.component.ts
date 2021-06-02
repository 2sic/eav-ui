import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AdamItem, AdamPostResponse } from '../../../../../edit-types';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService, FileTypeService } from '../../../../shared/services';
import { LinkCacheService } from '../../../../shared/store/ngrx-data';
import { AdamService } from '../../../adam/adam.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
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
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    fileTypeService: FileTypeService,
    adamService: AdamService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    private editRoutingService: EditRoutingService,
  ) {
    super(
      eavService,
      validationMessagesService,
      fieldsSettingsService,
      fileTypeService,
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
      combineLatest([open$, this.value$, this.preview$, this.label$, this.placeholder$, this.required$]),
      combineLatest([settings$, this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [open, value, preview, label, placeholder, required],
        [settings, disabled, touched],
      ]) => {
        const templateVars: HyperlinkDefaultTemplateVars = {
          open,
          buttonAdam: settings._buttonAdam,
          buttonPage: settings._buttonPage,
          buttonMore: settings._buttonMore,
          showAdam: settings.ShowAdam,
          showPagePicker: settings.ShowPagePicker,
          showImageManager: settings.ShowImageManager,
          showFileManager: settings.ShowFileManager,
          value,
          preview,
          label,
          placeholder,
          required,
          disabled,
          touched,
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
