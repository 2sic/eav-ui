import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription, Observable, combineLatest } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { AllScenarios, DevRestBaseTemplateVars, fireOnStartAndWhenSubDialogCloses, Scenario } from '.';
import { DialogSettings } from '../app-administration/models';
import { AppDialogConfigService } from '../app-administration/services';
import { Permission, PermissionsService } from '../permissions';
import { eavConstants } from '../shared/constants/eav.constants';
import { Context } from '../shared/services/context';

@Component({
  selector: 'app-dev-rest-base',
  template: ''
})
export class DevRestBase implements OnDestroy {
  /** Subscription Sink */
  subscription = new Subscription();

  /** List of scenarios */
  scenarios = AllScenarios;

  /** Currently selected scenario */
  scenario$ = new BehaviorSubject<Scenario>(AllScenarios[0]);

  permissions$: Observable<Permission[]>;
  dialogSettings$: Observable<DialogSettings>;

  // Shared Constructor for things all the Dev-REST things will need
  constructor(
    appDialogConfigService: AppDialogConfigService,
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    private context: Context,
    private dialogRef: MatDialogRef<any>,
    /** dnn-sxc-angular context. Used to resolve urls */
    private dnnContext: DnnContext,
    private router: Router,
    private route: ActivatedRoute,
    private permissionsService: PermissionsService,
  ) {

    // Build Dialog Settings Stream
    // Note: this is probably already loaded somewhere, so I'm not sure why we're getting it again
    this.dialogSettings$ = appDialogConfigService.getDialogSettings().pipe(share());

  }

  buildPermissionStream(routeTargetName: string) {
    // Build Permissions Stream
    // This is triggered on start and everything a sub-dialog closes
    return combineLatest([
      fireOnStartAndWhenSubDialogCloses(this.router, this.route),
      this.route.paramMap.pipe(map(pm => pm.get(routeTargetName))),
    ]).pipe(
      switchMap(([_, permissionTarget]) => {
        // TODO: 2dm - something looks wrong here, we're getting Entity-metadata for content-type!
        return this.permissionsService.getAll(eavConstants.metadata.entity.type, eavConstants.keyTypes.guid, permissionTarget);
      }),
      share()
    );
  }


  rootBasedOnScenario(root: string, scenario: Scenario): string {
    const domainPrefix = document.location.protocol + '//' + document.location.host;
    return scenario.useVirtual
      ? root
      : (scenario.inSameSite ? '' : domainPrefix) + this.dnnContext.$2sxc.http.apiUrl(root);
  }

  buildBaseTemplateVars(name: string, diag: DialogSettings, permissions: Permission[], root: string, scenario: Scenario): DevRestBaseTemplateVars {
    return {
      apiCalls: null,
      name,
      currentScenario: scenario,
      folder: encodeURI(diag.Context.App.Folder),
      moduleId: this.context.moduleId,
      root,
      scenario,
      permissions,
      permissionsHasAnonymous: permissions.filter(p => p.Condition.indexOf('.Anonymous') > 0).length > 0,
    }
  }

  changeScenario(scenario: Scenario) {
    this.scenario$.next(scenario);
  }

  ngOnDestroy() {
    this.scenario$.complete();
    this.subscription.unsubscribe();
  }


  closeDialog() {
    this.dialogRef.close();
  }

}
