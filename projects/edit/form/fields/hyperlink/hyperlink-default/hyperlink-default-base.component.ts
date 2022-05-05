import { ChangeDetectorRef, Directive, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { AdamItem } from '../../../../../edit-types';
import { eavConstants } from '../../../../../ng-dialogs/src/app/shared/constants/eav.constants';
import { EditForm } from '../../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { FileTypeHelpers, GeneralHelpers, PagePicker, UrlHelpers } from '../../../../shared/helpers';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../../shared/services';
import { LinkCacheService } from '../../../../shared/store/ngrx-data';
import { BaseComponent } from '../../base/base.component';
import { Preview } from './hyperlink-default.models';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class HyperlinkDefaultBaseComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  preview$: BehaviorSubject<Preview>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    public adamService: AdamService,
    public dialog: MatDialog,
    public viewContainerRef: ViewContainerRef,
    public changeDetectorRef: ChangeDetectorRef,
    public linkCacheService: LinkCacheService,
    public editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
  ) {
    super(eavService, fieldsSettingsService);
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
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()).subscribe(value => {
        this.fetchLink(value);
      })
    );
  }

  ngOnDestroy() {
    this.preview$.complete();
    super.ngOnDestroy();
  }

  openPagePicker() {
    PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, (page) => {
      // convert to page:xyz format (if it wasn't cancelled)
      if (!page) { return; }
      GeneralHelpers.patchControlValue(this.control, `page:${page.id}`);
    });
  }

  openImageConfiguration(adamItem?: AdamItem) {
    if (this.formsStateService.readOnly$.value.isReadOnly || !adamItem?._imageConfigurationContentType) { return; }

    const form: EditForm = {
      items: [
        adamItem._imageConfigurationId > 0
          ? { EntityId: adamItem._imageConfigurationId }
          : {
            ContentTypeName: adamItem._imageConfigurationContentType,
            For: {
              Target: eavConstants.metadata.cmsObject.target,
              TargetType: eavConstants.metadata.cmsObject.targetType,
              String: `file:${adamItem.Id}`,
            },
          },
      ],
    };
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  private fetchLink(value: string) {
    if (!value) {
      this.setPreview(value, false);
      return;
    }

    const isFileOrPage = this.isFileOrPage(value);
    if (!isFileOrPage) {
      this.setPreview(value, false);
      return;
    }

    const cached = this.linkCacheService.getLinkInfo(value);
    if (cached) {
      const isResolved = !this.isFileOrPage(cached.Value);
      this.setPreview(cached.Value, isResolved, cached.Adam);
      return;
    }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.adamService.getLinkInfo(value, contentType, entityGuid, field).subscribe(linkInfo => {
      if (!linkInfo) {
        this.setPreview(value, false);
        return;
      }
      this.linkCacheService.loadLink(value, linkInfo);
      const isResolved = !this.isFileOrPage(linkInfo.Value);
      this.setPreview(linkInfo.Value, isResolved, linkInfo.Adam);
    });
  }

  private setPreview(value: string, isResolved: boolean, adam?: AdamItem) {
    // for preview resolve [App:Path]
    value = value.replace(/\[App:Path\]/i, UrlHelpers.getUrlPrefix('app', this.eavService.eavConfig));

    const preview: Preview = {
      url: value,
      floatingText: isResolved ? `.../${value.substring(value.lastIndexOf('/') + 1)}` : '',
      thumbnailUrl: `url("${adam?.ThumbnailUrl ?? this.buildUrl(value, 1)}")`,
      previewUrl: adam?.PreviewUrl ?? this.buildUrl(value, 2),
      isImage: FileTypeHelpers.isImage(value),
      isKnownType: FileTypeHelpers.isKnownType(value),
      icon: FileTypeHelpers.getIconClass(value),
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

  private isFileOrPage(value: string) {
    const cleanValue = value.trim().toLocaleLowerCase();
    const isFileOrPage = cleanValue.startsWith('file:') || cleanValue.startsWith('page:');
    return isFileOrPage;
  }
}
