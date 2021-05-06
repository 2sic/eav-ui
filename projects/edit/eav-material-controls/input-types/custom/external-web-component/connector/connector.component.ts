import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { consoleLogAngular } from '../../../../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { DnnBridgeService, EavService, EditRoutingService, FieldsSettingsService } from '../../../../../shared/services';
import { ContentTypeService, EntityCacheService, FeatureService, InputTypeService } from '../../../../../shared/store/ngrx-data';
import { ValidationMessagesService } from '../../../../validators/validation-messages-service';
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
    private validationMessagesService: ValidationMessagesService,
    private entityCacheService: EntityCacheService,
    private zone: NgZone,
  ) { }

  ngAfterViewInit() {
    const componentTag = history?.state?.componentTag || `field-${this.config.inputType}-dialog`;
    consoleLogAngular('Connector created for:', componentTag);
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
      this.validationMessagesService,
      this.entityCacheService,
      this.zone,
    );
  }

  ngOnDestroy() {
    consoleLogAngular('Connector destroyed');
    this.connectorCreator.destroy();
  }
}
