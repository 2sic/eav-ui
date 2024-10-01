import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';
import { AdamBrowserComponent } from './adam-browser/adam-browser.component';
import { AdamHintComponent } from './adam-hint/adam-hint.component';

@Component({
  selector: WrappersCatalog.AdamWrapper,
  templateUrl: './adam-wrapper.component.html',
  styleUrls: ['./adam-wrapper.component.scss'],
  standalone: true,
  imports: [
    AdamBrowserComponent,
    NgClass,
    ExtendedModule,
    AdamHintComponent,
  ],
})
export class AdamWrapperComponent implements OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;
  
  open = this.editRoutingService.isExpandedSignal(this.config.index, this.config.entityGuid);

  constructor(private editRoutingService: EditRoutingService) { }

  fullscreenAdam: boolean;
  adamDisabled = this.config.adam.isDisabled;

  ngOnInit() {
    this.fullscreenAdam = this.config.inputTypeSpecs.inputType === InputTypeCatalog.HyperlinkLibrary;
  }

  openUpload() {
    this.invisibleClickableRef.nativeElement.click();
  }
}
