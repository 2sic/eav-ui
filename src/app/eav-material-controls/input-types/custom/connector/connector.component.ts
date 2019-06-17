import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { EavService } from '../../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { ContentTypeService } from '../../../../shared/services/content-type.service';
import { ConnectorService } from '../connector-service/connector.service';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit, OnDestroy {
  @ViewChild('customElContainer', { static: true }) customElContainer: ElementRef;
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
  ) { }

  ngOnInit() {
    console.log('Connector created');
    const customElName = `field-${this.config.field.inputType}`;
    this.customElConnector = new ConnectorService(this._ngZone, this.contentTypeService, this.dialog, this.dnnBridgeService,
      this.eavService, this.translateService, this.customElContainer, this.config, this.group);
    this.customElConnector.createElementWebComponent(this.config, this.group, this.customElContainer, customElName);
  }

  ngOnDestroy() {
    console.log('Connector destroyed');
    this.customElConnector.destroy();
  }
}
