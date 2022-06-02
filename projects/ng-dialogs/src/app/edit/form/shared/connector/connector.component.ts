import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { consoleLogAngular } from '../../../../shared/helpers/console-log-angular.helper';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { ContentTypeService, EntityCacheService, FeatureService, InputTypeService } from '../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { ConnectorHelper } from './connector.helper';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss'],
})
export class ConnectorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('customElContainer') private customElContainerRef: ElementRef;

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
    private adamService: AdamService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    private fieldsSettingsService: FieldsSettingsService,
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
      this.adamService,
      this.dialog,
      this.viewContainerRef,
      this.changeDetectorRef,
      this.fieldsSettingsService,
      this.entityCacheService,
      this.zone,
    );
  }

  ngOnDestroy() {
    consoleLogAngular('Connector destroyed');
    this.connectorCreator.destroy();
  }
}
