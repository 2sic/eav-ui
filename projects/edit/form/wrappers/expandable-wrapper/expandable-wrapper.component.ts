import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { consoleLogAngular } from '../../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { vh } from '../../../../ng-dialogs/src/app/shared/helpers/viewport.helpers';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { ContentTypeService, EntityCacheService, FeatureService, InputTypeService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseComponent } from '../../fields/base/base.component';
import { ConnectorHelper } from '../../shared/connector/connector.helper';
import { ContentExpandAnimation } from './content-expand.animation';
import { ExpandableWrapperTemplateVars } from './expandable-wrapper.models';

@Component({
  selector: WrappersConstants.ExpandableWrapper,
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

    const previewMinHeight$ = combineLatest([
      fromEvent<UIEvent>(window, 'resize').pipe(
        map(() => vh(50)), // WARNING! must match css
        startWith(vh(50)), // WARNING! must match css
      ),
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName),
    ]).pipe(
      map(([maxHeight, settings]) => {
        if (this.config.inputType === InputTypeConstants.StringWysiwyg) {
          let rows = parseInt(settings.InlineInitialHeight || '3', 10);
          if (rows < 1) {
            rows = 1;
          }
          // header + rows
          let minHeight = 40 + rows * 36;
          if (minHeight > maxHeight) {
            minHeight = maxHeight;
          }
          return `${minHeight}px`;
        }
        return null;
      }),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.config.focused$, previewMinHeight$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [focused, previewMinHeight],
      ]) => {
        const templateVars: ExpandableWrapperTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          focused,
          previewMinHeight,
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
