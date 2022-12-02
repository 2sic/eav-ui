import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FeatureDetailsDialogData } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.models';
import { FeatureInfoDialogComponent } from '../feature-info-dialog/feature-info-dialog.component';

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.scss']
})
export class FeatureIconComponent implements OnInit {
  @Input() featureName: string;
  // @Input() featureName: string;

  isFeatureActivated: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit(): void {
  }

  openFeatureInfo() {
    // this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
    // this.router.navigate(['features/NoSponsoredByToSic'], { relativeTo: this.route });
    // const data: FeatureDetailsDialogData = {
    //   feature,
    // };
    this.dialog.open(FeatureInfoDialogComponent, {
      autoFocus: false,
      // data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
  }

}
