import { Directive, Input, OnInit } from '@angular/core';
import { FeaturesService } from '../../shared/services/features.service';

@Directive()
export class BaseFeatureComponent implements OnInit {
  @Input() featureNameId: string;

  public features: FeaturesService = new FeaturesService();

  featureOn: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.featureOn = this.features.isEnabled(this.featureNameId);
  }
}
