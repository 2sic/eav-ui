import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { EavService } from '../../../shared/services/eav.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { DnnBridgeConnectorParams, PagePickerResult } from '../../input-types/dnn-bridge/dnn-bridge.models';
import { Preview } from '../../input-types/hyperlink/hyperlink-default/hyperlink-default.models';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { HyperlinkDefaultExpandableWrapperLogic } from './hyperlink-default-expandable-wrapper-logic';

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
  preview$ = new BehaviorSubject<Preview>({
    url: '',
    thumbnailUrl: '',
    thumbnailPreviewUrl: '',
    floatingText: '',
    isImage: false,
    isKnownType: false,
    icon: '',
  });
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscription.add(
      this.value$.subscribe(value => {
        this.setLink(value);
      })
    );
    this.open$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
    this.settings$ = new BehaviorSubject<FieldSettings>(null);
    const settingsLogic = new HyperlinkDefaultExpandableWrapperLogic();
    this.subscription.add(
      this.config.field.settings$.pipe(map(settings => settingsLogic.init(settings))).subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.adamButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('adam')));
    this.pageButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('page')));
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    this.settings$.complete();
    this.dropzoneDraggingHelper.detach();
    this.preview$.complete();
    super.ngOnDestroy();
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
    this.editRoutingService.expand(true, this.config.field.index, this.config.entity.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.field.index, this.config.entity.entityGuid);
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
