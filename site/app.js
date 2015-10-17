var pointsStore = null;
var map;
var populationDataUrl = "https://9vlnawiu1k.execute-api.us-west-2.amazonaws.com/prod/population";

var northernmostPointLat = 51.0320;
var southernmostPointLat = 48.3306;
var westernmostPointLng = 12.0526;
var easternmostPointLng = 18.5133;

var c = 1.70;
var numberOfWidthAreas = Math.ceil(16 * c);
var numberOfHeightAreas = Math.ceil(10 * c);

var countryHeight = northernmostPointLat - southernmostPointLat;
var countryWidth = easternmostPointLng - westernmostPointLng;

var widthOfArea = countryWidth / numberOfWidthAreas;
var heightOfArea = countryHeight / numberOfHeightAreas;

function fetchPopulationData(done) {
    $.get(populationDataUrl, done);
}

function getPoints(done) {
    fetchPopulationData(function (res) {
        var points = {
            max: 1000,
            data: []
        };
        $(res).each(function (id, item) {
            var lat = Math.floor((item[0] - southernmostPointLat) / heightOfArea) * heightOfArea + (heightOfArea / 2) + southernmostPointLat;
            var lng = Math.floor((item[1] - westernmostPointLng) / widthOfArea) * widthOfArea + (widthOfArea / 2) + westernmostPointLng;
            var point = {
                "lat": lat,
                "lng": lng,
                "count": item[2] / item[3]
            };
            var existingPoint = pointExist(points, point.lat, point.lng);
            if (existingPoint !== null) {
                existingPoint.count += point.count;
            }
            else {
                points.data.push(point);
            }
        });

        done(points);
    });
}

function initMap() {
    
    if(!map) {

        // map center
        var myLatlng = new google.maps.LatLng(49.7500, 15.7500);
        // map options,
        var myOptions = {
            zoom: 6,
            center: myLatlng
        };
        // standard map
        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    }


    // heatmap layer
    heatmap = new HeatmapOverlay(map,
        {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": 0.5,
            "maxOpacity": 1,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count'
        }
    );

    if(!pointsStore)
        getPoints(function (data) {
            pointsStore = data;

            heatmap.setData(data);
        });
    else
        heatmap.setData(pointsStore);
}

function pointExist(d, lat, lng) {
    var point = null;
    d.data.forEach(function (entry) {
        if (entry.lat == lat && entry.lng == lng) {
            point = entry;
        }

    });

    return point;
}


google.maps.event.addDomListener(window, 'load', initMap);
google.maps.event.addDomListener(window, "resize", initMap);
google.maps.event.addDomListener(window, "zoom", initMap);
google.maps.event.addDomListener(window, "dragend", initMap);