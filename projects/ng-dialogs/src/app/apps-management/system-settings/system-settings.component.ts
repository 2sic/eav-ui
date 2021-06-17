import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { eavConstants } from '../../shared/constants/eav.constants';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent implements OnInit {
  private defaultZone = 1;
  private defaultApp = 1;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
  }

  openSiteSettings() {
    this.router.navigate([`${this.defaultApp}/data/${eavConstants.scopes.configuration.value}`], { relativeTo: this.route.firstChild });
  }

  openGlobalSettings() {
    this.router.navigate([`${this.defaultZone}/${this.defaultApp}`], { relativeTo: this.route.firstChild });
  }
}
