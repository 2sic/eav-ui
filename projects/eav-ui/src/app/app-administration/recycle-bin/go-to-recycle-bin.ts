export class GoToRecycleBin {
  static route = 'recycle-bin';

  static routeDefinition(part: string) {
    return {
      name: 'Recycle Bin (Beta)',
      icon: 'delete',
      svgIcon: false,
      path: `${part}-${GoToRecycleBin.route}`,
      tippy: 'Recycle Bin to undelete data'
    };
  }
}