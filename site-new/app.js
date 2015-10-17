var map, heatmap;
var populationDataUrl = "https://9vlnawiu1k.execute-api.us-west-2.amazonaws.com/prod/population";

function fetchPopulationData(done) {
  $.get(populationDataUrl, done);
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 50.075538, lng: 14.437800},
    mapTypeId: google.maps.MapTypeId.SATELLITE
  });

  getPoints(function(data) {
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: data,
      map: map
    });
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
  heatmap.set('radius', heatmap.get('radius') ? null : 100);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

// Heatmap data: 500 Points
function getPoints(done) {
  console.log('Fetch pop data');
  fetchPopulationData(function(res) {
    var points = [];

    console.log('Create points');
    $(res).each(function(id, item) {
      console.log(item);
      for(var i = 0; i < Math.max(item[2], 10); i++) {
        points.push(new google.maps.LatLng(item[0], item[1]));
      }
    });

    console.log('Display points', points.length);
    done(points);
  });
}
