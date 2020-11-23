import { Route } from '@angular/router';

export const PermissionsNavigation = {

  /**
   * The route definition for use in all routing components which can route to this dialog
   */
  route: {
    path: 'permissions/:type/:keyType/:key',
    loadChildren: () => import('./permissions.module').then(m => m.PermissionsModule),
    data: { title: 'Permission' },
  } as Route,
};
