import { ChangeDetectorRef, Component, computed, ElementRef, inject, NgZone, Signal, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { vh } from '../../../../shared/helpers/viewport.helpers';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { EditRoutingService, FormsStateService, FieldsSettingsService } from '../../../shared/services';
import { ConnectorHelper } from '../../shared/connector/connector.helper';
import { ContentExpandAnimation } from './content-expand.animation';
import { PreviewHeight } from './expandable-wrapper.models';
import { FieldHelperTextComponent } from '../../shared/field-helper-text/field-helper-text.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle, JsonPipe } from '@angular/common';
import { FieldState } from '../../builder/fields-builder/field-state';
import { ControlStatus } from '../../../shared/models';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { transient } from 'projects/eav-ui/src/app/core';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'ExpandableWrapperComponent';

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
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    NgStyle,
    FieldHelperTextComponent,
    TranslateModule,
    JsonPipe,
    TippyDirective,
    ...ExtendedFabSpeedDialImports,
  ],
})
export class ExpandableWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  /** Child tag which will contain the inner html */
  @ViewChild('previewContainer') private previewContainerRef: ElementRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  public fieldsSettingsService = inject(FieldsSettingsService);

  protected fieldState = inject(FieldState);
  private config = this.fieldState.config;

  protected basics = this.fieldState.basics;
  protected settings = this.fieldState.settings;
  protected controlStatus = this.fieldState.controlStatus as Signal<ControlStatus<string>>;

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);
  focused = signal(false);

  adamDisabled = signal<boolean>(true);

  previewHeight = computed(() => {
    const settings = this.settings();
    const previewHeight: PreviewHeight = {
      minHeight: '36px',
      maxHeight: '50vh',
    };

    if (this.config.inputTypeStrict !== InputTypeConstants.StringWysiwyg && settings.Dialog !== 'inline')
      return previewHeight;

    let rows = parseInt(settings.InlineInitialHeight, 10);
    if (rows < 1)
      rows = 1;

    // header + rows
    const maxHeightInPx = vh(50);
    let minHeight = 40 + rows * 36;

    if (minHeight > maxHeightInPx)
      minHeight = maxHeightInPx;

    previewHeight.minHeight = `${minHeight}px`;

    return previewHeight;
  })

  private connectorCreator = transient(ConnectorHelper);
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  private log = new EavLogger(nameOfThis, logThis);

  constructor(
    private editRoutingService: EditRoutingService,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private zone: NgZone,
    public formsStateService: FormsStateService,
  ) { }

  ngOnInit() {

    this.config.focused$
      .subscribe(this.focused.set);
  }

  ngAfterViewInit() {
    const l = this.log.fn('ngAfterViewInit');
    this.config.adam.getConfig$().subscribe(adamConfig => {
      const disabled = adamConfig?.disabled ?? true;
      if (this.adamDisabled() !== disabled)
        this.adamDisabled.set(disabled);
    })

    const componentTagName = `field-${this.config.inputTypeStrict}`;
    l.a('ExpandableWrapper created for:', { componentTagName });
    this.connectorCreator.init(
      componentTagName,
      this.previewContainerRef,
      this.viewContainerRef,
      this.changeDetectorRef,
    );

    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    this.log.fn('ngOnDestroy', null, 'destroying ExpandableWrapper');
    this.dropzoneDraggingHelper.detach();
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
