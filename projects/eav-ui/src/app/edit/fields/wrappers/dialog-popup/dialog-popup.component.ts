import { CommonModule, NgClass } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, NgZone, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesService } from '../../../../features/features.service';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ExtendedFabSpeedDialImports } from '../../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { EntityFormStateService } from '../../../entity-form/entity-form-state.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { FieldState } from '../../field-state';
import { DropzoneDraggingHelper } from '../dropzone-dragging.helper';
import { ContentExpandAnimation } from '../expand-dialog/content-expand.animation';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
    selector: WrappersCatalog.DialogPopup,
    templateUrl: './dialog-popup.component.html',
    styleUrls: ['./dialog-popup.component.scss'],
    animations: [ContentExpandAnimation],
    imports: [
        NgClass,
        MatCardModule,
        MatRippleModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule,
        ...ExtendedFabSpeedDialImports,
        TippyDirective,
        CommonModule,
    ]
})
// tslint:disable-next-line:max-line-length
export class DialogPopupComponent {
  @ViewChild('backdrop') private backdropRef: ElementRef;
  @ViewChild('dialog') private dialogRef: ElementRef;

  protected fieldState = inject(FieldState);

  public config = this.fieldState.config;
  public basics = this.fieldState.basics;
  #editRoutingService = inject(EditRoutingService);

  applyEmptyClass = input<boolean>();

  #dropzoneDraggingHelper: DropzoneDraggingHelper;

  #entityFormStateService = transient(EntityFormStateService);
  isSaving = this.#entityFormStateService.isSaving;
  te = this.#entityFormStateService.isSaving();

  isSavingStatus: boolean;



  constructor(
    public formsStateService: FormsStateService,
    private featuresService: FeaturesService,
    private zone: NgZone,
  ) {

    effect(() => {
      this.isSavingStatus = this.#entityFormStateService.isSaving();
    });



  }
  open = this.fieldState.isOpen

  ngAfterViewInit() {
    this.#dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.#dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.#dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    this.#dropzoneDraggingHelper.detach();
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
    this.#editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.triggerSave(close);
  }
}
