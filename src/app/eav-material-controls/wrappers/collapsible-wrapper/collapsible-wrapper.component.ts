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
    return this.config.entity.header.group ? this.config.entity.header.group.slotCanBeEmpty || false : false;
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
        if (this.fieldConfig.isParentGroup) { this.calculateItemName(); }
        this.calculateDescription();
      }),
    );
    if (this.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid).subscribe(header => {
          if (header.group) { this.slotIsUsedChecked = !header.group.slotIsEmpty; }
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
          label = type.attributes.Label.values.find(value => !!value.dimensions.find(dimension =>
            dimension.value === '*' || dimension.value === this.currentLanguage || dimension.value === `~${this.currentLanguage}`)).value;
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
    if (this.header.group) {
      const updateHeader = { ...this.header, group: { ...this.header.group, slotIsEmpty: this.slotIsUsedChecked } };
      this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid, updateHeader);
    } else { // if header group undefined create empty group object
      this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid,
        { ...this.header, group: new EavGroupAssignment() });
    }
  }

  changeAnchorTarget(event: MouseEvent) {
    const links = (event.target as HTMLElement).querySelectorAll('a');
    if (links.length > 0) { return; }
    links.forEach(anchor => anchor.target = '_blank');
  }
}
