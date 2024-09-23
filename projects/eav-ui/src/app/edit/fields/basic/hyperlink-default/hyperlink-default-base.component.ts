import { ChangeDetectorRef, Component, Injector, OnInit, ViewContainerRef, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Preview } from './hyperlink-default.models';
import { FieldState } from '../../field-state';
import { UrlHelpers, FileTypeHelpers } from '../../../shared/helpers';
import { PagePicker } from '../../page-picker/page-picker.helper';
import { AdamItem } from '../../../../../../../edit-types/src/AdamItem';
import { EditForm, EditPrep } from '../../../../shared/models/edit-form.model';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { AdamService } from '../../../shared/adam/adam.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { LinkCacheService } from '../../../shared/adam/link-cache.service';
import { transient } from '../../../../core/transient';
import { classLog } from '../../../../shared/logging';
import { computedObj } from '../../../../shared/signals/signal.utilities';

@Component({
  selector: 'app-base-field-hyperlink-component',
  template: ''
})
// tslint:disable-next-line:directive-class-suffix
export class HyperlinkDefaultBaseComponent implements OnInit {

  log = classLog({HyperlinkDefaultBaseComponent});

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
  protected ui = this.fieldState.ui;
  protected uiValue = this.fieldState.uiValue;

  private injector = inject(Injector);

  public adamService = transient(AdamService);

  constructor(
    private formConfig: FormConfigService,
    public dialog: MatDialog,
    public viewContainerRef: ViewContainerRef,
    public changeDetectorRef: ChangeDetectorRef,
    public linkCacheService: LinkCacheService,
    public editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
  ) { }

  ngOnInit() {
    effect(() => {
      this.log.a('controlStatus effect');
      const status = this.fieldState.uiValue();
      this.fetchLink(status);
    }, { injector: this.injector, allowSignalWrites: true });
  }

  adamItem = computedObj('adamItem', () => {
    const value = this.uiValue();
    const adamItems = this.config.adam.items() as AdamItem[];

    if (!value || !adamItems.length) return;

    const match = value.trim().match(/^file:([0-9]+)$/i);
    if (!match) return;

    const adamItemId = parseInt(match[1], 10);
    const adamItem = adamItems.find(i => i.Id === adamItemId);
    return adamItem;
  });


  openPagePicker() {
    PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, (page) => {
      // convert to page:xyz format (if it wasn't cancelled)
      if (!page) return;
      this.fieldState.ui().set(`page:${page.id}`);
    });
  }

  openImageConfiguration(adamItem?: AdamItem) {
    if (this.formsStateService.readOnly().isReadOnly || !adamItem?._imageConfigurationContentType)
      return;

    const form: EditForm = {
      items: [
        adamItem._imageConfigurationId > 0
          ? EditPrep.editId(adamItem._imageConfigurationId)
          : EditPrep.newMetadata(adamItem.ReferenceId, adamItem._imageConfigurationContentType, eavConstants.metadata.cmsObject),
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
