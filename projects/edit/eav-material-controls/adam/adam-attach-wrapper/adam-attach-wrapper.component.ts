import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdamAttachWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  fullscreenAdam: boolean;
  adamDisabled$ = new BehaviorSubject(true);

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
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
