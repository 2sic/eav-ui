import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { FieldConfigGroup, FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { CollapsibleWrapperLogic } from './collapsible-wrapper-logic';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  fieldConfig: FieldConfigGroup;
  visibleInEditUI$: Observable<boolean>;
  collapse$ = new BehaviorSubject(false);
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  itemTitle$: Observable<string>;
  slotCanBeEmpty$: Observable<boolean>;
  slotIsEmpty$: Observable<boolean>;
  description$: Observable<string>;

  private header$ = new BehaviorSubject<EavHeader>(null);
  private settings$ = new BehaviorSubject<FieldSettings>(null);
  private subscription = new Subscription();

  constructor(
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId).pipe(share());
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId).pipe(share());
    this.subscription.add(
      this.itemService.selectItemHeader(this.config.entity.entityGuid).subscribe(this.header$)
    );

    const settingsLogic = new CollapsibleWrapperLogic();
    this.subscription.add(
      settingsLogic.update(
        this.fieldConfig.settings$,
        this.header$,
        this.fieldConfig.isParentGroup,
        this.currentLanguage$,
        this.defaultLanguage$,
        this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId),
      ).subscribe(this.settings$)
    );
    this.visibleInEditUI$ = this.settings$.pipe(map(settings => settings.VisibleInEditUI));
    this.itemTitle$ = this.settings$.pipe(map(settings => settings._itemTitle));
    this.slotCanBeEmpty$ = this.settings$.pipe(map(settings => settings._slotCanBeEmpty));
    this.slotIsEmpty$ = this.settings$.pipe(map(settings => settings._slotIsEmpty));
    this.description$ = this.settings$.pipe(map(settings => settings._description));

    this.collapse$.next(this.settings$.value.DefaultCollapsed);

    this.subscription.add(
      combineLatest([this.currentLanguage$, this.defaultLanguage$]).subscribe(([currentLanguage, defaultLanguage]) => {
        this.fieldsSettingsService.translateGroupSettingsAndValidation(this.fieldConfig, currentLanguage, defaultLanguage);
      })
    );
  }

  ngOnDestroy() {
    this.collapse$.complete();
    this.header$.complete();
    this.settings$.complete();
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.collapse$.next(!this.collapse$.value);
  }

  toggleSlotIsEmpty() {
    const header = this.header$.value;
    const newHeader: EavHeader = { ...header, Group: { ...header.Group, SlotIsEmpty: !header.Group.SlotIsEmpty } };
    this.itemService.updateItemHeader(this.config.entity.entityGuid, newHeader);
  }

  openHistory() {
    this.router.navigate([`versions/${this.config.entity.entityId}`], { relativeTo: this.route });
  }
}
