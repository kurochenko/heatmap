
function init() {
    var map;
    // map center
    var myLatlng = new google.maps.LatLng(49.7500, 15.7500);
    // map options,
    var myOptions = {
        zoom: 7,
        center: myLatlng
    };
    // standard map
    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

    initStopsMap(map);
}

function getStopsUrl(trlon, trlat, bllon, bllat) {
    var stopsUrl = "https://135ka7155h.execute-api.eu-west-1.amazonaws.com/prod/stops?trlon=" + trlon + "&trlat=" + trlat + "&bllon=" + bllon + "&bllat=" + bllat + "";
    console.log(stopsUrl);
    return stopsUrl;
}

function fetchStopsData(done) {
    $.get(getStopsUrl(18.55, 50.96, 12.15, 48.6), done); // CR
    // $.get(getStopsUrl(14.6, 50.1, 14.2, 50), done); Prague
}

function getStopsPoints(done) {
    fetchStopsData(function (res) {
        var points = {
            max: 1000,
            data: []
        };

        $(res).each(function (id, item) {
            points.data.push({
                "lat": item[0],
                "lng": item[1],
                // "count": Math.floor((Math.random() * 50) + 1)
                "count": item.arrivalCnt
            });
            // console.log(points);
        });

        // console.log(points);

        done(points);
    });
}

function initStopsMap(map) {

    var mapConfig = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": 5,
            "maxOpacity": 1,
            // scales the radius based on map zoom
            "scaleRadius": false,
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
    };
    // heatmap layer
    heatmap = new HeatmapOverlay(map, mapConfig);

    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();
        console.log('zoom: ' + zoom);
        
        if (zoom > 11) {
            mapConfig.radius = zoom + 2;    
        } else {
            mapConfig.radius = zoom;
        }
        
        heatmap.update();   
        
        console.log('radius: ' + heatmap.cfg.radius);
    });

    getStopsPoints(function (data) {
        heatmap.setData(data);
    });
}

