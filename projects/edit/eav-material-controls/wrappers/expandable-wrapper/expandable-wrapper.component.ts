import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { consoleLogAngular } from '../../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { FieldWrapper } from '../../../form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { ContentTypeService, EntityCacheService, FeatureService, InputTypeService } from '../../../shared/store/ngrx-data';
import { AdamService } from '../../adam/adam.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ConnectorHelper } from '../../input-types/custom/external-web-component/connector/connector.helper';
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
    fieldsSettingsService: FieldsSettingsService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featureService: FeatureService,
    private editRoutingService: EditRoutingService,
    private adamService: AdamService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private entityCacheService: EntityCacheService,
    private zone: NgZone,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.config.focused$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [focused],
      ]) => {
        const templateVars: ExpandableWrapperTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          focused,
        };
        return templateVars;
      }),
    );
  }

  ngAfterViewInit() {
    const componentTag = `field-${this.config.inputType}`;
    consoleLogAngular('ExpandableWrapper created for:', componentTag);
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
      this.adamService,
      this.dialog,
      this.viewContainerRef,
      this.changeDetectorRef,
      this.fieldsSettingsService,
      this.entityCacheService,
      this.zone,
    );

    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    consoleLogAngular('ExpandableWrapper destroyed');
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
