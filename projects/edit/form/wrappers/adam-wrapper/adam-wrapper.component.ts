import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseComponent } from '../../fields/base/base.component';

@Component({
  selector: WrappersConstants.AdamWrapper,
  templateUrl: './adam-wrapper.component.html',
  styleUrls: ['./adam-wrapper.component.scss'],
})
export class AdamWrapperComponent extends BaseComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
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
        if (adamConfig == null) { return; }
        this.adamDisabled$.next(adamConfig.disabled);
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
