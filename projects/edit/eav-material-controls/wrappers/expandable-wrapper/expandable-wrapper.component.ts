// tslint:disable-next-line:max-line-length
import { Component, OnInit, ViewContainerRef, ViewChild, Input, ElementRef, OnDestroy, NgZone, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { ConnectorService } from '../../input-types/custom/external-web-component/connector/connector.service';
import { EavService } from '../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../shared/store/ngrx-data/input-type.service';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-expandable-wrapper',
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation]
})
export class ExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewContainer') previewContainer: ElementRef;
  @ViewChild('backdrop') backdropRef: ElementRef;
  @ViewChild('dialog') dialogRef: ElementRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  dialogIsOpen = false;
  inlineMode = true;
  isWysiwyg = false;
  private subscription = new Subscription();
  private elConnector: ConnectorService;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  get value() {
    return this.group.controls[this.config.field.name].value ? this.group.controls[this.config.field.name].value
      .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') : '';
  }
  get id() { return `${this.config.entity.entityId}${this.config.field.index}`; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }
  get dirty() { return this.group.controls[this.config.field.name].dirty || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }
  get bottomPixels() { return window.innerWidth > 600 ? '100px' : '50px'; }

  constructor(
    private eavService: EavService,
    private translateService: TranslateService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private zone: NgZone,
    private contentTypeService: ContentTypeService,
    private featureService: FeatureService,
    private inputTypeService: InputTypeService,
    private changeDetector: ChangeDetectorRef,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  ngOnInit() {
    this.isWysiwyg = InputFieldHelper.isWysiwygInputType(this.config.field.inputType);
    this.isWysiwyg = false;
    this.changeDetector.detectChanges();
    const elName = `field-${this.config.field.inputType}`;
    angularConsoleLog('ExpandableWrapper created for:', elName, 'Config:', this.config.field);
    this.elConnector = new ConnectorService(this.zone, this.contentTypeService, this.dialog, this.dnnBridgeService,
      this.eavService, this.translateService, this.previewContainer, this.config, this.group, this.featureService,
      this.inputTypeService, this.expandableFieldService);
    this.elConnector.createElementWebComponent(this.config, this.group, this.previewContainer, elName);

    this.group.controls[this.config.field.name].statusChanges.subscribe(status => {
      angularConsoleLog('ExpandableWrapperComponent statusChanges:', this.config.field.name, status);
    });
    this.group.controls[this.config.field.name].valueChanges.subscribe(value => {
      angularConsoleLog('ExpandableWrapperComponent valueChanges:', this.config.field.name, value);
    });

    this.subscription.add(
      this.expandableFieldService.getObservable().subscribe(expandedFieldId => {
        const dialogShouldBeOpen = (this.config.field.index === expandedFieldId);
        if (dialogShouldBeOpen === this.dialogIsOpen) { return; }
        this.dialogIsOpen = dialogShouldBeOpen;
      }),
    );
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  setTouched() {
    this.group.controls[this.config.field.name].markAsTouched();
  }

  expandDialog() {
    angularConsoleLog('ExpandableWrapperComponent expandDialog');
    this.expandableFieldService.expand(true, this.config.field.index, this.config.form.formId);
  }
  closeDialog() {
    angularConsoleLog('ExpandableWrapperComponent closeDialog');
    this.expandableFieldService.expand(false, this.config.field.index, this.config.form.formId);
  }

  ngOnDestroy() {
    angularConsoleLog('ExpandableWrapper destroyed');
    this.elConnector.destroy();
    this.subscription.unsubscribe();
    this.subscription = null;
    this.dropzoneDraggingHelper.detach();
  }
}
