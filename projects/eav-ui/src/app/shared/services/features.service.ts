import { Injectable } from '@angular/core';
import { map, ReplaySubject } from 'rxjs';
import { AppDialogConfigService } from '../../app-administration/services';
import { DialogContext } from '../models/dialog-settings.model';

@Injectable({ providedIn: 'root' })
export class FeaturesService {
  // new 2dm WIP
  // Provide context information and ensure that previously added data is always available
  private dialogContext$ = new ReplaySubject<DialogContext>(1);

  constructor() { }

  loadFromService(configService: AppDialogConfigService) {
    configService.getShared$().subscribe(ds => this.load(ds.Context));
  }

  load(dialogContext: DialogContext) {
    // new 2dm WIP
    this.dialogContext$.next(dialogContext);
  }

  // new 2dm WIP
  getAll$() {
    return this.dialogContext$.pipe(map(dc => dc?.Features));
  }

  // new 2dm WIP
  get$(featureNameId: string) {
    return this.dialogContext$.pipe(
      // tap(f => console.log('2dm', f, featureNameId)),
      map(dc => dc?.Features.find(f => f.NameId === featureNameId))
    );
  }

  // new 2dg
  getSitePrimaryApp$(){
    return this.dialogContext$.pipe(map(dc => dc?.Site.PrimaryApp));
  }

  getGlobalPrimaryApp$(){
    return this.dialogContext$.pipe(map(dc => dc?.System.PrimaryApp));
  }

  isEnabled$(nameId: string) {
    console.log('2dg', nameId)
    this.get$(nameId).pipe(map(f => f?.IsEnabled ?? false)).subscribe(d => console.log('2dg', d));
    return this.get$(nameId).pipe(map(f => f?.IsEnabled ?? false));
  }

  getContext$(){
    return this.dialogContext$;
  }



}
