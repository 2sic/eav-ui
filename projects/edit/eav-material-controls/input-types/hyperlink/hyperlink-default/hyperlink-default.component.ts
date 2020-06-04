import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AdamConfig } from '../../../../shared/models/adam/adam-config';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../shared/services/eav.service';
import { FileTypeService } from '../../../../shared/services/file-type.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { PagePickerResult } from '../../../../shared/models/dnn-bridge/dnn-bridge-connector';
import { BaseComponent } from '../../base/base.component';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { AdamItem } from '../../../../shared/models/adam/adam-item';
import { Preview } from './hyperlink-default.models';

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
  preview$ = new BehaviorSubject<Preview>(null);
  open$ = new BehaviorSubject(false);

  private subscription = new Subscription();

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.buttons$ = this.settings$.pipe(map(settings => settings.Buttons || 'adam,more'));
    this.subscription.add(
      this.settings$.pipe(map(settings => settings.FileFilter || '')).subscribe(fileFilter => {
        this.attachAdam(fileFilter);
      })
    );
    this.subscription.add(
      this.value$.subscribe(value => {
        this.setLink(value);
      })
    );
    this.subscription.add(
      this.route.params.subscribe(params => {
        const isOpen = this.config.field.index.toString() === params.expandedFieldId;
        this.open$.next(isOpen);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.preview$.complete();
    this.open$.complete();
  }

  // #region dnn-page picker dialog
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
  // #endregion

  private setLink(value: string) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(
      value,
      this.config.entity.header.ContentTypeName,
      this.config.entity.header.Guid,
      this.config.field.name,
    );

    if (!urlFromId$) {
      const preview: Preview = {
        url: value,
        floatingText: '',
        thumbnailUrl: this.thumbnailUrl(value),
        thumbnailPreviewUrl: this.thumbnailUrl(value, 2),
        isImage: false,
        isKnownType: false,
        icon: this.fileTypeService.getIconClass(value),
      };
      this.preview$.next(preview);
      return;
    }

    urlFromId$.subscribe(path => {
      if (!path) { return; }
      const preview: Preview = {
        url: path,
        floatingText: `.../${path.substring(path.lastIndexOf('/') + 1, path.length)}`,
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

  // #region adam
  toggleAdam(usePortalRoot?: boolean, showImagesOnly?: boolean) {
    this.config.adam.toggle({ showImagesOnly, usePortalRoot });
  }

  private attachAdam(fileFilter: string) {
    if (!this.config.adam) { return; }
    this.config.adam.updateCallback = (item: AdamItem) => this.setValue(item);
    this.config.adam.afterUploadCallback = (item: AdamItem) => this.setValue(item);
    this.config.adam.getValueCallback = () => this.control.value;
    this.config.adam.setConfig({
      ...new AdamConfig(),
      adamModeConfig: { usePortalRoot: false },
      fileFilter,
    });
  }

  private setValue(item: AdamItem) {
    this.control.patchValue(`file:${item.Id}`);
  }
  //#endregion
}
