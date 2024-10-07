import { CommonModule, JsonPipe, NgClass, NgStyle } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, computed, ElementRef, inject, NgZone, OnDestroy, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from '../../../../../../../core/transient';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { vh } from '../../../../shared/helpers/viewport.helpers';
import { classLog } from '../../../../shared/logging';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { FormsStateService } from '../../../form/forms-state.service';
import { ConnectorHelper } from '../../connector/connector.helper';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { DialogPopupComponent } from '../dialog-popup/dialog-popup.component';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { WrappersCatalog } from '../wrappers.constants';
import { ContentExpandAnimation } from './content-expand.animation';
import { PreviewHeight } from './expandable-wrapper.models';

@Component({
  selector: WrappersCatalog.ExpandableWrapper,
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  standalone: true,
  imports: [
    NgClass,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    NgStyle,
    FieldHelperTextComponent,
    TranslateModule,
    JsonPipe,
    ...ExtendedFabSpeedDialImports,
    DialogPopupComponent,
    CommonModule,
  ],
})
export class ExpandableWrapperComponent implements AfterViewInit, OnDestroy {
  
  log = classLog({ExpandableWrapperComponent});

  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  /** Child tag which will contain the inner html */
  @ViewChild('previewContainer') private previewContainerRef: ElementRef;

  protected fieldState = inject(FieldState);
  public config = this.fieldState.config;
  protected basics = this.fieldState.basics;

  protected settings = this.fieldState.settings;
  protected ui = this.fieldState.ui;
  protected uiValue = this.fieldState.uiValue;

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
  }

  ngOnDestroy() {
    this.log.fn('ngOnDestroy', null, 'destroying ExpandableWrapper');
    this.dropzoneDraggingHelper.detach();
  }
}
