export class TranslateGroupMenuHelpers {

  public static calculateShortDimensions(dimensions: string[], currentLanguage: string): string[] {
    const dimensionsTemp: Map<string, string[]> = new Map();
    const currentLanguageFirstLetters = currentLanguage.slice(0, currentLanguage.indexOf('-'));

    dimensionsTemp[currentLanguageFirstLetters] = [];
    dimensionsTemp[currentLanguageFirstLetters].push(currentLanguageFirstLetters);

    dimensions.forEach(dimension => {
      const firstLetters = dimension.slice(0, dimension.indexOf('-'));

      if (!dimensionsTemp[firstLetters]) {
        dimensionsTemp[firstLetters] = [];
        dimensionsTemp[firstLetters].push(dimension);
      } else {
        dimensionsTemp[firstLetters].push(dimension);
      }
    });

    dimensions = dimensions.map(dimension => {
      const firstLetters = dimension.slice(0, dimension.indexOf('-'));

      if (dimensionsTemp[firstLetters].length > 1) {
        return dimension;
      } else {
        return firstLetters;
      }
    });

    return dimensions;
  }

}
