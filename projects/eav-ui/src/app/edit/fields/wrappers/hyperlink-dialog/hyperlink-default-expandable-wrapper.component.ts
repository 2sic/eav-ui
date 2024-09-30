import { NgClass, NgStyle } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, computed, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text.component';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesScopedService } from '../../../../features/features-scoped.service';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { LinkCacheService } from '../../../shared/adam/link-cache.service';
import { HyperlinkDefaultBaseComponent } from '../../basic/hyperlink-default/hyperlink-default-base.component';
import { PasteClipboardImageDirective } from '../../directives/paste-clipboard-image.directive';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
import { WrappersCatalog } from '../wrappers.constants';
import { TippyDirective } from './../../../../shared/directives/tippy.directive';

@Component({
  selector: WrappersCatalog.HyperlinkDefaultExpandableWrapper,
  templateUrl: './hyperlink-default-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-default-expandable-wrapper.component.scss'],
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
    NgStyle,
    MatFormFieldModule,
    MatInputModule,
    PasteClipboardImageDirective,
    FieldHelperTextComponent,
    FeatureIconTextComponent,
    TranslateModule,
    ClickStopPropagationDirective,
    ...ExtendedFabSpeedDialImports,
    TippyDirective,
  ],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkDefaultExpandableWrapperComponent extends HyperlinkDefaultBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  protected fieldState = inject(FieldState);

  public config = this.fieldState.config;

  protected basics = this.fieldState.basics;

  protected buttonAdam = computed(() => this.fieldState.settings().Buttons.includes('adam'), SignalEquals.bool);
  protected buttonPage = computed(() => this.fieldState.settings().Buttons.includes('page'), SignalEquals.bool);
  protected enableImageConfiguration = computed(() => this.fieldState.settings().EnableImageConfiguration, SignalEquals.bool);

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);

  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: FormConfigService,
    matDialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    editRoutingService: EditRoutingService,
    private zone: NgZone,
    public formsStateService: FormsStateService,
    private featuresService: FeaturesScopedService,
  ) {
    super(
      eavService,
      matDialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
      editRoutingService,
      formsStateService,
    );
  }

  #hideAdamSponsor = this.featuresService.isEnabled[FeatureNames.NoSponsoredByToSic];
  adamSponsorI18nKey = computed(() => this.#hideAdamSponsor()
    ? 'Fields.Hyperlink.AdamFileManager.Name'
    : 'Fields.Hyperlink.Default.Sponsor'
  );

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  markAsTouched() {
    this.fieldState.ui().markTouched();
  }

  setValue(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.fieldState.ui().setIfChanged(newValue);
  }

  expandDialog() {
    if (this.fieldState.ui().disabled) return;
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }
}
