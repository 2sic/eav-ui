import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { AdamItem } from '../../../../../../../edit-types';
import { WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { AdamService, FormConfigService, EditRoutingService, FormsStateService } from '../../../shared/services';
import { LinkCacheService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { HyperlinkDefaultBaseComponent } from '../../fields/hyperlink/hyperlink-default/hyperlink-default-base.component';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { HyperlinkDefaultExpandableViewModel } from './hyperlink-default-expandable-wrapper.models';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text.component';
import { FieldHelperTextComponent } from '../../shared/field-helper-text/field-helper-text.component';
import { PasteClipboardImageDirective } from '../../../shared/directives/paste-clipboard-image.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedFabSpeedDialModule } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.module';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

@Component({
  selector: WrappersConstants.HyperlinkDefaultExpandableWrapper,
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
    SharedComponentsModule,
    MatIconModule,
    ExtendedFabSpeedDialModule,
    MatRippleModule,
    NgStyle,
    MatFormFieldModule,
    MatInputModule,
    PasteClipboardImageDirective,
    FieldHelperTextComponent,
    FeatureIconTextComponent,
    TranslateModule,
    ClickStopPropagationDirective,
  ],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkDefaultExpandableWrapperComponent extends HyperlinkDefaultBaseComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open = signal(false);
  viewModel = signal<HyperlinkDefaultExpandableViewModel>(null);

  private adamItems$: BehaviorSubject<AdamItem[]>;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: FormConfigService,
    adamService: AdamService,
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
      adamService,
      dialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
      editRoutingService,
      formsStateService,
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.adamItems$ = new BehaviorSubject<AdamItem[]>([]);

    this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid)
      .subscribe(this.open.set);

    const settings$ = this.settings$.pipe(
      map(settings => ({
        _buttonAdam: settings.Buttons.includes('adam'),
        _buttonPage: settings.Buttons.includes('page'),
        EnableImageConfiguration: settings.EnableImageConfiguration,
      })),
      distinctUntilChanged(RxHelpers.objectsEqual),
    );
    const adamItem$ = combineLatest([this.controlStatus$, this.adamItems$]).pipe(
      map(([controlStatus, adamItems]) => {
        if (!controlStatus.value || !adamItems.length) { return; }

        const match = controlStatus.value.trim().match(/^file:([0-9]+)$/i);
        if (!match) { return; }

        const adamItemId = parseInt(match[1], 10);
        const adamItem = adamItems.find(i => i.Id === adamItemId);
        return adamItem;
      }),
      distinctUntilChanged(),
    );

    const showAdamSponsor$ = this.featuresService.isEnabled$(FeatureNames.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

    combineLatest([
      combineLatest([this.preview$, settings$, adamItem$, showAdamSponsor$]),
    ]).pipe(
      map(([
        [preview, settings, adamItem, showAdamSponsor],
      ]) => {
        return {
          preview,
          buttonAdam: settings._buttonAdam,
          buttonPage: settings._buttonPage,
          adamItem,
          enableImageConfiguration: settings.EnableImageConfiguration,
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
    this.adamItems$.complete();
    this.dropzoneDraggingHelper.detach();
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  markAsTouched() {
    ControlHelpers.markControlTouched(this.control);
  }

  setValue(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    if (this.control.value === newValue) { return; }
    ControlHelpers.patchControlValue(this.control, newValue);
  }

  expandDialog() {
    if (this.control.disabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.saveForm$.next(close);
  }
}
