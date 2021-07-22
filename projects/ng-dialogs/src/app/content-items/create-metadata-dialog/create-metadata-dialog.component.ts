import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { eavConstants } from '../../shared/constants/eav.constants';
import { MetadataFormValues, MetadataInfo, TargetTypeOption } from './create-metadata-dialog.models';
import { metadataKeyValidator } from './metadata-key.validator';

@Component({
  selector: 'app-create-metadata-dialog',
  templateUrl: './create-metadata-dialog.component.html',
  styleUrls: ['./create-metadata-dialog.component.scss']
})
export class CreateMetadataDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  eavConstants = eavConstants;
  form: FormGroup;
  targetTypeOptions: TargetTypeOption[];
  freeTextTargetType = false;
  knownTargetTypes: number[];
  keyTypeOptions: string[];

  constructor(private dialogRef: MatDialogRef<CreateMetadataDialogComponent>) { }

  ngOnInit(): void {
    this.form = new FormGroup({});
    this.form.addControl('targetType', new FormControl(eavConstants.metadata.entity.type, [Validators.required]));
    this.form.addControl('keyType', new FormControl(eavConstants.keyTypes.number, [Validators.required]));
    this.form.addControl('key', new FormControl(null, [Validators.required, metadataKeyValidator(this.form)]));

    this.targetTypeOptions = Object.values(eavConstants.metadata).map(option => ({ ...option }));
    this.knownTargetTypes = this.targetTypeOptions.map(option => option.type);
    this.keyTypeOptions = Object.values(eavConstants.keyTypes);
  }

  closeDialog(result?: MetadataInfo): void {
    this.dialogRef.close(result);
  }

  confirm(): void {
    const formValues: MetadataFormValues = this.form.getRawValue();
    // if not a known target, use the number
    const target = this.targetTypeOptions.find(option => option.type === formValues.targetType)?.target ?? formValues.targetType.toString();

    const result: MetadataInfo = {
      target,
      keyType: formValues.keyType,
      key: formValues.key.toString(),
    };
    this.closeDialog(result);
  }
}
