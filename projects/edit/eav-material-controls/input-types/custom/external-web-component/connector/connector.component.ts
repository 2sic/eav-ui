import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { angularConsoleLog } from '../../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../../../shared/services/fields-settings2new.service';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { ConnectorHelper } from './connector.helper';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss'],
})
export class ConnectorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('customElContainer') private customElContainerRef: ElementRef;

  @Input() private config: FieldConfigSet;
  @Input() private group: FormGroup;

  private connectorCreator: ConnectorHelper;

  constructor(
    private eavService: EavService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featureService: FeatureService,
    private editRoutingService: EditRoutingService,
    private dnnBridgeService: DnnBridgeService,
    private fieldsSettings2NewService: FieldsSettings2NewService,
    private zone: NgZone,
  ) { }

  ngAfterViewInit() {
    const componentTag = history?.state?.componentTag || `field-${this.config.field.inputType}-dialog`;
    angularConsoleLog('Connector created for:', componentTag);
    this.connectorCreator = new ConnectorHelper(
      this.config,
      this.group,
      this.customElContainerRef,
      componentTag,
      this.eavService,
      this.translateService,
      this.contentTypeService,
      this.inputTypeService,
      this.featureService,
      this.editRoutingService,
      this.dnnBridgeService,
      this.fieldsSettings2NewService,
      this.zone,
    );
  }

  ngOnDestroy() {
    angularConsoleLog('Connector destroyed');
    this.connectorCreator.destroy();
  }
}
