import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, fromEvent, map, Observable, share, startWith } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { consoleLogEditForm } from '../../../../shared/helpers/console-log-angular.helper';
import { vh } from '../../../../shared/helpers/viewport.helpers';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper, GeneralHelpers } from '../../../shared/helpers';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ContentTypeService, EntityCacheService, InputTypeService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { ConnectorHelper } from '../../shared/connector/connector.helper';
import { ContentExpandAnimation } from './content-expand.animation';
import { ExpandableWrapperViewModel, PreviewHeight } from './expandable-wrapper.models';
import { FieldHelperTextComponent } from '../../shared/field-helper-text/field-helper-text.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedFabSpeedDialModule } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.module';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle, AsyncPipe } from '@angular/common';

@Component({
    selector: WrappersConstants.ExpandableWrapper,
    templateUrl: './expandable-wrapper.component.html',
    styleUrls: ['./expandable-wrapper.component.scss'],
    animations: [ContentExpandAnimation],
    standalone: true,
    imports: [
        NgClass,
        ExtendedModule,
        FlexModule,
        MatCardModule,
        MatButtonModule,
        SharedComponentsModule,
        MatIconModule,
        ExtendedFabSpeedDialModule,
        MatRippleModule,
        MatFormFieldModule,
        NgStyle,
        FieldHelperTextComponent,
        AsyncPipe,
        TranslateModule,
    ],
})
export class ExpandableWrapperComponent extends BaseFieldComponent<string> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewContainer') private previewContainerRef: ElementRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open$: Observable<boolean>;
  adamDisabled$ = new BehaviorSubject(true);
  saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());
  viewModel$: Observable<ExpandableWrapperViewModel>;

  private connectorCreator: ConnectorHelper;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featuresService: FeaturesService,
    private editRoutingService: EditRoutingService,
    private adamService: AdamService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private entityCacheService: EntityCacheService,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private formsStateService: FormsStateService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    const previewHeight$ = combineLatest([
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName),
      fromEvent<UIEvent>(window, 'resize').pipe(map(() => undefined), startWith(undefined)),
    ]).pipe(
      map(([settings]) => {
        const previewHeight: PreviewHeight = {
          minHeight: '36px',
          maxHeight: '50vh',
        };
        if (this.config.inputType === InputTypeConstants.StringWysiwyg && settings.Dialog === 'inline') {
          let rows = parseInt(settings.InlineInitialHeight, 10);
          if (rows < 1) {
            rows = 1;
          }
          // header + rows
          const maxHeightInPx = vh(50);
          let minHeight = 40 + rows * 36;
          if (minHeight > maxHeightInPx) {
            minHeight = maxHeightInPx;
          }
          previewHeight.minHeight = `${minHeight}px`;
        }
        return previewHeight;
      }),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.viewModel$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.config.focused$, previewHeight$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [focused, previewHeight],
      ]) => {
        const viewModel: ExpandableWrapperViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          focused,
          previewHeight,
        };
        return viewModel;
      }),
    );
  }

  ngAfterViewInit() {
    this.subscription.add(
      this.config.adam.getConfig$().subscribe(adamConfig => {
        const disabled = adamConfig?.disabled ?? true;
        if (this.adamDisabled$.value !== disabled) {
          this.adamDisabled$.next(disabled);
        }
      })
    );

    const componentTag = `field-${this.config.inputType}`;
    consoleLogEditForm('ExpandableWrapper created for:', componentTag);
    this.connectorCreator = new ConnectorHelper(
      this.config,
      this.group,
      this.previewContainerRef,
      componentTag,
      this.eavService,
      this.translateService,
      this.contentTypeService,
      this.inputTypeService,
      this.featuresService,
      this.editRoutingService,
      this.adamService,
      this.dialog,
      this.viewContainerRef,
      this.changeDetectorRef,
      this.fieldsSettingsService,
      this.entityCacheService,
      this.snackBar,
      this.zone,
    );

    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    consoleLogEditForm('ExpandableWrapper destroyed');
    this.adamDisabled$.complete();
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

  saveAll(close: boolean) {
    this.formsStateService.saveForm$.next(close);
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }
}
