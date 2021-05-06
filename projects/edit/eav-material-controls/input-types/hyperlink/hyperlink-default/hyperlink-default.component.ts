import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AdamItem, AdamPostResponse } from '../../../../../edit-types';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { PagePicker } from '../../../../shared/helpers';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService, FileTypeService } from '../../../../shared/services';
import { LinkCacheService } from '../../../../shared/store/ngrx-data';
import { AdamService } from '../../../adam/adam.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
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

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private fileTypeService: FileTypeService,
    private adamService: AdamService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    private editRoutingService: EditRoutingService,
    private linkCacheService: LinkCacheService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    HyperlinkDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.preview$ = new BehaviorSubject<Preview>({
      url: '',
      thumbnailUrl: '',
      previewUrl: '',
      floatingText: '',
      isImage: false,
      isKnownType: false,
      icon: '',
    });
    this.subscription.add(
      this.value$.subscribe(value => {
        this.fetchLink(value);
      })
    );
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
    this.preview$.complete();
    super.ngOnDestroy();
  }

  openPagePicker() {
    PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, (page) => {
      // Convert to page:xyz format (if it wasn't cancelled)
      if (!page) { return; }
      this.control.patchValue(`page:${page.id}`);
    });
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

    const cached = this.linkCacheService.getLinkInfo(value);
    if (cached) {
      const isResolved = !this.isFileOrPage(cached.Value);
      this.setLink(cached.Value, isResolved, cached.Adam);
      return;
    }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.adamService.getLinkInfo(value, contentType, entityGuid, field).subscribe(linkInfo => {
      if (!linkInfo) {
        this.setLink(value, false);
        return;
      }
      this.linkCacheService.loadLink(value, linkInfo);
      const isResolved = !this.isFileOrPage(linkInfo.Value);
      this.setLink(linkInfo.Value, isResolved, linkInfo.Adam);
    });
  }

  private setLink(value: string, isResolved: boolean, adam?: AdamItem) {
    const preview: Preview = {
      url: value,
      floatingText: isResolved ? `.../${value.substring(value.lastIndexOf('/') + 1)}` : '',
      thumbnailUrl: `url("${adam?.ThumbnailUrl ?? this.buildUrl(value, 1)}")`,
      previewUrl: adam?.PreviewUrl ?? this.buildUrl(value, 2),
      isImage: this.fileTypeService.isImage(value),
      isKnownType: this.fileTypeService.isKnownType(value),
      icon: this.fileTypeService.getIconClass(value),
    };
    this.preview$.next(preview);
  }

  private buildUrl(url: string, size?: 1 | 2): string {
    let query = '';
    if (size === 1) {
      query += 'w=80&h=80&mode=crop';
    }
    if (size === 2) {
      query += 'w=800&h=800&mode=max';
    }
    if (query && !url.includes('?')) {
      query = '?' + query;
    }
    return url + query;
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
    if (usePath) {
      const imageOrFileUrl = (item as AdamItem).Url ?? (item as AdamPostResponse).Path;
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
}
