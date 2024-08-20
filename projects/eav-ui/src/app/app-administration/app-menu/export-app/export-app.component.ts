import { Component, computed, HostBinding, model, OnInit, signal } from '@angular/core';
import { MatDialogActions } from '@angular/material/dialog';
import { AppInfo } from '../../models/app-info.model';
import { ExportAppService } from '../../services/export-app.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { transient } from '../../../core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-export-app',
  templateUrl: './export-app.component.html',
  styleUrls: ['./export-app.component.scss'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ExportAppComponent implements OnInit {

  private exportAppService = transient(ExportAppService);

  appInfo = signal<AppInfo>(null);

  ngOnInit() {
    this.exportAppService.getAppInfo().subscribe(appInfo => this.appInfo.set(appInfo));
  }

  // Use Signals
  includeContentGroups = model(false);
  resetAppGuid = model(false);
  assetsAdam = model(true);
  assetsSite = model(true);

  downloadUrl = computed(() => this.exportAppService.exportAppUrl()
   + `&includeContentGroups=${this.includeContentGroups()}&resetAppGuid=${this.resetAppGuid()}`
   + `&assetsAdam=${this.assetsAdam()}&assetsSite=${this.assetsSite()}`
  );

}
