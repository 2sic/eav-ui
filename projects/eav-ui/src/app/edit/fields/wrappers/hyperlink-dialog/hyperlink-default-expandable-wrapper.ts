import { CommonModule, NgClass, NgStyle } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, computed, inject, NgZone, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { TranslateModule } from "@ngx-translate/core";
import { FeatureIconTextComponent } from '../../../../features/feature-icon-text/feature-icon-text';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesService } from '../../../../features/features.service';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { FormConfigService } from "../../../form/form-config.service";
import { FormsStateService } from "../../../form/forms-state.service";
import { EditRoutingService } from "../../../routing/edit-routing.service";
import { LinkCacheService } from "../../../shared/adam/link-cache.service";
import { HyperlinkDefaultBaseComponent } from "../../basic/hyperlink-default/hyperlink-default-base";
import { PasteClipboardImageDirective } from "../../directives/paste-clipboard-image.directive";
import { FieldState } from "../../field-state";
import { FieldHelperTextComponent } from "../../help-text/field-help-text";
import { DialogPopupComponent } from "../dialog-popup/dialog-popup";
import { DropzoneDraggingHelper } from "../dropzone-dragging.helper";
import { ContentExpandAnimation } from "../expand-dialog/content-expand.animation";
import { WrappersCatalog } from "../wrappers.constants";


@Component({
    selector: WrappersCatalog.HyperlinkDefaultExpandableWrapper,
    templateUrl: './hyperlink-default-expandable-wrapper.html',
    styleUrls: ['./hyperlink-default-expandable-wrapper.scss'],
    animations: [ContentExpandAnimation],
    imports: [
        NgClass,
        MatIconModule,
        NgStyle,
        TranslateModule,
        TippyDirective,
        DialogPopupComponent,
        FieldHelperTextComponent,
        FeatureIconTextComponent,
        PasteClipboardImageDirective,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ]
})
// tslint:disable-next-line:max-line-length
export class HyperlinkDefaultExpandableWrapperComponent extends HyperlinkDefaultBaseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);
  public config = this.fieldState.config;
  protected basics = this.fieldState.basics;

  protected buttonAdam = computed(() => this.fieldState.settings().Buttons.includes('adam'), SignalEquals.bool);
  protected buttonPage = computed(() => this.fieldState.settings().Buttons.includes('page'), SignalEquals.bool);
  protected enableImageConfiguration= this.fieldState.settingExt('EnableImageConfiguration');

  private dropzoneDraggingHelper: DropzoneDraggingHelper;
  private editRoutingService: EditRoutingService;

  constructor(
    eavService: FormConfigService,
    matDialog: MatDialog,
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
      matDialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
      formsStateService,
    );
    this.editRoutingService = editRoutingService;
  }

  #hideAdamSponsor = this.featuresService.isEnabled[FeatureNames.NoSponsoredByToSic];
  adamSponsorI18nKey = computed(() => this.#hideAdamSponsor()
    ? 'Fields.Hyperlink.AdamFileManager.Name'
    : 'Fields.Hyperlink.Default.Sponsor'
  );

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
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
}
