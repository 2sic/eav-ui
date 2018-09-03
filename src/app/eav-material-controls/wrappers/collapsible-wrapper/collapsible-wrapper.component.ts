import { Component, ViewChild, ViewContainerRef, Input, OnInit } from '@angular/core';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavHeader } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { EavGroupAssignment } from '../../../shared/models/eav/eav-group-assignment';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.css']
})
export class CollapsibleWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  // slotIsUsed = false;
  slotIsEmptyChecked = false;
  header: EavHeader;
  get notes() {
    return this.config.settings ? (this.config.settings.Notes || '') : '';
  }

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    if (this.config.header.group.slotCanBeEmpty) {
      this.itemService.selectHeaderByEntityId(this.config.entityId, this.config.entityGuid).subscribe(header => {
        if (header.group) {
          this.slotIsEmptyChecked = header.group.slotIsEmpty;
        }
        // else {
        //   this.itemService.updateItemHeader(this.config.entityId, this.config.entityGuid,
        //     { ...this.header, group: {} });
        // }
        this.header = { ...header };
      });
    }
  }

  /// toggle / change if a section (slot) is in use or not (like an unused presentation)
  toggleSlotIsEmpty = function () {
    // TODO: finish empty group
    // if (!header.group) {
    //   header.group = {};
    // }
    const updateHeader = { ...this.header, group: { ...this.header.group, slotIsEmpty: !this.slotIsEmptyChecked } };
    this.itemService.updateItemHeader(this.config.entityId, this.config.entityGuid, updateHeader);
  };
}
