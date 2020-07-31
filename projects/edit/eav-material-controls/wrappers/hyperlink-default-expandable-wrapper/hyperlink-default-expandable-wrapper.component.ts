import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, AfterViewInit, ElementRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../shared/services/eav.service';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { PagePickerResult } from '../../../shared/models/dnn-bridge/dnn-bridge-connector';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { Preview } from '../../input-types/hyperlink/hyperlink-default/hyperlink-default.models';

@Component({
  selector: 'app-hyperlink-default-expandable-wrapper',
  templateUrl: './hyperlink-default-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-default-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:max-line-length
export class HyperlinkDefaultExpandableWrapperComponent extends BaseComponent<string> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') backdropRef: ElementRef;
  @ViewChild('dialog') dialogRef: ElementRef;

  open$: Observable<boolean>;
  adamButton$: Observable<boolean>;
  pageButton$: Observable<boolean>;
  preview$ = new BehaviorSubject<Preview>(null);
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private zone: NgZone,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private expandableFieldService: ExpandableFieldService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(this.value$.subscribe(value => {
      this.setLink(value);
    }));
    this.open$ = this.route.params.pipe(map(params => this.config.field.index.toString() === params.expandedFieldId));
    this.adamButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('adam')));
    this.pageButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('page')));
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
    this.preview$.complete();
    super.ngOnDestroy();
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  setValue(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    if (this.control.value === newValue) { return; }
    this.control.patchValue(newValue);
    this.control.markAsDirty();
  }

  expandDialog() {
    if (this.control.disabled) { return; }
    this.expandableFieldService.expand(true, this.config.field.index, this.config.form.formId);
  }

  closeDialog() {
    this.expandableFieldService.expand(false, this.config.field.index, this.config.form.formId);
  }

  openPageDialog() {
    this.dnnBridgeService.open(
      this.control.value,
      {
        Paths: this.config.field.settings.Paths ? this.config.field.settings.Paths : '',
        FileFilter: this.config.field.settings.FileFilter ? this.config.field.settings.FileFilter : ''
      },
      this.processResultOfPagePicker.bind(this),
      this.dialog
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
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(value, contentType, entityGuid, field);

    if (!urlFromId$) {
      const preview: Preview = {
        url: value,
        floatingText: '',
        thumbnailUrl: this.thumbnailUrl(value, 1, true),
        thumbnailPreviewUrl: this.thumbnailUrl(value, 2, false),
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
        thumbnailUrl: this.thumbnailUrl(path, 1, true),
        thumbnailPreviewUrl: this.thumbnailUrl(path, 2, false),
        isImage: this.fileTypeService.isImage(path),
        isKnownType: this.fileTypeService.isKnownType(path),
        icon: this.fileTypeService.getIconClass(path),
      };
      this.preview$.next(preview);
    });
  }

  private thumbnailUrl(url: string, size: number, quote: boolean): string {
    if (size === 1) {
      url = url + '?w=80&h=80&mode=crop';
    }
    if (size === 2) {
      url = url + '?w=500&h=400&mode=max';
    }
    const qt = quote ? '"' : '';
    return 'url(' + qt + url + qt + ')';
  }
}
