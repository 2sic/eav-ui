import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { PrefetchLinks } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { EavService } from '../../../shared/services/eav.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { PrefetchService } from '../../../shared/store/ngrx-data/prefetch.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { DnnBridgeConnectorParams, PagePickerResult } from '../../input-types/dnn-bridge/dnn-bridge.models';
import { Preview } from '../../input-types/hyperlink/hyperlink-default/hyperlink-default.models';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { HyperlinkDefaultExpandableTemplateVars } from './hyperlink-default-expandable-wrapper.models';

// TODO: warning: the two files are almost identical: hyperlink-default.component and hyperlink-default-expandable-wrapper.component

@Component({
  selector: 'app-hyperlink-default-expandable-wrapper',
  templateUrl: './hyperlink-default-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-default-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkDefaultExpandableWrapperComponent extends BaseComponent<string> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open$: Observable<boolean>;
  templateVars$: Observable<HyperlinkDefaultExpandableTemplateVars>;

  private preview$: BehaviorSubject<Preview>;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;
  private prefetchLinks: PrefetchLinks = {};
  private fetchCache: PrefetchLinks = {};

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2NewService: FieldsSettings2NewService,
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
    private prefetchService: PrefetchService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
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
    this.subscription.add(
      this.value$.subscribe(value => {
        this.fetchLink(value);
      })
    );
    this.open$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
    const adamButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('adam')));
    const pageButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('page')));

    this.templateVars$ = combineLatest([
      combineLatest([this.value$, this.preview$, this.label$, this.placeholder$, this.invalid$, this.required$]),
      combineLatest([adamButton$, pageButton$, this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [value, preview, label, placeholder, invalid, required],
        [adamButton, pageButton, disabled, showValidation],
      ]) => {
        const templateVars: HyperlinkDefaultExpandableTemplateVars = {
          value,
          preview,
          label,
          placeholder,
          invalid,
          required,
          adamButton,
          pageButton,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
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
    const contentType = this.config.entity.contentTypeId;
    const entityGuid = this.config.entity.entityGuid;
    const field = this.config.field.name;
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
      thumbnailUrl: this.thumbnailUrl(value, 1, true),
      thumbnailPreviewUrl: this.thumbnailUrl(value, 2, false),
      isImage: this.fileTypeService.isImage(value),
      isKnownType: this.fileTypeService.isKnownType(value),
      icon: this.fileTypeService.getIconClass(value),
    };
    this.preview$.next(preview);
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
