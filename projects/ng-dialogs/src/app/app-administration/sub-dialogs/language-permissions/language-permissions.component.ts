import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SiteLanguage } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';

@Component({
  selector: 'app-language-permissions',
  templateUrl: './language-permissions.component.html',
  styleUrls: ['./language-permissions.component.scss'],
})
export class LanguagePermissionsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  languages$: BehaviorSubject<SiteLanguage[] | undefined>;

  constructor(
    private dialogRef: MatDialogRef<LanguagePermissionsComponent>,
    private zoneService: ZoneService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.languages$ = new BehaviorSubject<SiteLanguage[] | undefined>(undefined);
  }

  ngOnInit(): void {
    this.getLanguages();
  }

  ngOnDestroy(): void {
    this.languages$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  openPermissions(language: SiteLanguage): void {
    this.router.navigate([GoToPermissions.getUrlLanguage(language.Code)], { relativeTo: this.route });
  }

  private getLanguages(): void {
    this.zoneService.getLanguages().subscribe({
      error: () => {
        this.languages$.next(undefined);
      },
      next: (languages) => {
        this.languages$.next(languages);
      },
    });
  }
}
