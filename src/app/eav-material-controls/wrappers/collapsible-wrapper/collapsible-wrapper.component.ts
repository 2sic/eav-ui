import { Component, ViewChild, ViewContainerRef, Input, OnInit, OnDestroy } from '@angular/core';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { FieldConfigSet, FieldConfigGroup } from '../../../eav-dynamic-form/model/field-config';
import { EavGroupAssignment } from '../../../shared/models/eav/eav-group-assignment';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

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

  private subscriptions: Subscription[] = [];

  get notes() {
    return this.config.field.settings ? (this.config.field.settings.Notes || '') : '';
  }

  get editInstructions() {
    return this.config.field.settings ? (this.config.field.settings.EditInstructions || '') : '';
  }

  get slotCanBeEmpty() {
    return this.config.entity.header.group ? this.config.entity.header.group.slotCanBeEmpty || false : false;
  }

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    this.fieldConfig = this.config.field as FieldConfigGroup;
    if (this.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid).subscribe(header => {
          if (header.group) {
            this.slotIsUsedChecked = !header.group.slotIsEmpty;
          }

          this.header = { ...header };
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
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
}
