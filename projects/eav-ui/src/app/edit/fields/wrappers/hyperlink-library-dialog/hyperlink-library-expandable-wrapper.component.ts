import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { AfterViewInit, Component, computed, inject, NgZone, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AdamItem } from '../../../../../../../edit-types';
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text.component';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesScopedService } from '../../../../features/features-scoped.service';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { DialogPopupComponent } from '../dialog-popup/dialog-popup.component';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
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
    NgStyle,
    MatFormFieldModule,
    FieldHelperTextComponent,
    FeatureIconTextComponent,
    TranslateModule,
    ...ExtendedFabSpeedDialImports,
    DialogPopupComponent,
    CommonModule,
  ],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkLibraryExpandableWrapperComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;
  protected basics = this.fieldState.basics;

  protected ui = this.fieldState.ui;
  protected uiValue = this.fieldState.uiValue;

  protected items = computed(() => this.config.adam.items().slice(0, 9));
  protected itemsNumber = computed(() => this.config.adam.items().length, SignalEquals.number);

  #hideAdamSponsor = this.featuresService.isEnabled[FeatureNames.NoSponsoredByToSic];
  adamSponsorI18nKey = computed(() => this.#hideAdamSponsor()
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
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
  }
  
  trackByFn(index: number, item: AdamItem) {
    return item.Id;
  }

  expandDialog() {
    if (this.config.initialDisabled) return;
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}