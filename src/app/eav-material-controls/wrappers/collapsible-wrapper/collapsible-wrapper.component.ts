import { Component, ViewChild, ViewContainerRef, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { take } from 'rxjs/operators/take';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { FieldConfigSet, FieldConfigGroup } from '../../../eav-dynamic-form/model/field-config';
import { EavGroupAssignment } from '../../../shared/models/eav/eav-group-assignment';
import { LanguageService } from '../../../shared/services/language.service';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.scss']
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;
  fieldConfig: FieldConfigGroup;
  group: FormGroup;
  // slotIsUsed = false;
  slotIsUsedChecked = false;
  header: EavHeader;
  collapse = false;
  currentLanguage$: Observable<string>;
  currentLanguage: string;
  defaultLanguage$: Observable<string>;
  defaultLanguage: string;
  description: string;

  private subscriptions: Subscription[] = [];

  get slotCanBeEmpty() {
    return this.config.entity.header.group ? this.config.entity.header.group.slotCanBeEmpty || false : false;
  }

  constructor(
    private itemService: ItemService,
    private languageService: LanguageService,
  ) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();
    this.currentLanguage$.pipe(take(1)).subscribe(currentLang => {
      this.currentLanguage = currentLang;
    });
    this.defaultLanguage$.pipe(take(1)).subscribe(defaultLang => {
      this.defaultLanguage = defaultLang;
    });
  }

  ngOnInit() {
    this.collapse = this.config.field.settings ? this.config.field.settings.DefaultCollapsed || false : false;
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.calculateDescription();
    if (this.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid).subscribe(header => {
          if (header.group) {
            this.slotIsUsedChecked = !header.group.slotIsEmpty;
          }

          this.header = { ...header };
        }),
        this.currentLanguage$.subscribe(currentLang => {
          this.currentLanguage = currentLang;
          this.calculateDescription();
        }),
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  calculateDescription() {
    if (this.fieldConfig.isParentGroup) {
      this.description = this.config.field.settings ? (this.config.field.settings.EditInstructions || '') : '';
    } else {
      this.description = this.config.field.settings ? (this.config.field.settings.Notes || '') : '';
    }
  }

  /// toggle / change if a section (slot) is in use or not (like an unused presentation)
  toggleSlotIsEmpty = function () {
    if (this.header.group) {
      const updateHeader = { ...this.header, group: { ...this.header.group, slotIsEmpty: this.slotIsUsedChecked } };
      this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid, updateHeader);
    } else { // if header group undefined create empty group object
      this.itemService.updateItemHeader(this.config.entity.entityId, this.config.entity.entityGuid,
        { ...this.header, group: new EavGroupAssignment() });
    }
  };

  changeAnchorTarget(event: MouseEvent) {
    (event.target as HTMLElement).querySelectorAll('a').forEach(anchor => anchor.target = '_blank');
  }
}
