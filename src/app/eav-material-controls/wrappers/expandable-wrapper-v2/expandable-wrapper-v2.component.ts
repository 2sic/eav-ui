import { Component, OnInit, ViewContainerRef, ViewChild, Input, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { ConnectorService } from '../../input-types/custom/connector-service/connector.service';
import { EavService } from '../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { ContentTypeService } from '../../../shared/services/content-type.service';

@Component({
  selector: 'app-expandable-wrapper-v2',
  templateUrl: './expandable-wrapper-v2.component.html',
  styleUrls: ['./expandable-wrapper-v2.component.scss'],
  animations: [ContentExpandAnimation]
})
export class ExpandableWrapperV2Component implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewContainer') previewContainer: ElementRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  dialogIsOpen = false;
  previewElConnector: ConnectorService;

  get value() {
    return this.group.controls[this.config.field.name].value
      .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block');
  }
  get id() { return `${this.config.entity.entityId}${this.config.field.index}`; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }

  constructor(
    private eavService: EavService,
    private translateService: TranslateService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private _ngZone: NgZone,
    private contentTypeService: ContentTypeService,
  ) { }

  ngOnInit() {
    console.log('ExpandableWrapperV2 created');
    const previewElName = `field-${this.config.field.fullInputType}-preview`;
    this.previewElConnector = new ConnectorService(this._ngZone, this.contentTypeService, this.dialog, this.dnnBridgeService,
      this.eavService, this.translateService, this.previewContainer, this.config, this.group);
    this.previewElConnector.createElementWebComponent(this.config, this.group, this.previewContainer, previewElName);
  }

  setTouched() {
    this.group.controls[this.config.field.name].markAsTouched();
  }

  expandDialog() {
    console.log('ExpandableWrapperV2Component expandDialog');
    this.dialogIsOpen = true;
    this.config.field.expanded = true;
  }
  closeDialog() {
    console.log('ExpandableWrapperV2Component closeDialog');
    this.dialogIsOpen = false;
    this.config.field.expanded = false;
  }

  ngOnDestroy() {
    console.log('ExpandableWrapperV2 destroyed');
    this.previewElConnector.destroy();
  }
}
