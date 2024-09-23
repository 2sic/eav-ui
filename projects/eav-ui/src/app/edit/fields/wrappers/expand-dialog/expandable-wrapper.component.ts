import { ChangeDetectorRef, Component, computed, ElementRef, inject, NgZone, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { vh } from '../../../../shared/helpers/viewport.helpers';
import { ContentExpandAnimation } from './content-expand.animation';
import { PreviewHeight } from './expandable-wrapper.models';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle, JsonPipe } from '@angular/common';
import { FieldState } from '../../field-state';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { transient } from '../../../../core/transient';
import { ConnectorHelper } from '../../connector/connector.helper';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { WrappersCatalog } from '../wrappers.constants';
import { classLog } from '../../../../shared/logging';

@Component({
  selector: WrappersCatalog.ExpandableWrapper,
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
  
  log = classLog({ExpandableWrapperComponent});

  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  /** Child tag which will contain the inner html */
  @ViewChild('previewContainer') private previewContainerRef: ElementRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  protected fieldState = inject(FieldState) as FieldState<string>;
  private config = this.fieldState.config;

  protected basics = this.fieldState.basics;
  protected settings = this.fieldState.settings;
  protected ui = this.fieldState.ui;
  protected uiValue = this.fieldState.uiValue;

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);
  focused = signal(false);

  adamDisabled = this.config.adam.isDisabled;

  previewHeight = computed(() => {
    const settings = this.settings();
    const previewHeight: PreviewHeight = {
      minHeight: '36px',
      maxHeight: '50vh',
    };

    if (this.config.inputTypeSpecs.inputType !== InputTypeCatalog.StringWysiwyg && settings.Dialog !== 'inline')
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

  constructor(
    private editRoutingService: EditRoutingService,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private zone: NgZone,
    public formsStateService: FormsStateService,
  ) { }

  ngOnInit() {
    this.config.focused$.subscribe(this.focused.set);
  }

  ngAfterViewInit() {
    const l = this.log.fn('ngAfterViewInit');

    const componentTagName = this.config.inputTypeSpecs.componentTagName;
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

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }
}
