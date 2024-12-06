import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, share, startWith, switchMap } from 'rxjs';
import { AllScenarios, DevRestBaseModel, Scenario } from '.';
import { transient } from '../../../../core';
import { DialogSettings } from '../app-administration/models';
import { DialogConfigAppService } from '../app-administration/services/dialog-config-app.service';
import { Permission, PermissionsService } from '../permissions';
import { eavConstants } from '../shared/constants/eav.constants';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { Context } from '../shared/services/context';

@Component({
    selector: 'app-dev-rest-base',
    template: '',
    standalone: false
})
// tslint:disable-next-line:component-class-suffix
export class DevRestBase<ViewModelType> implements OnDestroy {

  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  /** Template variables for the HTML template */
  protected viewModel$: Observable<ViewModelType>;

  /** List of scenarios */
  scenarios = AllScenarios;

  /** Currently selected scenario */
  scenario$ = new BehaviorSubject<Scenario>(AllScenarios[0]);

  permissions$: Observable<Permission[]>;
  dialogSettings$: Observable<DialogSettings>;

  // Shared Constructor for things all the Dev-REST things will need
  constructor(
    /** Context for this dialog. Used for appId, zoneId, tabId, etc. */
    private context: Context,
    private dialog: MatDialogRef<any>,
    /** sxc-angular context. Used to resolve urls */
    private dnnContext: DnnContext,
    protected router: Router,
    protected route: ActivatedRoute,
    private permissionsService: PermissionsService,
  ) {
    // Build Dialog Settings Stream
    // Note: this is probably already loaded somewhere, so I'm not sure why we're getting it again
    this.dialogSettings$ = this.#dialogConfigSvc.getCurrent$();
  }

  buildPermissionStream(routeTargetName: string) {
    // Build Permissions Stream
    // This is triggered on start and everything a sub-dialog closes
    return combineLatest([
      // fire on Start and when sub-dialog closes
      this.#dialogRouter.childDialogClosed$().pipe(startWith([])),
      this.route.paramMap.pipe(map(pm => pm.get(routeTargetName))),
    ]).pipe(
      switchMap(([_, permissionTarget]) => {
        // Permissions are always GUID based, so in this edge-case Content Types also pretend to be Entities
        // It's not ideal, but it can't be changed with reasonable effort, so leave this as is
        return this.permissionsService.getAll(
          eavConstants.metadata.entity.targetType,
          eavConstants.metadata.entity.keyType,
          permissionTarget,
        );
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

  buildBaseViewModel(name: string, identity: string, diag: DialogSettings, permissions: Permission[], root: string,
    scenario: Scenario): DevRestBaseModel {
    return {
      apiCalls: null,
      name,
      currentScenario: scenario,
      folder: encodeURI(diag.Context.App.Folder),
      moduleId: this.context.moduleId,
      root,
      scenario,
      permissions,
      permissionsHasAnonymous: permissions?.filter(p => p.Condition.indexOf('.Anonymous') > 0).length > 0,
      permissionTarget: identity,
    };
  }

  changeScenario(scenario: Scenario) {
    this.scenario$.next(scenario);
  }

  ngOnDestroy() {
    this.scenario$.complete();
  }

  closeDialog() {
    this.dialog.close();
  }

}
