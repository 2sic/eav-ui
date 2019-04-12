export const template = `
<div class="custom-gps-container">
  <div class="map-info">
    <label for="lat">Lat1:</label>
    <input id="lat" type="number" />
    <span>, </span>
    <label for="lng">Lng:</label>
    <input id="lng" type="number" />
  </div>

  <div class="map-info">
    <a ng-click="showMap = !showMap" class="btn btn-default" ng-click="autoSelect">
      <span icon="map-marker">Icon-map-marker</span>
    </a>

    <!-- spm implement addressMask-->
    <a class="btn btn-default" ng-click="autoSelect()" ng-show="hasAddressMask">
      <span icon="search">Icon-search</span>
    </a>
    <span id="formatted-address"></span>
  </div>

  <div id="map" class="map-info__map"></div>
</div>
`;
