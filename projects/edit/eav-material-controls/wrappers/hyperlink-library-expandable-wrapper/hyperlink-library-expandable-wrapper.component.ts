import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdamItem } from '../../../../edit-types';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations';
import { DropzoneDraggingHelper } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { HyperlinkLibraryExpandableTemplateVars } from './hyperlink-library-expandable-wrapper.models';

@Component({
  selector: 'app-hyperlink-library-expandable-wrapper',
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
  templateVars$: Observable<HyperlinkLibraryExpandableTemplateVars>;

  private adamItems$: BehaviorSubject<AdamItem[]>;
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.open$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);
    this.adamItems$ = new BehaviorSubject<AdamItem[]>([]);

    this.templateVars$ = combineLatest([
      combineLatest([this.value$, this.label$, this.required$, this.invalid$, this.adamItems$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [value, label, required, invalid, items],
        [disabled, showValidation],
      ]) => {
        const templateVars: HyperlinkLibraryExpandableTemplateVars = {
          value,
          label,
          required,
          invalid,
          items: items.slice(0, 9),
          itemsNumber: items.length,
          disabled,
          showValidation,
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
}
