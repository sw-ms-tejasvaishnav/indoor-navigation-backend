// create the slippy map
var map = L.map('map', {
    minZoom: 4,
    maxZoom: 5,
    center: [400, 400],
    zoom: 4,
    crs: L.CRS.Simple,
});

// dimensions of the image
var w = 620,
    h = 620,
    url = 'http://localhost/indoor-navigation-backend/Map/first-floor.svg';

// calculate the edges of the image, in coordinate space
var southWest = map.unproject([0, h], map.getMaxZoom() - 1);
var northEast = map.unproject([w, 0], map.getMaxZoom() - 1);
var bounds = new L.LatLngBounds(southWest, northEast);

// add the image overlay,
// so that it covers the entire map
L.imageOverlay(url, bounds).addTo(map);

// tell leaflet that the map is exactly as big as the image
map.setMaxBounds(bounds);

//create blank jeoJson variable and add in the map
//var myLayer = L.geoJson().addTo(map);
////static data
//var geojsonFeature = {
//    "type": "Feature",
//    "properties": {
//        "name": "Coors Field",
//        "amenity": "Baseball Stadium",
//        "popupContent": "This is where the Rockies play!"
//    },
//    "geometry": {
//        "type": "MultiPoint",
//        "coordinates": [[16.1875, -2.9375], [23.6875, -2.9375]]
//    }
//};
//add static data in jeoJson variable.
//myLayer.addData(geojsonFeature);

// Initialise the FeatureGroup to store editable layers
var drawLayer = new L.FeatureGroup();
map.addLayer(drawLayer);

map.addControl(new L.Control.Draw({
    edit: {
        featureGroup: drawLayer,
        poly: {
            allowIntersection: false
        }
    },
    draw: {
        polygon: {
            allowIntersection: false,
            showArea: true
        }
    }
}));

//var options = {
//    position: 'topleft',
//    draw: {
//        polygon: {
//            allowIntersection: false, // Restricts shapes to simple polygons
//            drawError: {
//                color: '#e1e100', // Color the shape will turn when intersects
//                message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
//            },
//            shapeOptions: {
//                color: '#97009c'
//            }
//        },
//        polyline: {
//            shapeOptions: {
//                color: '#f357a1',
//                weight: 10
//            }
//        },
//        // disable toolbar item by setting it to false
//        polyline: false,
//        circle: false, // Turns off this drawing tool
//        polygon: false,
//        marker: false,
//        rectangle: false,
//    },
//    edit: {
//        featureGroup: drawLayer, //REQUIRED!!
//        remove: true
//    }
//};

// Initialise the draw control and pass it the FeatureGroup of editable layers
//var drawControl = new L.Control.Draw(options);
//map.addControl(drawControl);

//var points = [];
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;
    //if (type === 'polyline') {
    //    layer.bindPopup('A polyline!');
    //} else if (type === 'polygon') {
    //    layer.bindPopup('A polygon!');
    //} else if (type === 'marker')
    //{ layer.bindPopup('marker!'); }
    //else if (type === 'circle')
    //{ layer.bindPopup('A circle!'); }
    //else if (type === 'rectangle')
    //{ layer.bindPopup('A rectangle!'); }

    //debugger;
    //alert(layer.feature.geometry.type);
    drawLayer.addLayer(layer);
    //alert('clicked');
    //var shapes = getShapes(drawLayer);
    //alert(layer.toGeoJSON()[0]);
    if(type == 'marker')
        savePoints(layer);
});

getPointData();


var points = [];
function getPointData() {
    // Get the data for the point
    $.ajax('Map/GetPointData', {

        //data: {
        //    floorId: 0,
        //    venueGuid: 0
        //},
        type: 'GET',
        success: function (data) {
            // set point data and init
            points = data;
            initPoints();
            //manager.mapContainer.trigger('pointDataReady');
        }
        //,
        //error: function (xhr, status, error) {

        //    if (status != 'abort') {

        //        // Set error msg
        //        var errorMsg = "There was a problem getting point data. Status: " + xhr.status;
        //        var flashError = new FlashBang();
        //        flashError.msg = errorMsg;
        //        flashError.createError();

        //    }

        //}
    });

};

