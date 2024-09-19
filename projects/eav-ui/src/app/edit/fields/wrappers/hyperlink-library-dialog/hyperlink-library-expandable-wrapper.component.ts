import { Component, computed, ElementRef, inject, NgZone, ViewChild, ViewContainerRef } from '@angular/core';
import { AdamItem } from '../../../../../../../edit-types';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text.component';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { FieldState } from '../../field-state';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesScopedService } from '../../../../features/features-scoped.service';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
  selector: WrappersCatalog.HyperlinkLibraryExpandableWrapper,
  templateUrl: './hyperlink-library-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-library-expandable-wrapper.component.scss'],
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
    FieldHelperTextComponent,
    FeatureIconTextComponent,
    TranslateModule,
    ...ExtendedFabSpeedDialImports,
    TippyDirective,
  ],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkLibraryExpandableWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  protected fieldState = inject(FieldState);

  protected config = this.fieldState.config;
  protected ui = this.fieldState.ui;
  protected uiValue = this.fieldState.uiValue;
  protected basics = this.fieldState.basics;

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);

  protected items = computed(() => this.config.adam.items().slice(0, 9));
  protected itemsNumber = computed(() => this.config.adam.items().length, SignalEquals.number);

  protected hideAdamSponsor = this.featuresService.isEnabled(FeatureNames.NoSponsoredByToSic);
  adamSponsorI18nKey = computed(() => this.hideAdamSponsor()
    ? 'Fields.Hyperlink.AdamFileManager.Name'
    : 'Fields.Hyperlink.Default.Sponsor'
  );

  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
    private featuresService: FeaturesScopedService,
  ) { }

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

  trackByFn(index: number, item: AdamItem) {
    return item.Id;
  }

  expandDialog() {
    if (this.config.initialDisabled) return;
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }
}
