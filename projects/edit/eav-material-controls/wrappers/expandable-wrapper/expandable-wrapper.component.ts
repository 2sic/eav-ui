import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { DnnBridgeService, EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../shared/store/ngrx-data/input-type.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ConnectorHelper } from '../../input-types/custom/external-web-component/connector/connector.helper';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { ExpandableWrapperTemplateVars } from './expandable-wrapper.models';

@Component({
  selector: 'app-expandable-wrapper',
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class ExpandableWrapperComponent extends BaseComponent<string> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewContainer') private previewContainerRef: ElementRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open$: Observable<boolean>;
  templateVars$: Observable<ExpandableWrapperTemplateVars>;

  private connectorCreator: ConnectorHelper;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featureService: FeatureService,
    private editRoutingService: EditRoutingService,
    private dnnBridgeService: DnnBridgeService,
    private zone: NgZone,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.templateVars$ = combineLatest([
      combineLatest([this.value$, this.label$, this.required$, this.invalid$, this.config.focused$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [value, label, required, invalid, focused],
        [disabled, showValidation],
      ]) => {
        const templateVars: ExpandableWrapperTemplateVars = {
          value,
          label,
          required,
          invalid,
          focused,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngAfterViewInit() {
    const componentTag = `field-${this.config.inputType}`;
    angularConsoleLog('ExpandableWrapper created for:', componentTag);
    this.connectorCreator = new ConnectorHelper(
      this.config,
      this.group,
      this.previewContainerRef,
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

    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    angularConsoleLog('ExpandableWrapper destroyed');
    this.connectorCreator.destroy();
    this.dropzoneDraggingHelper.detach();
    super.ngOnDestroy();
  }

  expandDialog() {
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }
}
