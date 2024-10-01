import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, computed, ElementRef, inject, Input, NgZone, ViewChild, ViewContainerRef } from '@angular/core';
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
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
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

@Component({
  selector: WrappersCatalog.DialogPopup,
  templateUrl: './dialog-popup.component.html',
  styleUrls: ['./dialog-popup.component.scss'],
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
    CommonModule,
  ],
})
// tslint:disable-next-line:max-line-length
export class DialogPopupComponent extends HyperlinkDefaultBaseComponent {
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  protected fieldState = inject(FieldState);

  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);
  public config = this.fieldState.config;
  public basics = this.fieldState.basics;

  @Input() applyEmptyClass: Boolean;

  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: FormConfigService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    editRoutingService: EditRoutingService,
    public formsStateService: FormsStateService,
    private featuresService: FeaturesScopedService,
    private zone: NgZone,
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

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
  }

  #hideAdamSponsor = this.featuresService.isEnabled[FeatureNames.NoSponsoredByToSic];
  adamSponsorI18nKey = computed(() => this.#hideAdamSponsor()
    ? 'Fields.Hyperlink.AdamFileManager.Name'
    : 'Fields.Hyperlink.Default.Sponsor'
  );

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }
}
