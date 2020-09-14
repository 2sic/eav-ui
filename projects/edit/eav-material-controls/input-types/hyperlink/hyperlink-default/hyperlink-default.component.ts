import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../shared/services/eav.service';
import { FileTypeService } from '../../../../shared/services/file-type.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { PagePickerResult } from '../../dnn-bridge/web-form-bridge/web-form-bridge.models';
import { BaseComponent } from '../../base/base.component';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { AdamItem, AdamPostResponse } from '../../../../../edit-types';
import { Preview } from './hyperlink-default.models';
import { FieldSettings } from '../../../../../edit-types';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-default',
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.DropzoneWrapper, WrappersConstants.EavLocalizationWrapper,
  WrappersConstants.HyperlinkDefaultExpandableWrapper, WrappersConstants.AdamAttachWrapper],
})
export class HyperlinkDefaultComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  buttons$: Observable<string>;
  open$: Observable<boolean>;
  preview$ = new BehaviorSubject<Preview>({
    url: '',
    thumbnailUrl: '',
    thumbnailPreviewUrl: '',
    floatingText: '',
    isImage: false,
    isKnownType: false,
    icon: '',
  });

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.buttons$ = this.settings$.pipe(map(settings => settings.Buttons || 'adam,more'));
    this.open$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
    this.subscription.add(
      this.settings$.subscribe(settings => {
        this.attachAdam(settings);
      })
    );
    this.subscription.add(
      this.value$.subscribe(value => {
        this.setLink(value);
      })
    );
  }

  ngOnDestroy() {
    this.preview$.complete();
    super.ngOnDestroy();
  }

  openPageDialog() {
    this.dnnBridgeService.open(
      this.control.value,
      {
        Paths: this.config.field.settings.Paths ? this.config.field.settings.Paths : '',
        FileFilter: this.config.field.settings.FileFilter ? this.config.field.settings.FileFilter : '',
      },
      this.processResultOfPagePicker.bind(this),
      this.dialog,
    );
  }

  private processResultOfPagePicker(value: PagePickerResult) {
    // Convert to page:xyz format (if it wasn't cancelled)
    if (!value) { return; }
    this.control.patchValue(`page:${value.id}`);
  }

  private setLink(value: string) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const contentType = this.config.entity.header.ContentTypeName;
    const entityGuid = this.config.entity.header.Guid;
    const field = this.config.field.name;
    this.dnnBridgeService.getUrlOfId(value, contentType, entityGuid, field).subscribe(path => {
      if (!path) { return; }
      const urlLowered = path.toLowerCase();
      const isFileOrPage = urlLowered.includes('file:') || urlLowered.includes('page:');
      const preview: Preview = {
        url: path,
        floatingText: isFileOrPage ? `.../${path.substring(path.lastIndexOf('/') + 1, path.length)}` : '',
        thumbnailUrl: this.thumbnailUrl(path),
        thumbnailPreviewUrl: this.thumbnailUrl(path, 2),
        isImage: this.fileTypeService.isImage(path),
        isKnownType: this.fileTypeService.isKnownType(path),
        icon: this.fileTypeService.getIconClass(path),
      };
      this.preview$.next(preview);
    });
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
      this.control.patchValue(item.FullPath);
    } else {
      this.control.patchValue(`file:${item.Id}`);
    }
  }

}
