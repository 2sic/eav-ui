import { Directive, Input, OnInit } from '@angular/core';
import { FeatureService } from '../../edit/shared/store/ngrx-data';

@Directive()
export class BaseFeatureComponent implements OnInit {
  @Input() featureNameId: string;

  featureOn: boolean = true;

  constructor(
    protected featureService: FeatureService,
  ) { }

  ngOnInit(): void {
    this.featureOn = this.featureService.isFeatureEnabled(this.featureNameId);
  }
}
