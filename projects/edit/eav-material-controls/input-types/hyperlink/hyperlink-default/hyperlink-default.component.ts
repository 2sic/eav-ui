import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdamItem, AdamPostResponse } from '../../../../../edit-types';
import { FieldSettings } from '../../../../../edit-types';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { PrefetchLinks } from '../../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../../shared/services/fields-settings2new.service';
import { FileTypeService } from '../../../../shared/services/file-type.service';
import { PrefetchService } from '../../../../shared/store/ngrx-data/prefetch.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { DnnBridgeConnectorParams, PagePickerResult } from '../../dnn-bridge/dnn-bridge.models';
import { HyperlinkDefaultLogic } from './hyperlink-default-logic';
import { HyperlinkDefaultTemplateVars, Preview } from './hyperlink-default.models';

// TODO: warning: the two files are almost identical: hyperlink-default.component and hyperlink-default-expandable-wrapper.component

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
export class HyperlinkDefaultComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<HyperlinkDefaultTemplateVars>;

  private preview$: BehaviorSubject<Preview>;

  private prefetchLinks: PrefetchLinks = {};
  private fetchCache: PrefetchLinks = {};

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2NewService: FieldsSettings2NewService,
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private editRoutingService: EditRoutingService,
    private prefetchService: PrefetchService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
    HyperlinkDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.preview$ = new BehaviorSubject<Preview>({
      url: '',
      thumbnailUrl: '',
      thumbnailPreviewUrl: '',
      floatingText: '',
      isImage: false,
      isKnownType: false,
      icon: '',
    });
    this.subscription.add(
      this.prefetchService.getPrefetchedLinks().subscribe(links => {
        this.prefetchLinks = links;
      })
    );
    const buttons$ = this.settings$.pipe(map(settings => settings.Buttons));
    const open$ = this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid);
    this.subscription.add(
      this.settings$.subscribe(settings => {
        this.attachAdam(settings);
      })
    );
    this.subscription.add(
      this.value$.subscribe(value => {
        this.fetchLink(value);
      })
    );

    this.templateVars$ = combineLatest([
      combineLatest([open$, buttons$, this.settings$, this.value$, this.preview$, this.label$]),
      combineLatest([this.placeholder$, this.required$, this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [open, buttons, settings, value, preview, label],
        [placeholder, required, disabled, showValidation],
      ]) => {
        const templateVars: HyperlinkDefaultTemplateVars = {
          open,
          buttons,
          settings,
          value,
          preview,
          label,
          placeholder,
          required,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    this.preview$.complete();
    super.ngOnDestroy();
  }

  openPagePicker() {
    const settings = this.settings$.value;
    const params: DnnBridgeConnectorParams = {
      CurrentValue: this.control.value,
      FileFilter: settings.FileFilter,
      Paths: settings.Paths,
    };
    this.dnnBridgeService.open('pagepicker', params, this.pagePickerCallback.bind(this));
  }

  private pagePickerCallback(value: PagePickerResult) {
    // Convert to page:xyz format (if it wasn't cancelled)
    if (!value) { return; }
    this.control.patchValue(`page:${value.id}`);
  }

  private fetchLink(value: string) {
    if (!value) {
      this.setLink(value, false);
      return;
    }

    const isFileOrPage = this.isFileOrPage(value);
    if (!isFileOrPage) {
      this.setLink(value, false);
      return;
    }

    const fromCache = this.findInCache(value);
    if (fromCache != null) {
      this.setLink(fromCache, true);
      return;
    }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.dnnBridgeService.getUrlOfId(value, contentType, entityGuid, field).subscribe(path => {
      if (!path) { return; }
      this.fetchCache[value] = path;
      const isResolved = !this.isFileOrPage(path);
      this.setLink(path, isResolved);
    });
  }

  private setLink(value: string, isResolved: boolean) {
    const preview: Preview = {
      url: value,
      floatingText: isResolved ? `.../${value.substring(value.lastIndexOf('/') + 1, value.length)}` : '',
      thumbnailUrl: this.thumbnailUrl(value),
      thumbnailPreviewUrl: this.thumbnailUrl(value, 2),
      isImage: this.fileTypeService.isImage(value),
      isKnownType: this.fileTypeService.isKnownType(value),
      icon: this.fileTypeService.getIconClass(value),
    };
    this.preview$.next(preview);
  }

  private thumbnailUrl(link: string, size?: number, quote?: boolean) {
    let result = link;
    if (size === 1) {
      result = result + '?w=72&h=72&mode=crop';
    }
    if (size === 2) {
      result = result + '?w=800&h=800&mode=max';
    }
    const qt = quote ? '"' : '';
    return qt + result + qt;
  }

  toggleAdam(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.config.adam.toggle(usePortalRoot, showImagesOnly);
  }

  private attachAdam(settings: FieldSettings) {
    this.config.adam.onItemClick = (item: AdamItem) => { this.setValue(item); };
    this.config.adam.onItemUpload = (item: AdamPostResponse) => { this.setValue(item); };
    this.config.adam.setConfig({
      rootSubfolder: settings.Paths,
      fileFilter: settings.FileFilter,
      autoLoad: true,
    });
  }

  private setValue(item: AdamItem | AdamPostResponse) {
    const usePath = this.settings$.value.ServerResourceMapping === 'url';
    if (usePath) {
      const imageOrFileUrl = (item as AdamItem).Url != null ? (item as AdamItem).Url : (item as AdamPostResponse).Path;
      this.control.patchValue(imageOrFileUrl);
    } else {
      this.control.patchValue(`file:${item.Id}`);
    }
  }

  private isFileOrPage(value: string) {
    const cleanValue = value.trim().toLocaleLowerCase();
    const isFileOrPage = cleanValue.startsWith('file:') || cleanValue.startsWith('page:');
    return isFileOrPage;
  }

  private findInCache(value: string): string {
    const cleanValue = value.trim().toLocaleLowerCase();

    for (const [linkKey, linkValue] of Object.entries(this.prefetchLinks)) {
      const cleanKey = linkKey.trim().toLocaleLowerCase();
      if (cleanKey !== cleanValue) { continue; }
      return linkValue;
    }

    for (const [linkKey, linkValue] of Object.entries(this.fetchCache)) {
      const cleanKey = linkKey.trim().toLocaleLowerCase();
      if (cleanKey !== cleanValue) { continue; }
      return linkValue;
    }
  }
}
