import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { DevRestQueryComponent } from '../../dev-rest/query/query.component';
import { WebApi } from '../models';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { SourceService } from '../../code-editor/services/source.service';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../../core';

@Component({
  selector: 'app-web-api-rest-api',
  standalone: true,
  imports: [
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    AsyncPipe,
    DevRestQueryComponent,
    RouterOutlet,
    SxcGridModule,
  ],
  templateUrl: './web-api-rest-api.component.html',
  styleUrl: './web-api-rest-api.component.scss'
})
export class WebApiRestApiComponent {
  private sourceService = transient(SourceService);
  webApis$ = new BehaviorSubject<WebApi[]>(undefined);
  webApiTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fetchWebApis();
    this.webApiTypeForm = this.fb.group({
      webApiType: ['']
    });
  }

  fetchWebApis() {
    this.sourceService.getWebApis().subscribe((webApis: WebApi[]) => {
      this.webApis$.next(webApis);
      // When Route are reload and have some Guid in the Route
      const urlSegments = this.router.url.split('/');
      const urlPath = urlSegments[urlSegments.length - 1]
      // var encodedUrlPath = decodeURIComponent(urlPath) // not Working 2dg
      var encodedUrlPath = urlPath.replace("%252F", "/");

      const selectedContentType = webApis.find(webApi => webApi.path === encodedUrlPath);

      if (selectedContentType)
        this.webApiTypeForm.get('webApiType').setValue(selectedContentType.path);
    });
  }

  openRestApi(apiRoute: string): void {
    if (!apiRoute) return;
    this.router.navigate([encodeURIComponent(apiRoute)], { relativeTo: this.route.parent.firstChild });
  }
}
