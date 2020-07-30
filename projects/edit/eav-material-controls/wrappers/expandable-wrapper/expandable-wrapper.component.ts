// tslint:disable-next-line:max-line-length
import { Component, OnInit, ViewContainerRef, ViewChild, Input, ElementRef, OnDestroy, NgZone, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { ConnectorHelper } from '../../input-types/custom/external-web-component/connector/connector.helper';
import { EavService } from '../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../shared/services/dnn-bridge.service';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../shared/store/ngrx-data/input-type.service';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
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
  @ViewChild('previewContainer') previewContainerRef: ElementRef;
  @ViewChild('backdrop') backdropRef: ElementRef;
  @ViewChild('dialog') dialogRef: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  dialogIsOpen = false;
  inlineMode = true;
  private subscription = new Subscription();
  private connectorCreator: ConnectorHelper;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  get value() {
    return this.group.controls[this.config.field.name].value ? this.group.controls[this.config.field.name].value
      .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') : '';
  }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }
  get dirty() { return this.group.controls[this.config.field.name].dirty || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }
  get bottomPixels() { return window.innerWidth > 600 ? '100px' : '50px'; }

  constructor(
    private eavService: EavService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featureService: FeatureService,
    private expandableFieldService: ExpandableFieldService,
    private dnnBridgeService: DnnBridgeService,
    private zone: NgZone,
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.changeDetector.detectChanges();
    const elName = `field-${this.config.field.inputType}`;
    angularConsoleLog('ExpandableWrapper created for:', elName, 'Config:', this.config.field);
    this.connectorCreator = new ConnectorHelper(
      this.config,
      this.group,
      this.previewContainerRef,
      elName,
      this.eavService,
      this.translateService,
      this.contentTypeService,
      this.inputTypeService,
      this.featureService,
      this.expandableFieldService,
      this.dnnBridgeService,
      this.dialog,
      this.zone,
    );

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
    this.connectorCreator.destroy();
    this.subscription.unsubscribe();
    this.subscription = null;
    this.dropzoneDraggingHelper.detach();
  }
}
