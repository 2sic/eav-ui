import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-zone-settings',
  templateUrl: './zone-settings.component.html',
  styleUrls: ['./zone-settings.component.scss'],
})
export class ZoneSettingsComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

  openLanguages() {
    this.router.navigate(['languages'], { relativeTo: this.route.firstChild });
  }

}
