var map, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: 50.075538, lng: 14.437800},
    mapTypeId: google.maps.MapTypeId.SATELLITE
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
  });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
  var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ]
  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
  heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

function getPoints() {

  var points = [];

  points = points.concat(getHeatPoint(50.0833, 14.4167, 496, 1247000)); // Prague
  points = points.concat(getHeatPoint(49.2000, 16.6167, 230.2, 378327)); // Brno
  points = points.concat(getHeatPoint(50.0386, 15.7792, 77.71, 89552)); // Pardubice

  return points;
}

function getHeatPoint(lat, lng, area, population) {
    var points = [];
    var radius = Math.sqrt(area) / 2;

    var latRightBorder = lat + kmToLat(radius);
    var lngRightBorder = lng + kmToLng(radius, latRightBorder);

    var latLeftBorder = lat - kmToLat(radius);
    var lngLeftBorder = lng - kmToLng(radius, latLeftBorder);

    for (var i = 0; i < population / 1000; i++) {
        points.push(new google.maps.LatLng(lat, lng));
        points.push(new google.maps.LatLng(latRightBorder, lngRightBorder));
        points.push(new google.maps.LatLng(latLeftBorder, lngLeftBorder));

        var latToAdd;
        var lngToAdd;

        var R1 = Math.floor((Math.random() * radius) - radius);
        if (R1 > 0) {
            latToAdd = lat + kmToLat(R1);
        }
        else {
            latToAdd = lat - kmToLat(Math.abs(R1));
        }

        var R2 = Math.floor((Math.random() * radius) - radius);
        if (R2 > 0) {
            lngToAdd = lng + kmToLng(R2);
        }
        else {
            lngToAdd = lng - kmToLng(Math.abs(R2), latToAdd);
        }

        points.push(
            new google.maps.LatLng(
                latToAdd,
                lngToAdd
            )
        );
    }

    return points;
}

function kmToLat(km) {
    return km / 110.574;
}

function kmToLng(km, lat) {
    return km / (111.320 * Math.cos(lat));
}
