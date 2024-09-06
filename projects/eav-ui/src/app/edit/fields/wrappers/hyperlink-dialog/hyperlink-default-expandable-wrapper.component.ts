import { TippyDirective } from './../../../../shared/directives/tippy.directive';
import { AfterViewInit, ChangeDetectorRef, Component, computed, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text.component';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { PasteClipboardImageDirective } from '../../directives/paste-clipboard-image.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { ControlHelpers } from '../../../shared/controls/control.helpers';
import { FieldState } from '../../field-state';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { FeaturesService } from '../../../../features/features.service';
import { FeatureNames } from '../../../../features/feature-names';
import { HyperlinkDefaultBaseComponent } from '../../basic/hyperlink-default/hyperlink-default-base.component';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { WrappersCatalog } from '../wrappers.constants';
import { LinkCacheService } from '../../../shared/adam/link-cache.service';

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

  adamItem = computed(() => {
    const controlStatus = this.controlStatus();
    const adamItems = this.config.adam.items();

    if (!controlStatus.value || !adamItems.length) return;

    const match = controlStatus.value.trim().match(/^file:([0-9]+)$/i);
    if (!match) return;

    const adamItemId = parseInt(match[1], 10);
    const adamItem = adamItems.find(i => i.Id === adamItemId);
    return adamItem;
  });


  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: FormConfigService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    editRoutingService: EditRoutingService,
    private zone: NgZone,
    public formsStateService: FormsStateService,
    private featuresService: FeaturesService,
  ) {
    super(
      eavService,
      dialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
      editRoutingService,
      formsStateService,
    );
  }

  protected hideAdamSponsor = this.featuresService.isEnabled(FeatureNames.NoSponsoredByToSic);
  adamSponsorI18nKey = computed(() => this.hideAdamSponsor()
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
    ControlHelpers.markControlTouched(this.control);
  }

  setValue(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    if (this.control.value === newValue) return;
    ControlHelpers.patchControlValue(this.control, newValue);
  }

  expandDialog() {
    if (this.control.disabled) return;
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }
}
