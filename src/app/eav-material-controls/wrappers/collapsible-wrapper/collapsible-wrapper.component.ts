import { Component, ViewChild, ViewContainerRef, Input, OnInit, OnDestroy } from '@angular/core';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
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

  @Input() config: FieldConfig;
  group: FormGroup;
  // slotIsUsed = false;
  slotIsUsedChecked = false;
  header: EavHeader;

  private subscriptions: Subscription[] = [];


  get notes() {
    return this.config.currentFieldConfig.settings ? (this.config.currentFieldConfig.settings.Notes || '') : '';
  }

  get editInstructions() {
    return this.config.currentFieldConfig.settings ? (this.config.currentFieldConfig.settings.EditInstructions || '') : '';
  }

  get slotCanBeEmpty() {
    return this.config.itemConfig.header.group ? this.config.itemConfig.header.group.slotCanBeEmpty || false : false;
  }

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    if (this.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.itemConfig.entityId, this.config.itemConfig.entityGuid).subscribe(header => {
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
      this.itemService.updateItemHeader(this.config.itemConfig.entityId, this.config.itemConfig.entityGuid, updateHeader);
    } else { // if header group undefined create empty group object
      this.itemService.updateItemHeader(this.config.itemConfig.entityId, this.config.itemConfig.entityGuid,
        { ...this.header, group: new EavGroupAssignment() });
    }
  };
}
