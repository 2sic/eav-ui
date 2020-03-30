import { Component, ViewChild, ViewContainerRef, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { FieldConfigSet, FieldConfigGroup } from '../../../eav-dynamic-form/model/field-config';
import { EavGroupAssignment } from '../../../shared/models/eav/eav-group-assignment';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../validators/validation-helper';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss']
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  private subscriptions: Subscription[] = [];
  fieldConfig: FieldConfigGroup;
  slotIsUsedChecked = false;
  header: EavHeader;
  collapse = false;
  currentLanguage$: Observable<string>;
  currentLanguage: string;
  defaultLanguage$: Observable<string>;
  defaultLanguage: string;
  description: string;
  itemTitle: string;

  get slotCanBeEmpty() {
    return this.config.entity.header.Group ? this.config.entity.header.Group.SlotCanBeEmpty || false : false;
  }

  constructor(
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
  ) { }

  ngOnInit() {
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.currentLanguage$.pipe(take(1)).subscribe(currentLang => { this.currentLanguage = currentLang; });
    this.defaultLanguage$.pipe(take(1)).subscribe(defaultLang => { this.defaultLanguage = defaultLang; });

    this.collapse = this.fieldConfig.settings ? this.fieldConfig.settings.DefaultCollapsed || false : false;
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLang => {
        this.currentLanguage = currentLang;
        this.translateAllConfiguration();
        if (this.fieldConfig.isParentGroup) { this.calculateItemName(); }
        this.calculateDescription();
      }),
    );
    if (this.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid).subscribe(header => {
          if (header.Group) { this.slotIsUsedChecked = !header.Group.SlotIsEmpty; }
          this.header = { ...header };
        }),
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  calculateItemName() {
    this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId).pipe(take(1)).subscribe(contentType => {
      let label: string;
      try {
        const type = contentType.contentType.metadata
          // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
          .find(metadata => metadata.type.name === 'ContentType' || metadata.type.name === 'xx ContentType');
        if (!!type) {
          label = LocalizationHelper.getValueOrDefault(type.attributes.Label, this.currentLanguage, this.defaultLanguage)?.value;
        }
        label = label || contentType.contentType.name;
      } catch (error) {
        label = contentType.contentType.name;
      }
      this.itemTitle = label;
    });
  }

  calculateDescription() {
    if (this.fieldConfig.isParentGroup) {
      this.description = this.config.field.settings ? (this.config.field.settings.EditInstructions || '') : '';
    } else {
      this.description = this.config.field.settings ? (this.config.field.settings.Notes || '') : '';
    }
  }

  /// toggle / change if a section (slot) is in use or not (like an unused presentation)
  toggleSlotIsEmpty() {
    if (this.header.Group) {
      const updateHeader: EavHeader = { ...this.header, Group: { ...this.header.Group, SlotIsEmpty: this.slotIsUsedChecked } };
      this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid, updateHeader);
    } else { // if header group undefined create empty group object
      this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid,
        { ...this.header, Group: new EavGroupAssignment() });
    }
  }

  changeAnchorTarget(event: MouseEvent) {
    (event.target as HTMLElement).querySelectorAll('a').forEach(anchor => anchor.target = '_blank');
  }

  private translateAllConfiguration() {
    this.config.field.settings = LocalizationHelper.translateSettings(this.config.field.fullSettings,
      this.currentLanguage, this.defaultLanguage);
    this.config.field.label = this.config.field.settings.Name || null;
    this.config.field.validation = ValidationHelper.getValidations(this.config.field.settings);
    this.config.field.required = ValidationHelper.isRequired(this.config.field.settings);
  }
}
