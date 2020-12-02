import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService } from '../..';
import { PublishStatusDialogComponent } from '../../eav-material-controls/dialogs/publish-status-dialog/publish-status-dialog.component';
import { EavConfig } from '../../shared/models/eav-config';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';
import { PublishStatusService } from '../../shared/store/ngrx-data/publish-status.service';
import { FormHeaderTemplateVars } from './multi-item-edit-form-header.models';

@Component({
  selector: 'app-multi-item-edit-form-header',
  templateUrl: './multi-item-edit-form-header.component.html',
  styleUrls: ['./multi-item-edit-form-header.component.scss'],
})
export class MultiItemEditFormHeaderComponent implements OnInit {
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  eavConfig: EavConfig;
  templateVars$: Observable<FormHeaderTemplateVars>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: PublishStatusService,
    private eavService: EavService,
  ) { }

  ngOnInit() {
    this.eavConfig = this.eavService.eavConfig;
    const hasLanguages$ = this.languageService.entities$.pipe(map(languages => languages.length > 0));
    const publishMode$ = this.publishStatusService.getPublishMode$(this.eavConfig.formId);
    this.templateVars$ = combineLatest([hasLanguages$, publishMode$]).pipe(
      map(([hasLanguages, publishMode]) => {
        const templateVars: FormHeaderTemplateVars = {
          hasLanguages,
          publishMode,
        };
        return templateVars;
      }),
    );
  }

  close() {
    this.closeDialog.emit();
  }

  openPublishStatusDialog() {
    this.dialog.open(PublishStatusDialogComponent, {
      panelClass: 'c-publish-status-dialog',
      autoFocus: false,
      width: '350px',
      viewContainerRef: this.viewContainerRef,
    });
  }
}
