import { Component, OnDestroy, ViewChild, ElementRef, Input, NgZone, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { EavService } from '../../../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { ConnectorService } from './connector.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { ExpandableFieldService } from '../../../../../shared/services/expandable-field.service';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('customElContainer') customElContainer: ElementRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  customElConnector: ConnectorService;

  constructor(
    private eavService: EavService,
    private translateService: TranslateService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private _ngZone: NgZone,
    private contentTypeService: ContentTypeService,
    private featureService: FeatureService,
    private inputTypeService: InputTypeService,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  ngAfterViewInit() {
    const customElName = `field-${this.config.field.inputType}`;
    console.log(`Connector created for ${customElName}`);
    this.customElConnector = new ConnectorService(this._ngZone, this.contentTypeService, this.dialog, this.dnnBridgeService,
      this.eavService, this.translateService, this.customElContainer, this.config, this.group, this.featureService,
      this.inputTypeService, this.expandableFieldService);
    this.customElConnector.createElementWebComponent(this.config, this.group, this.customElContainer, customElName, false);
  }

  ngOnDestroy() {
    console.log('Connector destroyed');
    this.customElConnector.destroy();
  }
}
