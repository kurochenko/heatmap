var map;
var populationDataUrl = "https://9vlnawiu1k.execute-api.us-west-2.amazonaws.com/prod/population";

function fetchPopulationData(done) {
    $.get(populationDataUrl, done);
}

function getPoints(done) {
    fetchPopulationData(function (res) {
        var points = {
            max: 8,
            data: []
        };

        $(res).each(function (id, item) {
            points.data.push({
                    "lat": item[0],
                    "lng": item[1],
                    "count": item[2]
                }
            );
        });

        done(points);
    });
}

function initMap() {
    // map center
    var myLatlng = new google.maps.LatLng(49.7500, 15.7500);
    // map options,
    var myOptions = {
        zoom: 3,
        center: myLatlng
    };
    // standard map
    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

    // heatmap layer
    heatmap = new HeatmapOverlay(map,
        {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": 0.1,
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

    getPoints(function (data) {
        heatmap.setData(data);
    });
}
