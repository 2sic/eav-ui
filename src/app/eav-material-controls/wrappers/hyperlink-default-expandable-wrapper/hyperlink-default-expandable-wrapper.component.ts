import { Component, OnInit, ViewContainerRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../shared/services/eav.service';
import { EavConfiguration } from '../../../shared/models/eav-configuration';

@Component({
  selector: 'app-hyperlink-default-expandable-wrapper',
  templateUrl: './hyperlink-default-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-default-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class HyperlinkDefaultExpandableWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  private eavConfig: EavConfiguration;
  private subscriptions: Subscription[] = [];
  private oldValue: any;

  dialogIsOpen = false;
  control: AbstractControl;
  link = '';
  thumbnailUrl = '';
  tooltipUrl = '';
  isImage: boolean;
  iconClass: string;
  isKnownType: boolean;

  constructor(
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.setLink(this.control.value);
    this.suscribeValueChanges();
  }

  setValue(event) {
    if (event.target.value === this.control.value) { return; }
    this.control.patchValue(event.target.value);
    this.control.markAsDirty();
  }

  setTouched() {
    this.control.markAsTouched();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  expandDialog() {
    console.log('HyperlinkDefaultExpandableWrapperComponent expandDialog');
    this.dialogIsOpen = true;
    this.config.field.expanded = true;
  }
  closeDialog() {
    console.log('HyperlinkDefaultExpandableWrapperComponent closeDialog');
    this.dialogIsOpen = false;
    this.config.field.expanded = false;
  }

  /** Update test-link if necessary - both when typing or if link was set by dialogs */
  private setLink(value: string) {
    if (!value) { return; }
    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(
      this.eavConfig.appId,
      value,
      this.config.entity.header.contentTypeName,
      this.config.entity.header.guid,
      this.config.field.name
    );

    if (!urlFromId$) {
      this.link = value;
      this.setValues();
    }

    urlFromId$.pipe(take(1)).subscribe(data => {
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
  }

  /** Subscribe to form value changes */
  private suscribeValueChanges() {
    this.oldValue = this.control.value;
    const formSetSub = this.eavService.formSetValueChange$.subscribe(formSet => {
      // check if update is for current entity
      if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }

      // check if update is for this field
      if (formSet.formValues[this.config.field.name] === this.oldValue) { return; }
      this.oldValue = formSet[this.config.field.name];

      this.setLink(formSet.formValues[this.config.field.name]);
    });
    this.subscriptions.push(formSetSub);
  }

  private buildThumbnailUrl(url: string, size: number, quote: boolean): string {
    if (size === 1) {
      url = url + '?w=70&h=70&mode=crop';
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
