import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { FileTypeService } from '../../../shared/services/file-type.service';
import { AdamItem } from '../../../../edit-types';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-hyperlink-library-expandable-wrapper',
  templateUrl: './hyperlink-library-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-library-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation]
})
export class HyperlinkLibraryExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') backdropRef: ElementRef;
  @ViewChild('dialog') dialogRef: ElementRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  dialogIsOpen = false;
  control: AbstractControl;
  private subscription = new Subscription();
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  get bottomPixels() { return window.innerWidth > 600 ? '100px' : '50px'; }

  constructor(
    private fileTypeService: FileTypeService,
    private zone: NgZone,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.subscription.add(this.expandableFieldService.getObservable().subscribe(expandedFieldId => {
      const dialogShouldBeOpen = (this.config.field.index === expandedFieldId);
      if (dialogShouldBeOpen === this.dialogIsOpen) { return; }
      this.dialogIsOpen = dialogShouldBeOpen;
    }));
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
  }

  trackByFn(index: number, item: AdamItem) {
    return item.Id;
  }

  isKnownType(item: AdamItem) {
    return this.fileTypeService.isKnownType(item.Name);
  }

  icon(item: AdamItem) {
    return this.fileTypeService.getIconClass(item.Name);
  }

  expandDialog() {
    if (this.config.field.disabled) { return; }
    angularConsoleLog('HyperlinkLibraryExpandableWrapperComponent expandDialog');
    this.expandableFieldService.expand(true, this.config.field.index, this.config.form.formId);
  }

  closeDialog() {
    angularConsoleLog('HyperlinkLibraryExpandableWrapperComponent closeDialog');
    this.expandableFieldService.expand(false, this.config.field.index, this.config.form.formId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.dropzoneDraggingHelper.detach();
  }
}
