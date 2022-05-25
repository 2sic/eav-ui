import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, share } from 'rxjs';
import { AdamItem } from '../../../../edit-types';
import { FeaturesConstants, WrappersConstants } from '../../../shared/constants';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { FeatureService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseComponent } from '../../fields/base/base.component';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { HyperlinkLibraryExpandableTemplateVars } from './hyperlink-library-expandable-wrapper.models';

@Component({
  selector: WrappersConstants.HyperlinkLibraryExpandableWrapper,
  templateUrl: './hyperlink-library-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-library-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
// tslint:disable-next-line:max-line-length
export class HyperlinkLibraryExpandableWrapperComponent extends BaseComponent<null> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  open$: Observable<boolean>;
  saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());
  templateVars$: Observable<HyperlinkLibraryExpandableTemplateVars>;

  private adamItems$: BehaviorSubject<AdamItem[]>;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
    private featureService: FeatureService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    this.adamItems$ = new BehaviorSubject<AdamItem[]>([]);
    const showAdamSponsor$ = this.featureService.isFeatureEnabled$(FeaturesConstants.NoSponsoredByToSic).pipe(
      map(isEnabled => !isEnabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.adamItems$, showAdamSponsor$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [adamItems, showAdamSponsor],
      ]) => {
        const templateVars: HyperlinkLibraryExpandableTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          items: adamItems.slice(0, 9),
          itemsNumber: adamItems.length,
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
