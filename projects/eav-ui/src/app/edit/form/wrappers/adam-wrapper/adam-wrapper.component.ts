import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';

@Component({
  selector: WrappersConstants.AdamWrapper,
  templateUrl: './adam-wrapper.component.html',
  styleUrls: ['./adam-wrapper.component.scss'],
})
export class AdamWrapperComponent extends BaseFieldComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  fullscreenAdam: boolean;
  adamDisabled$ = new BehaviorSubject(true);

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.fullscreenAdam = this.config.inputType === InputTypeConstants.HyperlinkLibrary;
  }

  ngAfterViewInit() {
    this.subscription.add(
      this.config.adam.getConfig$().subscribe(adamConfig => {
        const disabled = adamConfig?.disabled ?? true;
        if (this.adamDisabled$.value !== disabled) {
          this.adamDisabled$.next(disabled);
        }
      })
    );
  }

  ngOnDestroy() {
    this.adamDisabled$.complete();
    super.ngOnDestroy();
  }

  openUpload() {
    this.invisibleClickableRef.nativeElement.click();
  }
}
