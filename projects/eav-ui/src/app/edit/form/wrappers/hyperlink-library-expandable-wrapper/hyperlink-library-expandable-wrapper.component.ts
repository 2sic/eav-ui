import { Component, computed, ElementRef, inject, NgZone, signal, ViewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import {  combineLatest, distinctUntilChanged, map } from 'rxjs';
import { AdamItem } from '../../../../../../../edit-types';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { EditRoutingService, FormsStateService } from '../../../shared/services';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { HyperlinkLibraryExpandableViewModel } from './hyperlink-library-expandable-wrapper.models';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text.component';
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
import { NgClass } from '@angular/common';
import { FieldState } from '../../builder/fields-builder/field-state';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

@Component({
  selector: WrappersConstants.HyperlinkLibraryExpandableWrapper,
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
    SharedComponentsModule,
    MatIconModule,
    ExtendedFabSpeedDialModule,
    MatRippleModule,
    MatFormFieldModule,
    FieldHelperTextComponent,
    FeatureIconTextComponent,
    TranslateModule,
  ],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkLibraryExpandableWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  protected fieldState = inject(FieldState);

  protected config = this.fieldState.config;
  protected controlStatus = this.fieldState.controlStatus;
  protected basics = this.fieldState.basics;

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);

  adamConfig = signal([]);
  protected items = computed(() => this.adamConfig().slice(0, 9));
  protected itemsNumber = computed(() => this.adamConfig().length, SignalHelpers.numberEquals);

  viewModel: WritableSignal<HyperlinkLibraryExpandableViewModel> = signal(null);

  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
    private featuresService: FeaturesService,
  ) { }

  ngOnInit() {
    const showAdamSponsor$ = this.featuresService.isEnabled$(FeatureNames.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

    combineLatest([
      combineLatest([showAdamSponsor$]),
    ]).pipe(
      map(([
        [showAdamSponsor],
      ]) => {
        return {
          showAdamSponsor,
        };
      }),
    ).subscribe(viewModel => this.viewModel.set(viewModel));
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
    this.config.adam.items$.subscribe(items => {
      this.adamConfig.set(items);
    });
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
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.saveForm$.next(close);
  }
}
