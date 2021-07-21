import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { eavConstants, EavKeyTypeKey, EavMetadataKey } from '../../shared/constants/eav.constants';
import { MetadataInfo, TargetTypeOption } from './create-metadata-dialog.models';
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
  targetTypeOptions: TargetTypeOption[] = [];
  freeTextTargetType = false;
  validTargetTypes: number[] = [];
  keyTypeOptions: string[] = [];

  constructor(private dialogRef: MatDialogRef<CreateMetadataDialogComponent>) { }

  ngOnInit() {
    this.form = new FormGroup({});
    this.form.addControl('targetType', new FormControl(eavConstants.metadata.entity.type, [Validators.required]));
    this.form.addControl('keyType', new FormControl(eavConstants.keyTypes.number, [Validators.required]));
    this.form.addControl('key', new FormControl(null, [Validators.required, metadataKeyValidator(this.form)]));

    const metadataKeys = Object.keys(eavConstants.metadata) as EavMetadataKey[];
    this.targetTypeOptions = metadataKeys.map(metaKey => {
      const option: TargetTypeOption = {
        type: eavConstants.metadata[metaKey].type,
        target: eavConstants.metadata[metaKey].target,
      };
      return option;
    });

    this.validTargetTypes = metadataKeys.map(metaKey => eavConstants.metadata[metaKey].type);

    const keyTypeKeys = Object.keys(eavConstants.keyTypes) as EavKeyTypeKey[];
    this.keyTypeOptions = keyTypeKeys.map(keyTypeKey => eavConstants.keyTypes[keyTypeKey]);
  }

  closeDialog(result?: MetadataInfo) {
    this.dialogRef.close(result);
  }

  confirm() {
    const formValues = this.form.getRawValue();
    let target: string;
    const metadataKeys = Object.keys(eavConstants.metadata) as EavMetadataKey[];
    for (const metaKey of metadataKeys) {
      if (formValues.targetType !== eavConstants.metadata[metaKey].type) { continue; }
      target = eavConstants.metadata[metaKey].target;
      break;
    }
    target ??= formValues.targetType?.toString(); // if not a known type, just use the number

    const result: MetadataInfo = {
      target,
      keyType: formValues.keyType,
      key: formValues.key,
    };
    this.closeDialog(result);
  }
}
