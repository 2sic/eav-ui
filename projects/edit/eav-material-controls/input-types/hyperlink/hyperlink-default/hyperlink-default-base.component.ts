import { ChangeDetectorRef, Directive, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { AdamItem } from '../../../../../edit-types';
import { PagePicker } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService, FileTypeService } from '../../../../shared/services';
import { LinkCacheService } from '../../../../shared/store/ngrx-data';
import { AdamService } from '../../../adam/adam.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { Preview } from './hyperlink-default.models';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class HyperlinkDefaultBaseComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  preview$: BehaviorSubject<Preview>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    public fileTypeService: FileTypeService,
    public adamService: AdamService,
    public dialog: MatDialog,
    public viewContainerRef: ViewContainerRef,
    public changeDetectorRef: ChangeDetectorRef,
    public linkCacheService: LinkCacheService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
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
  }

  ngOnDestroy() {
    this.preview$.complete();
    super.ngOnDestroy();
  }

  openPagePicker() {
    PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, (page) => {
      // convert to page:xyz format (if it wasn't cancelled)
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

  private isFileOrPage(value: string) {
    const cleanValue = value.trim().toLocaleLowerCase();
    const isFileOrPage = cleanValue.startsWith('file:') || cleanValue.startsWith('page:');
    return isFileOrPage;
  }
}
