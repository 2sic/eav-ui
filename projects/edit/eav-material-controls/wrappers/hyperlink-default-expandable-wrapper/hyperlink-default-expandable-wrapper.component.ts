import { Component, OnInit, ViewContainerRef, ViewChild, Input, OnDestroy, AfterViewInit, ElementRef, NgZone } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../shared/services/eav.service';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { PagePickerResult } from '../../../shared/models/dnn-bridge/dnn-bridge-connector';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-hyperlink-default-expandable-wrapper',
  templateUrl: './hyperlink-default-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-default-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class HyperlinkDefaultExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') backdropRef: ElementRef;
  @ViewChild('dialog') dialogRef: ElementRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  private subscription = new Subscription();
  private oldValue: any;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  dialogIsOpen = false;
  control: AbstractControl;
  link = '';
  thumbnailUrl = '';
  tooltipUrl = '';
  isImage: boolean;
  iconClass: string;
  isKnownType: boolean;
  adamButton: boolean;
  pageButton: boolean;
  showInputFileName: boolean;

  get bottomPixels() { return window.innerWidth > 600 ? '100px' : '50px'; }

  constructor(
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private eavService: EavService,
    private zone: NgZone,
    private dialog: MatDialog,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.setLink(this.control.value);
    this.suscribeValueChanges();
    this.subscription.add(this.expandableFieldService.getObservable().subscribe(expandedFieldId => {
      const dialogShouldBeOpen = (this.config.field.index === expandedFieldId);
      if (dialogShouldBeOpen === this.dialogIsOpen) { return; }
      this.dialogIsOpen = dialogShouldBeOpen;
    }));
    this.subscription.add(this.config.field.settings$.subscribe(settings => {
      this.adamButton = settings.Buttons?.includes('adam');
      this.pageButton = settings.Buttons?.includes('page');
    }));
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  setValue(event: Event) {
    const eventTarget = event.target as HTMLInputElement;
    if (eventTarget.value === this.control.value) { return; }
    this.control.patchValue(eventTarget.value);
    this.control.markAsDirty();
  }

  setTouched() {
    this.control.markAsTouched();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.dropzoneDraggingHelper.detach();
  }

  expandDialog() {
    if (this.control.disabled) { return; }
    angularConsoleLog('HyperlinkDefaultExpandableWrapperComponent expandDialog');
    this.expandableFieldService.expand(true, this.config.field.index, this.config.form.formId);
  }

  closeDialog() {
    angularConsoleLog('HyperlinkDefaultExpandableWrapperComponent closeDialog');
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
      this.link = value;
      this.setValues();
      return;
    }

    urlFromId$.subscribe(data => {
      if (!data) { return; }
      this.link = data;
      this.setValues();
    });
  }

  private setValues() {
    this.thumbnailUrl = this.buildThumbnailUrl(this.link, 1, true);
    this.isImage = this.fileTypeService.isImage(this.link);
    this.isKnownType = this.fileTypeService.isKnownType(this.link);
    this.iconClass = this.fileTypeService.getIconClass(this.link);
    this.tooltipUrl = this.buildTooltipUrl(this.link);
    this.showInputFileName = this.control.value.includes('file:') || this.control.value.includes('page:');
  }

  /** Subscribe to form value changes */
  private suscribeValueChanges() {
    this.oldValue = this.control.value;
    this.subscription.add(this.eavService.formSetValueChange$.subscribe(formSet => {
      if (formSet.formId !== this.config.form.formId) { return; }
      if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }
      if (formSet.entityValues[this.config.field.name] === this.oldValue) { return; }
      this.oldValue = formSet.entityValues[this.config.field.name];

      this.setLink(formSet.entityValues[this.config.field.name]);
    }));
  }

  private buildThumbnailUrl(url: string, size: number, quote: boolean): string {
    if (size === 1) {
      url = url + '?w=80&h=80&mode=crop';
    }
    if (size === 2) {
      url = url + '?w=500&h=400&mode=max';
    }
    const qt = quote ? '"' : '';
    return 'url(' + qt + url + qt + ')';
  }

  private buildTooltipUrl(str: string): string {
    if (!str) { return ''; }
    return str.replace(/\//g, '/&#8203;');
  }
}
