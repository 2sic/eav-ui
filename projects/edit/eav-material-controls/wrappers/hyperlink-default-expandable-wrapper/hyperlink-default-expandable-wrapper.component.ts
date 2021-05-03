import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AdamItem } from '../../../../edit-types';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations';
import { DropzoneDraggingHelper, PagePicker } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService, FileTypeService } from '../../../shared/services';
import { LinkCacheService } from '../../../shared/store/ngrx-data';
import { AdamService } from '../../adam/adam.service';
import { BaseComponent } from '../../input-types/base/base.component';
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

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private fileTypeService: FileTypeService,
    private adamService: AdamService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
    private linkCacheService: LinkCacheService,
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
    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    const adamButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('adam')), distinctUntilChanged());
    const pageButton$ = this.settings$.pipe(map(settings => settings.Buttons?.includes('page')), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([this.value$, this.preview$, this.label$, this.placeholder$, this.invalid$, this.required$]),
      combineLatest([adamButton$, pageButton$, this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [value, preview, label, placeholder, invalid, required],
        [adamButton, pageButton, disabled, touched],
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
          touched,
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
    this.dropzoneDraggingHelper.detach();
    this.preview$.complete();
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  markAsTouched() {
    this.validationMessagesService.markAsTouched(this.control);
  }

  setValue(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    if (this.control.value === newValue) { return; }
    this.control.patchValue(newValue);
    this.control.markAsDirty();
  }

  expandDialog() {
    if (this.control.disabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  openPagePicker() {
    PagePicker.open(this.dialog, this.viewContainerRef, (page) => {
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

  private isFileOrPage(value: string) {
    const cleanValue = value.trim().toLocaleLowerCase();
    const isFileOrPage = cleanValue.startsWith('file:') || cleanValue.startsWith('page:');
    return isFileOrPage;
  }
}
