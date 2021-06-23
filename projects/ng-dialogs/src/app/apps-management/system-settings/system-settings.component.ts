import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { eavConstants } from '../../shared/constants/eav.constants';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent implements OnInit {
  private siteDefaultAppId: number;

  constructor(private route: ActivatedRoute, private router: Router, private appsListService: AppsListService) { }

  ngOnInit() {
  }

  openSiteSettings() {
    if (this.siteDefaultAppId != null) {
      this.router.navigate(
        [`${this.siteDefaultAppId}/data/${eavConstants.scopes.configuration.value}`],
        { relativeTo: this.route.firstChild },
      );
    } else {
      this.appsListService.getAll().subscribe(apps => {
        const defaultApp = apps.find(app => app.Guid.toLocaleLowerCase() === 'default');
        this.siteDefaultAppId = defaultApp.Id;
        this.openSiteSettings();
      });
    }
  }

  openGlobalSettings() {
    const defaultZone = 1;
    const defaultApp = 1;
    this.router.navigate(
      [`${defaultZone}/${defaultApp}/data/${eavConstants.scopes.configuration.value}`],
      { relativeTo: this.route.firstChild },
    );
  }
}
