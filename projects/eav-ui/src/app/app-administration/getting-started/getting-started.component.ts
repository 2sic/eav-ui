import { Component } from '@angular/core';
import { FeaturesService } from '../../shared/services/features.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
})
export class GettingStartedComponent {

  gettingStartedUrl!: string;

  constructor(featuresService: FeaturesService) {

    featuresService.getContext$().pipe(map(d => d.App.GettingStartedUrl)).subscribe(url => {
      this.gettingStartedUrl = url;
    });
  }

}
