import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations';
import { DropzoneDraggingHelper, GeneralHelpers } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService, FileTypeService } from '../../../shared/services';
import { LinkCacheService } from '../../../shared/store/ngrx-data';
import { AdamService } from '../../adam/adam.service';
import { HyperlinkDefaultBaseComponent } from '../../input-types/hyperlink/hyperlink-default/hyperlink-default-base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { HyperlinkDefaultExpandableTemplateVars } from './hyperlink-default-expandable-wrapper.models';

@Component({
  selector: 'app-hyperlink-default-expandable-wrapper',
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
  templateVars$: Observable<HyperlinkDefaultExpandableTemplateVars>;

  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    fileTypeService: FileTypeService,
    adamService: AdamService,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    linkCacheService: LinkCacheService,
    private editRoutingService: EditRoutingService,
    private zone: NgZone,
  ) {
    super(
      eavService,
      validationMessagesService,
      fieldsSettingsService,
      fileTypeService,
      adamService,
      dialog,
      viewContainerRef,
      changeDetectorRef,
      linkCacheService,
    );
  }

  ngOnInit() {
    super.ngOnInit();

    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    const settings$ = this.settings$.pipe(
      map(settings => ({
        _buttonAdam: settings.Buttons.includes('adam'),
        _buttonPage: settings.Buttons.includes('page'),
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.value$, this.preview$, this.label$, this.placeholder$, this.invalid$, this.required$]),
      combineLatest([settings$, this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [value, preview, label, placeholder, invalid, required],
        [settings, disabled, touched],
      ]) => {
        const templateVars: HyperlinkDefaultExpandableTemplateVars = {
          value,
          preview,
          label,
          placeholder,
          invalid,
          required,
          buttonAdam: settings._buttonAdam,
          buttonPage: settings._buttonPage,
          disabled,
          touched,
        };
        return templateVars;
      }),
    );
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  markAsTouched() {
    this.validationMessagesService.markAsTouched(this.control);
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
}
