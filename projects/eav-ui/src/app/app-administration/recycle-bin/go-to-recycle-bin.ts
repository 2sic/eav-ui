export class GoToRecycleBin {
  static route = 'recycle-bin';

  static featureId = 'EntityUndelete';

  static routeDefinition(part: string) {
    return {
      name: 'Recycle Bin (Beta)',
      icon: 'delete',
      svgIcon: false,
      path: `${part}-${GoToRecycleBin.route}`,
      tippy: 'Recycle Bin to undelete data',
      featureRequired: GoToRecycleBin.featureId,
    };
  }
}