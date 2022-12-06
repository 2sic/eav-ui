import { ViewContainerRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { FeatureDetailsDialogData } from "../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.models";
import { Feature } from "../../apps-management/models/feature.model";
import { FeatureInfoDialogComponent } from "../feature-info-dialog/feature-info-dialog.component";

export function openFeatureInfo(dialog: MatDialog, viewContainerRef: ViewContainerRef, feature: Feature) {
  const data: FeatureDetailsDialogData = {
    feature
  };
  dialog.open(FeatureInfoDialogComponent, {
    autoFocus: false,
    data,
    viewContainerRef: viewContainerRef,
    width: '650px',
  });
}