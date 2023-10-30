import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseSubsinkComponent } from '../../shared/components/base-subsink-component/base-subsink.component';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Field } from '../models/field.model';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';

@Component({
  selector: 'app-add-sharing-fields',
  templateUrl: './add-sharing-fields.component.html',
  styleUrls: ['./add-sharing-fields.component.scss']
})
export class AddSharingFieldsComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type'];
  displayedSelectedFieldsColumns: string[] = ['name', 'source', 'remove'];

  shareableFields$ = new BehaviorSubject<Field[]>(undefined);
  selectedFields$ = new BehaviorSubject<Field[]>(undefined);
  viewModel$: Observable<AppSharingFieldsViewModel>;

  constructor(
    private dialogRef: MatDialogRef<AddSharingFieldsComponent>,
    private contentTypesFieldsService: ContentTypesFieldsService,
  ) {
    super();
   }

  ngOnInit() {
    const shareableFields$ = this.contentTypesFieldsService.getShareableFields();
    this.viewModel$ = combineLatest([
      shareableFields$, this.selectedFields$
    ]).pipe(
      map(([shareableFields, selectedFields]) => {
        this.shareableFields$.next(shareableFields);
        return { shareableFields, selectedFields };
      })
    );
  }

  ngOnDestroy() {
    this.shareableFields$.complete();
    this.selectedFields$.complete();
    super.ngOnDestroy();
  }

  //TODO: @SDV look how to improve this
  selectField(field: Field) { 
    const selectedFields = this.selectedFields$.getValue() || [];
    const shareableFields = this.shareableFields$.getValue() || [];
    selectedFields.push(field);
    shareableFields.splice(shareableFields.indexOf(field), 1);
    this.selectedFields$.next(selectedFields);
    this.shareableFields$.next(shareableFields);
  }

  //TODO: @SDV look how to improve this
  removeField(field: Field) {
    const selectedFields = this.selectedFields$.getValue() || [];
    const shareableFields = this.shareableFields$.getValue() || [];
    shareableFields.push(field);
    selectedFields.splice(selectedFields.indexOf(field), 1);
    this.selectedFields$.next(selectedFields);
    this.shareableFields$.next(shareableFields);
  }

  save() {
    this.dialogRef.close(this.selectedFields$.getValue() || []);
  }

  closeDialog() {
    this.dialogRef.close([]);
  }
}

export interface AppSharingFieldsViewModel {
  shareableFields: Field[];
  selectedFields: Field[];
}