function initPoints() {
    drawPts = [];
    points.forEach(function (poi) {

        //if (poi.floorId == manager.floorId) {

        //    pointX = manager.getPointX(poi.x * manager.getZoom());
        //    pointY = manager.getPointY(poi.y * manager.getZoom());

        //    try {

        // Add lat/long or xy based on venue supports geocoordinates flag
        //if (manager.supportsGeographicCoordinates == true) {
        pointCoordinates = new L.LatLng(poi.location.latitude, poi.location.longitude);
        //} else {
        //    pointCoordinates = manager.map.unproject([pointX, pointY]);
        //}

        // Set icon type, either waypoint, inaccesible waypoint or POI
        var wayPointIconType = (poi.isAccessible) ? "/bundles/phunwaremaascore/img/waypoint_hover_icon.png" : "";
        //iconUrl = (poi.poiType == 0) ? wayPointIconType : manager.icon_base_url + poi.poiType + '.png';
        iconUrl = "http://lbs-prod.s3.amazonaws.com/stock_assets/icons/44.png";

        // load custom point type icon
        if (poi.poiType != 0 && poi.customIconImageUrl) {
            iconUrl = poi.customIconImageUrl;
        }

        //set type and icon
        type = (poi.poiType == 0) ? 'waypoint' : 'poi';
        icon = createPointIcon(iconUrl, type);

        // init the point click & drag events & popUp
        point = L.marker(pointCoordinates, {
            icon: icon,
            draggable: false
        }).addTo(drawLayer);

        //if (type == 'poi') {

        //    point.on("mouseover", function (e) {
        //        this.bindPopup(manager.createPointPopUp(poi), { offset: new L.Point(0, -8) }).openPopup();
        //    });

        //}
        point.on('click', onPointClick);
        //point.type = type;
        point.data = poi;
        point.id = poi.id;
        point.icon = iconUrl;
        drawPts.push(point);

        //} catch (err) {

        //    console.log(err);

        //}

    });
    // get new list of draw points
    points = drawPts;
    //// create the points list
    //manager.createPointList();

    getSegmentData();
};

function createPointIcon(iconUrl, type) {

    type = (typeof type == 'undefined') ? 'poi' : type;
    size = (type == 'poi') ? [36, 36] : [16, 16];
    anchor = (type == 'poi') ? [18, 18] : [8, 8];
    iconUrl = (iconUrl.indexOf('https') == -1) ? iconUrl.replace("http", "https") : iconUrl;

    mapIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: size,
        iconAnchor: anchor,
        permission: true//manager.enableIcons
    });

    return mapIcon;

};

/*** Point click event*/
function onPointClick() {
    //if (manager.isAddSegmentMode) {
    drawSegment(this._latlng, this);
    //} else if (!manager.isEditMode && !manager.isDeleteMode) {
    //    manager.createPointForm(this.data.id);
    //    $('.points-tab').trigger('click');
    //}
};

/*** Draw Single Segment*/
var segmentDrawPts = [];
var segmentPts = [];
var segments = []
function drawSegment(latLng, point) {
    segmentDrawPts.push(latLng);
    segmentPts.push(point);
    //if (segmentDrawPts.length == 1) {
    //    $('.leaflet-draw-tooltip-single').html('Step 2: Click on another waypoint or POI to finish drawing a segment.');
    //}
    if (segmentDrawPts.length == 2 && latLng != segmentDrawPts[0]) {
        //$('.leaflet-draw-tooltip-single').html('Step 1: Click on a waypoint or POI to start drawing a segment.');
        polyline = L.polyline(segmentDrawPts, getLineOptions(true)).addTo(drawLayer).bringToBack();
        segments.push(polyline);
        saveSegment(segmentPts, polyline);
        //changeSegmentPointsIcons(segmentPts);
        segmentPts = [];
        segmentDrawPts = [];
    }
};


/*** Get drawing options for lines*/
function getLineOptions(isDrawMode) {
    isDrawMode = (typeof isDrawMode == "undefined") ? false : isDrawMode;
    options = {
        stroke: true,
        color: ((isDrawMode) ? "#000" : "#0494de"),
        permission: true//manager.enableIcons
    };
    return options;

};

