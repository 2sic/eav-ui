import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { angularConsoleLog } from '../../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../../shared/services/edit-routing.service';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { ConnectorHelper } from './connector.helper';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('customElContainer') customElContainerRef: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  private connectorCreator: ConnectorHelper;

  constructor(
    private eavService: EavService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featureService: FeatureService,
    private editRoutingService: EditRoutingService,
    private dnnBridgeService: DnnBridgeService,
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
      this.zone,
    );
  }

  ngOnDestroy() {
    angularConsoleLog('Connector destroyed');
    this.connectorCreator.destroy();
  }
}
