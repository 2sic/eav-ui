import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { transient } from "projects/core";
import { FeatureDetailsDialogComponent } from "../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.component";
import { ClipboardService } from "../../shared/services/clipboard.service";
import { FeatureDetailService } from "../services/feature-detail.service";

@Component({
  selector: 'app-feature-info-dialog',
  templateUrl: './feature-info-dialog.component.html',
  standalone: true,
  imports: [
    FeatureDetailsDialogComponent
  ]
})
export class FeatureInfoDialogComponent {
  #featureDetailSvc = transient(FeatureDetailService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: string,
    protected dialog: MatDialogRef<FeatureInfoDialogComponent>,
  ) { }

  protected featureDetails = this.#featureDetailSvc.getFeatureDetailsSig(this.dialogData);
  protected clipboard = transient(ClipboardService);
}