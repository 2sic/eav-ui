import { Route } from '@angular/router';

export const PermissionsNavigation = {

  go(targetType: number, keyType: string, key: string) {
    return `permissions/${targetType}/${keyType}/${key}`;
  },

  /**
   * The route definition for use in all routing components which can route to this dialog
   */
  route: {
    path: 'permissions/:type/:keyType/:key',
    loadChildren: () => import('./permissions.module').then(m => m.PermissionsModule),
    data: { title: 'Permission' },
  } as Route,
};
