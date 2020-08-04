import { Component, OnInit, ViewContainerRef, ViewChild, AfterViewInit, ElementRef, OnDestroy, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { AdamItem } from '../../../../edit-types';
import { DropzoneDraggingHelper } from '../../../shared/services/dropzone-dragging.helper';
import { EditRoutingService } from '../../../shared/services/expandable-field.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { EavService } from '../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-hyperlink-library-expandable-wrapper',
  templateUrl: './hyperlink-library-expandable-wrapper.component.html',
  styleUrls: ['./hyperlink-library-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:max-line-length
export class HyperlinkLibraryExpandableWrapperComponent extends BaseComponent<null> implements FieldWrapper, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('backdrop') backdropRef: ElementRef;
  @ViewChild('dialog') dialogRef: ElementRef;

  open$: Observable<boolean>;
  adamItems$ = new BehaviorSubject<AdamItem[]>([]);
  private dropzoneDraggingHelper: DropzoneDraggingHelper;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private zone: NgZone,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.open$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
  }

  ngOnDestroy() {
    this.dropzoneDraggingHelper.detach();
    this.adamItems$.complete();
    super.ngOnDestroy();
  }

  ngAfterViewInit() {
    this.dropzoneDraggingHelper = new DropzoneDraggingHelper(this.zone);
    this.dropzoneDraggingHelper.attach(this.backdropRef.nativeElement);
    this.dropzoneDraggingHelper.attach(this.dialogRef.nativeElement);
    this.subscription.add(this.config.adam.items$.subscribe(items => {
      this.adamItems$.next(items);
    }));
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  trackByFn(index: number, item: AdamItem) {
    return item.Id;
  }

  expandDialog() {
    if (this.config.field.disabled) { return; }
    this.editRoutingService.expand(true, this.config.field.index, this.config.entity.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.field.index, this.config.entity.entityGuid);
  }
}
