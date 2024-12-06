import { Component, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { transient } from "projects/core";
import { FeatureDetailsDialogComponent } from "../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.component";
import { ClipboardService } from "../../shared/services/clipboard.service";
import { FeatureDetailService } from "../services/feature-detail.service";

@Component({
    selector: 'app-feature-info-dialog',
    templateUrl: './feature-info-dialog.component.html',
    imports: [
        FeatureDetailsDialogComponent
    ]
})
export class FeatureInfoDialogComponent implements OnInit {
  #featureDetailSvc = transient(FeatureDetailService);
  featureId = signal<string>('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: string,
    protected dialog: MatDialogRef<FeatureInfoDialogComponent>,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.featureId.set(this.route.snapshot.data['featureId'] || this.dialogData || '');
    this.featureDetails = this.#featureDetailSvc.getFeatureDetail(this.featureId());
  }

  protected featureDetails: any;
  protected clipboard = transient(ClipboardService);
}