/**
     * Save Segment
     */
 function saveSegment(points, polyLine) {
    //manager = this;

    //// Stop any existing request
    //if (manager.currentXHR) {
    //    manager.currentXHR.abort();
    //}

    // Get the data for the reach report
     $.ajax('Map/SaveSegment', {
        type: 'POST',
        data: {
            startPointId: points[0].data.Id,
            endPointId: points[1].data.Id,
            floorId: 0,//manager.floor[0].id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            //venueGuid: 0//manager.venueGuid
            externalId: 0
        },
        success: function (data) {
            //$(polyLine).on('click', manager.onSegmentClick);
            //polyLine.segmentId = data[data.length - 1].id;
            //manager.removeAllSegments();
            //manager.segments = data;
            //manager.initSegments();

        }
        // ,
        //error: function (xhr, status, error) {

        //    if (status != 'abort') {

        //        // Set error msg
        //        var errorMsg = "There was a problem saving segment data. Status: " + xhr.status;
        //        var flashError = new FlashBang();
        //        flashError.msg = errorMsg;
        //        flashError.createError();

        //    }

        //}
    });

};

/**
    * Draw All Segments
    */
function initSegments() {
    drawPts = [];
    drawSegmentPts = [];
    drawSegments = [];
    //manager.rawSegments = manager.segments;
    segments.forEach(function (segment) {

        try {

            var isAccessible = 0;
            // get start pt
            points.forEach(function (point) {
                if (point.data.Id == segment.startPointId) {
                    if (point.data.isAccessible == true) isAccessible++;
                    drawPts.push(point._latlng);
                    drawSegmentPts.push(point);
                }
            });

            // get end pt
            points.forEach(function (point) {
                if (point.data.Id == segment.endPointId) {
                    if (point.data.isAccessible == true) isAccessible++;
                    drawPts.push(point._latlng);
                    drawSegmentPts.push(point);
                }
            });

            // draw segment
            if (drawPts.length == 2) {
                if (isAccessible != 2) {
                    polyline = L.polyline(drawPts, getAccessibleLineOptions()).addTo(map).bringToBack();
                } else {
                    polyline = L.polyline(drawPts, getLineOptions(false)).addTo(map).bringToBack();
                }
                polyline.data = segment;
                polyline.type = 'segment';
                polyline.segmentId = segment.SegmentId;
                //polyline.on('click', manager.onSegmentClick);
                drawSegments.push(polyline);
                //manager.changeSegmentPointsIcons(drawSegmentPts);
                drawPts = [];
                drawSegmentPts = [];
            } else {
                drawPts = [];
                drawSegmentPts = [];
            }

        } catch (e) {

        }

    });

    segments = drawSegments;

};

/*** Change icon image for points in a segment*/
//function changeSegmentPointsIcons (points) {
//    points.forEach(function (point) {
//        var iconType = (point.data.isAccessible == true) ? "/bundles/phunwaremaascore/img/waypoint_segment_icon.png" : "";
//        var icon = createPointIcon(iconType, 'waypoint');
//        if (point.type == "waypoint") point.setIcon(icon);
//    });
//};

/**
     * Get drawing options for dashed inaccessible route lines
     */
function getAccessibleLineOptions() {

    isDrawMode = (typeof isDrawMode == "undefined") ? false : isDrawMode;

    options = {
        dashArray: "2, 10",
        color: ((isDrawMode) ? "#000" : "#0494de")
    };

    return options;

};

/**
     * Click handler for segments, used for removing
     */
//function onSegmentClick() {

//    if (manager.isDeleteMode) {
//        manager.segmentsToDelete.push(e.target);
//        $(e.target._container).hide();
//    }

//};

///*** Click handler for segments, used for removing*/
//function onSegmentClick (e) {
//    if (manager.isDeleteMode) {
//        manager.segmentsToDelete.push(e.target);
//        $(e.target._container).hide();
//    }
//};

//var getShapes = function (drawnItems) {
//    var shapes = [];
//    drawnItems.eachLayer(function (layer) {
//        // Note: Rectangle extends Polygon. Polygon extends Polyline.
//        // Therefore, all of them are instances of Polyline
//        if (layer instanceof L.Polyline) {
//            shapes.push(layer.getLatLngs())
//        }

//        if (layer instanceof L.Circle) {
//            shapes.push([layer.getLatLng()])
//        }

//        if (layer instanceof L.Marker) {
//            shapes.push([layer.getLatLng()]);
//        }

//    });
//    //debugger;
//    return shapes;
//};

