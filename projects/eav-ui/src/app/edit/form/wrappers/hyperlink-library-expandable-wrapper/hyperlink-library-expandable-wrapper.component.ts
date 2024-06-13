import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, share, Subject } from 'rxjs';
import { AdamItem } from '../../../../../../../edit-types';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { FormConfigService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
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
import { NgClass, AsyncPipe } from '@angular/common';
import { HyperlinkDefaultExpandableViewModel } from '../hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.models';
import { toSignal } from '@angular/core/rxjs-interop';

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
        AsyncPipe,
        TranslateModule,
    ],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkLibraryExpandableWrapperComponent extends BaseFieldComponent<null> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  // open$: Observable<boolean>;
  // saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());
  // viewModel$: Observable<HyperlinkLibraryExpandableViewModel>;

  open: WritableSignal<boolean> = signal(false);
  viewModel: WritableSignal<HyperlinkLibraryExpandableViewModel> = signal(null);
  saveButtonDisabled = toSignal(this.formsStateService.saveButtonDisabled$.pipe(share()), { initialValue: false });


  private adamItems$: BehaviorSubject<AdamItem[]>;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
    private featuresService: FeaturesService,
  ) {
    super(fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();

    // this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid).pipe(
    ).subscribe(value => this.open.set(value));

    this.adamItems$ = new BehaviorSubject<AdamItem[]>([]);
    const showAdamSponsor$ = this.featuresService.isEnabled$(FeatureNames.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

  //   this.viewModel$ = combineLatest([
  //     combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
  //     combineLatest([this.adamItems$, showAdamSponsor$]),
  //   ]).pipe(
  //     map(([
  //       [controlStatus, label, placeholder, required],
  //       [adamItems, showAdamSponsor],
  //     ]) => {
  //       const viewModel: HyperlinkLibraryExpandableViewModel = {
  //         controlStatus,
  //         label,
  //         placeholder,
  //         required,
  //         items: adamItems.slice(0, 9),
  //         itemsNumber: adamItems.length,
  //         showAdamSponsor,
  //       };
  //       return viewModel;
  //     }),
  //   );
  // }

  combineLatest([
    combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
    combineLatest([this.adamItems$, showAdamSponsor$]),
  ]).pipe(
    map(([
      [controlStatus, label, placeholder, required],
      [adamItems, showAdamSponsor],
    ]) => {
      return {
        controlStatus,
        label,
        placeholder,
        required,
        items: adamItems.slice(0, 9),
        itemsNumber: adamItems.length,
        showAdamSponsor,
      };
    }),
  ).subscribe(viewModel => this.viewModel.set(viewModel));
}

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
    this.subscriptions.add(
      this.config.adam.items$.subscribe(items => {
        this.adamItems$.next(items);
      })
    );
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
    this.adamItems$.complete();
    super.ngOnDestroy();
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
