import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewContainerRef, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Preview } from './hyperlink-default.models';
import { FieldState } from '../../field-state';
import { UrlHelpers, FileTypeHelpers } from '../../../shared/helpers';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { PagePicker } from '../../page-picker/page-picker.helper';
import { BaseComponentSubscriptions } from '../../../../shared/components/base.component';
import { AdamItem } from '../../../../../../../edit-types/src/AdamItem';
import { EditForm } from '../../../../shared/models/edit-form.model';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { FormConfigService } from '../../../state/form-config.service';
import { FormsStateService } from '../../../state/forms-state.service';
import { AdamService } from '../../../shared/services/adam.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { LinkCacheService } from '../../../shared/store/link-cache.service';
import { transient } from '../../../../core/transient';

const logSpecs = {
  enabled: true,
  name: 'HyperlinkDefaultBaseComponent',
};

@Component({
  selector: 'app-base-field-hyperlink-component',
  template: ''
})
// tslint:disable-next-line:directive-class-suffix
export class HyperlinkDefaultBaseComponent extends BaseComponentSubscriptions implements OnInit, OnDestroy {

  preview = signal<Preview>({
    url: '',
    thumbnailUrl: '',
    previewUrl: '',
    floatingText: '',
    isImage: false,
    isKnownType: false,
    icon: '',
  });

  protected fieldState = inject(FieldState) as FieldState<string>;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;
  public config = this.fieldState.config;
  public group = this.fieldState.group;
  public control = this.fieldState.control;
  protected controlStatus = this.fieldState.controlStatus;

  private injector = inject(Injector);

  public adamService = transient(AdamService);

  log = new EavLogger(logSpecs);
  constructor(
    private formConfig: FormConfigService,
    public dialog: MatDialog,
    public viewContainerRef: ViewContainerRef,
    public changeDetectorRef: ChangeDetectorRef,
    public linkCacheService: LinkCacheService,
    public editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
  ) {
    super();
  }

  ngOnInit() {
    effect(() => {
      this.log.a('controlStatus effect');
      const status = this.fieldState.controlStatus().value;
      this.fetchLink(status);
    }, { injector: this.injector, allowSignalWrites: true });
  }

  openPagePicker() {
    PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, (page) => {
      // convert to page:xyz format (if it wasn't cancelled)
      if (!page) return;
      ControlHelpers.patchControlValue(this.control, `page:${page.id}`);
    });
  }

  openImageConfiguration(adamItem?: AdamItem) {
    if (this.formsStateService.readOnly().isReadOnly || !adamItem?._imageConfigurationContentType)
      return;

    const form: EditForm = {
      items: [
        adamItem._imageConfigurationId > 0
          ? { EntityId: adamItem._imageConfigurationId }
          : {
            ContentTypeName: adamItem._imageConfigurationContentType,
            For: {
              Target: eavConstants.metadata.cmsObject.target,
              TargetType: eavConstants.metadata.cmsObject.targetType,
              String: adamItem.ReferenceId,
            },
          },
      ],
    };
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  private fetchLink(value: string) {
    this.log.a('fetchLink', { value });
    if (!value) {
      this.setPreview(value, false);
      return;
    }

    const isFileOrPage = this.isFileOrPage(value);
    if (!isFileOrPage) {
      this.setPreview(value, false);
      return;
    }

    const cached = this.linkCacheService.get(value);
    if (cached) {
      const isResolved = !this.isFileOrPage(cached.Value);
      this.setPreview(cached.Value, isResolved, cached.Adam);
      return;
    }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeNameId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.adamService.getLinkInfo(value, contentType, entityGuid, field)
      .subscribe(linkInfo => {
        if (!linkInfo) {
          this.setPreview(value, false);
          return;
        }
        this.linkCacheService.addLink(value, linkInfo);
        const isResolved = !this.isFileOrPage(linkInfo.Value);
        this.setPreview(linkInfo.Value, isResolved, linkInfo.Adam);
      });
  }

  private setPreview(value: string, isResolved: boolean, adam?: AdamItem) {
    const preview = this.getPreview(value, isResolved, adam);
    this.preview.set(preview);
  }

  private getPreview(value: string, isResolved: boolean, adam?: AdamItem): Preview {
    // for preview resolve [App:Path]
    value = value.replace(/\[App:Path\]/i, UrlHelpers.getUrlPrefix('app', this.formConfig.config));

    return {
      url: value,
      floatingText: isResolved ? `.../${value.substring(value.lastIndexOf('/') + 1)}` : '',
      thumbnailUrl: `url("${adam?.ThumbnailUrl ?? this.buildUrl(value, 1)}")`,
      previewUrl: adam?.PreviewUrl ?? this.buildUrl(value, 2),
      isImage: FileTypeHelpers.isImage(value),
      isKnownType: FileTypeHelpers.isKnownType(value),
      icon: FileTypeHelpers.getIconClass(value),
    } satisfies Preview;
  }

  private buildUrl(url: string, size?: 1 | 2): string {
    let query = '';
    if (size === 1)
      query += 'w=80&h=80&mode=crop';
    if (size === 2)
      query += 'w=800&h=800&mode=max';
    if (query && !url.includes('?'))
      query = '?' + query;
    return url + query;
  }

  private isFileOrPage(value: string) {
    const cleanValue = value.trim().toLocaleLowerCase();
    const isFileOrPage = cleanValue.startsWith('file:') || cleanValue.startsWith('page:');
    return isFileOrPage;
  }
}
