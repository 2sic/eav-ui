import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { angularConsoleLog } from '../../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { DnnBridgeService, EavService, EditRoutingService, FieldsSettingsService } from '../../../../../shared/services';
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
    private fieldsSettingsService: FieldsSettingsService,
    private zone: NgZone,
  ) { }

  ngAfterViewInit() {
    const componentTag = history?.state?.componentTag || `field-${this.config.inputType}-dialog`;
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
      this.fieldsSettingsService,
      this.zone,
    );
  }

  ngOnDestroy() {
    angularConsoleLog('Connector destroyed');
    this.connectorCreator.destroy();
  }
}