function savePoints(layer) {
    var mapData = {
        annotation: '',
        buildingId: 0,
        category: '',
        createdAt: new Date(),
        customIconImageUrl: '',
        description: '',
        externalId: 0,
        floorId: 0,
        imageUrl: '',
        isAccessible: true,
        isActive: true,
        isExit: false,
        level: 0,
        latitude: layer.getLatLng().lat,
        longitude: layer.getLatLng().lng,
        maxZoomLevel: -1,
        name: '',
        poiType: 0,
        portalId: 0,
        updatedAt: new Date(),
        x: 0,
        y: 0,
        zoomLevel: -1
    };
    //$.post("Map/SaveToDb", mapData, function (data) {

    //})
    $.ajax('Map/SavePoints', {
        type: 'POST',
        data: mapData,
        success: function (data) {
            // Reset points using data returned
            //manager.removeAllPoints();
            //manager.points = data;
            //manager.initPoints();
            //manager.map.removeLayer(layer);

            // Refresh segments
            //manager.refreshSegments();
        },
        error: function (xhr) {
            // Set error msg
            //var errorMsg = "There was a problem saving waypoint data. Status: " + xhr.status;
            //var flashError = new FlashBang();
            //flashError.msg = errorMsg;
            //flashError.createError();
        }
    });
}



/**
     * Get building point data
     */
function getSegmentData() {

    segments = [];

    // Get the data for the point
    $.ajax('Map/GetSegmentData', {

        //data: {
        //    floorId: manager.floorId,
        //    venueGuid: manager.venueGuid
        //},
        success: function (data) {
            // set segment data and init
            segments = data;
            initSegments();
            //manager.mapContainer.trigger('segmentDataReady');
            //manager.mapContainer.off('pointDataReady');

        }
        //,

        //error: function (xhr, status, error) {

        //    if (status != 'abort') {

        //        // Set error msg
        //        var errorMsg = "There was a problem with getting segment data. Status: " + xhr.status;
        //        var flashError = new FlashBang();
        //        flashError.msg = errorMsg;
        //        flashError.createError();

        //    }

        //}
    });

};
        //function onMapClick(e) {

        //    var mapWidth = map._container.offsetWidth;
        //    var mapHeight = map._container.offsetHeight;
        //    console.log(e.containerPoint.x * w / mapWidth);
        //    console.log(e.containerPoint.y * h / mapHeight);
        //    console.log(e);
        //}

        ////Hadnel on right click functions TODO: MOVE THIS LATER
        //map.on('contextmenu', onMapClick);
        ////L.geoJson.ajax('GeoJson/data.geojson').addTo(map);

        //document.getElementById('export').onclick = function (e) {
        //    // Extract GeoJson from featureGroup
        //    var data = drawLayer.toGeoJSON();

        //    // Stringify the GeoJson
        //    var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

        //    // Create export
        //    document.getElementById('export').setAttribute('href', 'data:' + convertedData);
        //    document.getElementById('export').setAttribute('download', 'data.geojson');
        //}

        //var jsonDrawn = '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[15.375177562236786,-2.892223011702299]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[25.250177562236786,-3.204723011702299]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[28.937677562236786,-9.7672230117023]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[26.250177562236786,-15.5797230117023]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[19.500177562236786,-20.2047230117023]}},{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[15.562677562236786,-2.767223011702299],[25.250177562236786,-3.142223011702299],[29.062677562236786,-9.6422230117023],[26.187677562236786,-15.3297230117023],[19.625177562236786,-20.0797230117023]]}}]}';

        //function getDrawnItems() {
        //    var json = new L.GeoJSON(JSON.parse(jsonDrawn), {
        //        pointToLayer: function (feature, latlng) {
        //            switch (feature.geometry.type) {
        //                case 'Polygon':
        //                    //var ii = new L.Polygon(latlng)
        //                    //ii.addTo(drawnItems);
        //                    return L.polygon(latlng);
        //                case 'LineString':
        //                    return L.polyline(latlng);
        //                case 'Point':
        //                    return L.marker(latlng);
        //                default:
        //                    return;
        //            }
        //        },
        //        onEachFeature: function (feature, layer) {
        //            layer.addTo(drawLayer);
        //        }
        //    });
        //    //drawnItems.addLayer(json);
        //};

        //getDrawnItems();



        //    function getGeoJSON() {
        //        $.getJSON("Map/GetMapData", function (data) {
        //            cartoDBPoints = L.geoJson(data, {
        //                pointToLayer: function (feature, latlng) {
        //                    var marker = L.marker(latlng);
        //                    marker.bindPopup('' + feature.properties.description + 'Submitted by ' + feature.properties.name + '');
        //                    return marker;
        //                }
        //            }).addTo(map);
        //        });
        //    };

        //getGeoJSON();

