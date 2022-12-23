import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, share } from 'rxjs';
import { AdamItem } from '../../../../../../../edit-types';
import { FeaturesConstants, WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper, GeneralHelpers } from '../../../shared/helpers';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { WipFeatureService, LinkCacheService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { HyperlinkDefaultBaseComponent } from '../../fields/hyperlink/hyperlink-default/hyperlink-default-base.component';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { HyperlinkDefaultExpandableTemplateVars } from './hyperlink-default-expandable-wrapper.models';

@Component({
  selector: WrappersConstants.HyperlinkDefaultExpandableWrapper,
  templateUrl: './hyperlink-default-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-default-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkDefaultExpandableWrapperComponent extends HyperlinkDefaultBaseComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open$: Observable<boolean>;
  saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());
  templateVars$: Observable<HyperlinkDefaultExpandableTemplateVars>;

  private adamItems$: BehaviorSubject<AdamItem[]>;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    adamService: AdamService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    editRoutingService: EditRoutingService,
    private zone: NgZone,
    formsStateService: FormsStateService,
    private featureService: WipFeatureService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
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

    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    const settings$ = this.settings$.pipe(
      map(settings => ({
        _buttonAdam: settings.Buttons.includes('adam'),
        _buttonPage: settings.Buttons.includes('page'),
        EnableImageConfiguration: settings.EnableImageConfiguration,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
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
    const showAdamSponsor$ = this.featureService.isFeatureEnabled$(FeaturesConstants.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.preview$, settings$, adamItem$, showAdamSponsor$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [preview, settings, adamItem, showAdamSponsor],
      ]) => {
        const templateVars: HyperlinkDefaultExpandableTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          preview,
          buttonAdam: settings._buttonAdam,
          buttonPage: settings._buttonPage,
          adamItem,
          enableImageConfiguration: settings.EnableImageConfiguration,
          showAdamSponsor,
        };
        return templateVars;
      }),
    );
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
    this.subscription.add(
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
    GeneralHelpers.markControlTouched(this.control);
  }

  setValue(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    if (this.control.value === newValue) { return; }
    GeneralHelpers.patchControlValue(this.control, newValue);
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
