import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { combineLatest, distinctUntilChanged, fromEvent, map, share, startWith } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { consoleLogEditForm } from '../../../../shared/helpers/console-log-angular.helper';
import { vh } from '../../../../shared/helpers/viewport.helpers';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { AdamService, FormConfigService, EditRoutingService, FormsStateService } from '../../../shared/services';
import { ContentTypeService, InputTypeService } from '../../../shared/store/ngrx-data';
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
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { toSignal } from '@angular/core/rxjs-interop';

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
    TranslateModule,
  ],
})
export class ExpandableWrapperComponent extends BaseFieldComponent<string> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewContainer') private previewContainerRef: ElementRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open = signal(false);
  saveButtonDisabled = toSignal(this.formsStateService.saveButtonDisabled$.pipe(share()), { initialValue: false });
  adamDisabled = signal<boolean>(true);

  focused = signal(false);
  previewHeight = signal(null);


  viewModel: WritableSignal<ExpandableWrapperViewModel> = signal(null);

  private connectorCreator: ConnectorHelper;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    private formConfig: FormConfigService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featuresService: FeaturesService,
    private editRoutingService: EditRoutingService,
    private adamService: AdamService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private formsStateService: FormsStateService,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();

    this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid)
      .subscribe(value => this.open.set(value));

    this.config.focused$.subscribe(focused => {
      this.focused.set(focused);
    });

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
      distinctUntilChanged(RxHelpers.objectsEqual),
    );

    previewHeight$.subscribe(previewHeight => this.previewHeight.set(previewHeight));

  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.config.adam.getConfig$().subscribe(adamConfig => {
        const disabled = adamConfig?.disabled ?? true;
        if (this.adamDisabled() !== disabled) {
          this.adamDisabled.set(disabled);
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
      this.formConfig,
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
      this.snackBar,
      this.zone,
    );

    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    consoleLogEditForm('ExpandableWrapper destroyed');
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
