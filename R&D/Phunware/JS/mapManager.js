/**
 * Constructor
 */
function MapManager(data) {

    this.data = data;
    this.map = '';
    this.mapWidth = '';
    this.mapHeight = '';
    this.mapContainerWidth = '';
    this.mapContainerHeight = '';
    this.rawPoints = [];
    this.points = [];
    this.buildingPts = [];
    this.pointsToDelete = [];
    this.segments = [];
    this.rawSegments = [];
    this.segmentsToDelete = [];
    this.segmentDrawPts = [];
    this.segmentPts = [];
    this.selectedRoute = 0;
    this.multiFloorRoutePts = null;
    this.routes = [];
    this.zones = [];
    this.zonesToDelete = [];
    this.zoneMapId = '';
    this.mapName = '';
    this.floor = '';
    this.floorId = '';
    this.floorNames = [];
    this.level = '';
    this.venueGuid = data.venueGuid;
    this.buildingId = data.map.id;
    this.icon_base_url = data.phunware_maas_lbs_stock_icon_asset_base_url;
    this.defaultIcon = '/bundles/phunwaremaascore/img/poi_cursor.png';
    this.pointIcon = '/bundles/phunwaremaascore/img/waypoint_icon.png';
    this.wayPointIcon = '/bundles/phunwaremaascore/img/waypoint_hover_icon.png';
    this.wayPointSegmentIcon = '/bundles/phunwaremaascore/img/waypoint_segment_icon.png';
    this.wayPointInAccessibleSegmentIcon = '/bundles/phunwaremaascore/img/waypoint_inaccessible_segment_icon.png';
    this.wayPointInAccessibleAddSegmentIcon = '/bundles/phunwaremaascore/img/waypoint_inaccessible_add_segment_icon.png';
    this.wayPointInAccessibleConnectedSegmentIcon = '/bundles/phunwaremaascore/img/waypoint_inaccessible_connected_segment_icon.png';
    this.isAddPointMode = false;
    this.isAddSegmentMode = false;
    this.isAddZoneMode = false;
    this.isZoneAdded = false;
    this.isPointAdded = false;
    this.isPointChanged = false;
    this.isEditMode = false;
    this.isDeleteMode = false;
    this.isUpdated = false;
    this.drawLayer = '';
    this.drawControl = '';
    this.mapContainer = $('#map-container');
    this.mapOverlayLayer = '';
    this.overlayState = '';
    this.currentXHR = '';
    this.zoomLevel = 1;
    this.svgUrl = '';
    this.svgWidth = '';
    this.svgHeight = '';
    this.tileUrl = data.tileUrl;
    this.supportsGeographicCoordinates = data.supportsGeographicCoordinates;
    this.mapReferencePts  = null;
    this.isMapSet  = false;
    this.checkRouteInterval = null;
    this.hasRouteDeeplink = false;
    this.enableIcons = data.enableIcons
}
MapManager.confirmLeavingPrompt = 'You are currently editing the map. Are you sure you want to leave the page without saving your changes?';

$(function() {

    /* ==========================================================================
     MAP
     ========================================================================== */

    /**
     * Initialize the map with floors and points data
     */
    MapManager.prototype.init = function(floorId, routePts) {

        manager = this;

        // clear out data
        manager.points = [];
        manager.segments = [];
        manager.segmentPts = [];
        manager.floor = '';
        manager.routes = [];
        manager.drawControl = '';
        manager.removeAllRoutes();

        // reset forms for zone and points if open
        if ($('#zone-list-container').css('display', 'block')) $('#add-zone-back').trigger('click');
        if ($('#point-list-container').css('display', 'block')) $('#add-point-back').trigger('click');

        // store manager & add container
        window.mapManager = this;
        manager.mapContainer.append('<div id="map"></div>');
        manager.overlayState = ($('#map-overlay').css('right') == '-350px') ? 'closed' : 'open';
        data = this.data.map;

        // configure floors, throw error if there isn't valid floor data
        if (data.floors.length > 0) {

            floors = data.floors;
            firstFloor = floors[0].id;
            level = floors[0].level;

            // check floorId & set default if undefined
            floorId = typeof floorId != 'undefined' ? floorId : firstFloor;
            manager.floorId = floorId;

        } else {

            var errorMsg = "This building doesn't have valid floor data.";
            var flashError = new FlashBang();
            flashError.msg = errorMsg;
            flashError.createError();
            return;

        }

        // reset the map if it's already been initialized
        if (typeof manager.map == "object") {
            manager.resetMap();
        }

        // find the floor
        manager.floor = $.grep(data.floors, function(floor) {
            return floor.id == floorId;
        });

        // assign the zoom level to max zoom level
        manager.zoomLevel = manager.floor[0].maxZoomLevel;

        if (data.zoneMaps) {
            data.zoneMaps.forEach(function(map) {
                if (map.floorId == floorId) manager.zoneMapId = map.mapId;
            });
        }

        // map name
        manager.mapName = manager.floor[0].locationMapHierarchy;

        // get the map & dimensions
        manager.svgUrl = manager.getMapByZoomLevel();

        // fade out routes UI & reset
        $('#routes-info-container').hide();
        manager.resetRouteUI();

        // init map based on support of geo coordinate space
        var initMapCallBack = (this.supportsGeographicCoordinates == true && this.supportsGeographicCoordinates != null) ? this.initLatLongMap : this.initXYMap;
        $('#map').on('sizeReady', initMapCallBack);
        manager.getMapDimensions(manager.svgUrl);

        // Enable a beforeunload prompt
        this.onBeforeUnload = function(e) {
            if (manager.isEditing()) {
                // First line is for newer Webkit/Blink, normal
                // is for everything else
                e.returnValue = MapManager.confirmLeavingPrompt;
                return MapManager.confirmLeavingPrompt;
            }
        };
        window.addEventListener('beforeunload', this.onBeforeUnload);

    };

    /**
     * Resets the map leaflet instance
     */
    MapManager.prototype.resetMap = function() {

        $("#map").remove();
        this.map = '';

        // clear map interval
        if (manager.checkRouteInterval != null) {
            clearInterval(mapManager.checkRouteInterval);
            manager.checkRouteInterval = null;
        }

        // Clear beforeunload event
        window.removeEventListener('beforeunload', this.onBeforeUnload);
    };

    /* ==========================================================================
     INIT MAP WITH X,Y COORDINATE SPACE
     ========================================================================== */

    MapManager.prototype.initXYMap = function() {

        try {

            var centerH = manager.mapHeight/2;
            var centerW = manager.mapWidth/2;

            //create the map
            manager.map = L.map('map', {
                maxZoom: 23,
                minZoom: 18,
                crs: L.CRS.Simple,
                scrollWheelZoom: false
            }).setView([centerW, centerH], 20);

            // set the map bounds & view
            manager.map.setView(manager.map.unproject([centerW, centerH]), 20);
            var southWest = manager.map.unproject([0, manager.mapHeight]);
            var northEast = manager.map.unproject([manager.mapWidth, 0]);
            imageBounds = [[southWest, northEast]];

            // add the overlay to the map
            L.imageOverlay(manager.svgUrl, imageBounds).addTo(manager.map);

            // add the draw layer
            manager.drawLayer = new L.FeatureGroup();
            L.permission = manager.enableIcons;
            manager.map.addLayer(manager.drawLayer);

            // init the points data if not set already
            manager.getPointData();

            // init draw functions
            manager.initDraw();

            // get zone data
            manager.getZoneData();

            // get segment data after point data is ready only if there are no points
            manager.mapContainer.on('pointDataReady', manager.getSegmentData);

            // init routes or deeplink to route
            if (manager.buildingPts.length <= 0) {
                manager.mapContainer.on('segmentDataReady', manager.initRoutes);
            }

            // set multifloor pts
            if (manager.hasRouteDeeplink == false && manager.multiFloorRoutePts != null) {
                manager.multiFloorRoutePts = null;
            } else {
                manager.mapContainer.on('segmentDataReady', manager.deepLinktoRoute);
            }

            // toggle all layers back on
            manager.toggleZones('on');
            manager.toggleSegments('on');
            manager.toggleRoutes();
            $("#toggle-routes").prop('checked', true);
            $("#toggle-segments").prop('checked', true);
            $("#toggle-zones").prop('checked', true);

            // trigger ready evt & remove size evt
            $(manager.mapContainer).trigger('mapReady');
            $('#map').off('sizeReady');

        } catch(e) {

            console.log(e);

        }

    };

    /* ==========================================================================
     INIT MAP WITH LAT,LONG COORDINATE SPACE
     ========================================================================== */

    MapManager.prototype.initLatLongMap = function() {

        try {

            // Get reference pts from data or set default pts
            var referencePts = manager.floor[0].referencePoints.portal;
            if (referencePts != null && referencePts.topRight.latitude != 0) {
                manager.isMapSet = true;
                manager.mapReferencePts = {};
                manager.mapReferencePts.rotation = manager.floor[0].referencePoints.rotation;
                manager.mapReferencePts.bottomLeft = new L.LatLng(referencePts.bottomLeft.latitude, referencePts.bottomLeft.longitude);
                manager.mapReferencePts.topRight = new L.LatLng(referencePts.topRight.latitude, referencePts.topRight.longitude);
            } else if (manager.data.map.location.latitude && manager.data.map.location.longitude) {
                manager.isMapSet = false;
                manager.mapReferencePts = {};
                manager.mapReferencePts.bottomLeft = new L.LatLng(manager.data.map.location.latitude - .001, manager.data.map.location.longitude - .001);
                manager.mapReferencePts.topRight = new L.LatLng(manager.data.map.location.latitude + .001, manager.data.map.location.longitude + .001);
                manager.mapReferencePts.rotation = 0;

                // if there is a valid svg but the reference pts aren't set yet, prompt message
                if (manager.svgUrl) {
                    setTimeout(function(){
                        if (confirm('The reference points for this floor are not set. Would you like to set them now?')) {
                            $('#map-position-modal').modal('show')
                        }
                    }, 2000)
                }

            } else {
                var errorMsg = "Warning: neither the building nor the floor has valid lat/long reference point data.";
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();
            }

            // Set the bounds & create map
            var bounds = new L.LatLngBounds(manager.mapReferencePts.bottomLeft, manager.mapReferencePts.topRight);
            var boundsCenter = bounds.getCenter();

            manager.map = new L.Map('map', {
                center: boundsCenter,
                zoom: 17,
                minZoom: 2,
                maxZoom: 22,
                scrollWheelZoom: false,
                crs: L.CRS.EPSG3857
            });

            // make map fit to bounds
            manager.map.fitBounds(bounds);

            // set up map overlay layer
            var OverlayCanvas = L.CanvasLayer.extend({

                render: function() {

                    try {

                        // create the canvas and clear it
                        var canvas = this.getCanvas();
                        var context = canvas.getContext('2d');
                        context.clearRect(0,0, manager.svgWidth, manager.svgHeight);

                        // set up our reference points
                        var marker0 = manager.map.latLngToContainerPoint(L.latLng(mapManager.floor[0].referencePoints.topLeft.latitude, manager.floor[0].referencePoints.topLeft.longitude));
                        var marker1 = manager.map.latLngToContainerPoint(L.latLng(mapManager.floor[0].referencePoints.topRight.latitude, manager.floor[0].referencePoints.topRight.longitude));
                        var marker2 = manager.map.latLngToContainerPoint(L.latLng(mapManager.floor[0].referencePoints.bottomRight.latitude, manager.floor[0].referencePoints.bottomRight.longitude));

                        // set up our transformation
                        var m11 = (marker1.x - marker0.x) / manager.svgWidth;
                        var m12 = (marker1.y - marker0.y) / manager.svgWidth;
                        var m21 = (marker2.x - marker1.x) / manager.svgHeight;
                        var m22 = (marker2.y - marker1.y) / manager.svgHeight;
                        var dx = marker0.x;
                        var dy = marker0.y;

                        context.setTransform(
                            m11, m12,
                            m21, m22,
                            dx,  dy
                        );

                        // don't add svg map if svgurl is null but still load map editor
                        if (manager.svgUrl) {

                            // add the svg and redraw
                            base_image = new Image();
                            base_image.src = manager.svgUrl + '?v27';
                            context.drawImage(base_image, 0, 0);
                            this.redraw();

                        }

                    } catch(e) {

                        console.log(e);

                    }

                }

            });

            // add the map tiles'
            manager.tileLayer = new L.TileLayer(manager.tileUrl, {
                zIndex: 1,
                updateWhenIdle: true,
                unloadInvisibleTiles: true,
                reuseTiles: true,
                maxZoom: 22
            }).addTo(manager.map);

            // create a new overlay
            manager.overlayImage = new OverlayCanvas().addTo(manager.map);

            // add bg color to map container
            $('.leaflet-container').css('background', '#fff');

            // trigger ready evt & remove size evt
            $(manager.mapContainer).trigger('mapReady');
            $('#map').off('sizeReady');

            // zoom events
            manager.map.on('zoomstart', function(){
                $('.leaflet-custom-canvas-container').css('opacity', '0');
                manager.overlayImage.render();
            });

            manager.map.on('zoomend', function(){
                $('.leaflet-custom-canvas-container').animate({'opacity' : '1'}, 300);
                manager.overlayImage.render();
            });

            //check for safari,chrome and opera
            var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
            var isChrome = /Mozilla/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            var isOpera = /Mozilla/.test(navigator.userAgent) && /Opera/.test(navigator.vendor);

            // drag events
            manager.map.on('drag', function(){
                manager.overlayImage.render();

                // only override transform if not safari
                if (!isSafari && !isChrome && !isOpera) {
                    $('.leaflet-custom-canvas-container').css("-webkit-transform", "");
                }
            });

            // resize/reset events
            manager.map.on('viewreset', function(){
                manager.overlayImage.render();
            })

            // set zoom
            manager.map.setZoom(manager.map.getZoom());

            // init draw functions
            // add the draw layer
            manager.drawLayer = new L.FeatureGroup();
            L.permission = manager.enableIcons;
            manager.map.addLayer(manager.drawLayer);

            // init the points data if not set already
            manager.getPointData();

            // init draw functions
            manager.initDraw();

            // get zone data
            manager.getZoneData();

            // get segment data after point data is ready only if there are no points
            manager.mapContainer.on('pointDataReady', manager.getSegmentData);

            // init routes or deeplink to route
            if (manager.buildingPts.length <= 0) {
                manager.mapContainer.on('segmentDataReady', manager.initRoutes);
            }

            // set multifloor pts
            if (manager.hasRouteDeeplink == false && manager.multiFloorRoutePts != null) {
                manager.multiFloorRoutePts = null;
            } else {
                manager.mapContainer.on('segmentDataReady', manager.deepLinktoRoute);
            }

            // toggle all layers back on
            manager.toggleZones('on');
            manager.toggleSegments('on');
            manager.toggleRoutes();
            $("#toggle-segments").prop('checked', true);
            $("#toggle-zones").prop('checked', true);

            // trigger ready evt & remove size evt
            $(manager.mapContainer).trigger('mapReady');
            $('#map').off('sizeReady');

        } catch(e) {

            console.log(e);

        }

    };


    /* ==========================================================================
     DRAW CONTROLS
     ========================================================================== */

    MapManager.prototype.initDraw = function() {

        // remove draw control & add new
        if(manager.drawControl != '') {
            manager.map.removeControl(manager.drawControl);
        }

        // configure the controls
        manager.drawControl = new L.Control.Draw({
            draw: {
                polygon: false,
                rectangle: false,
                point: {
                    icon: manager.createPointIcon(manager.pointIcon, 'waypoint'),
                    repeatMode: true
                },
                inaccessibleWayPoint: {
                    icon: manager.createPointIcon(manager.wayPointInAccessibleAddSegmentIcon, 'waypoint'),
                    repeatMode: false
                },
                marker: {
                    icon: manager.createPointIcon(manager.defaultIcon),
                    repeatMode: false
                },
                circle: {
                    shapeOptions: manager.getCircleOptions(true)
                },
                polyline: {
                    repeatMode: false,
                    shapeOptions: manager.getLineOptions(true),
                    allowIntersection: false
                }
            },
            edit: {
                featureGroup: manager.drawLayer
            }
        });

        // add controls to map
        manager.map.addControl(manager.drawControl);

        // fires when items drawn on map
        manager.map.on('draw:created', function (e) {

            var type = e.layerType,
                layer = e.layer;

            if (type === 'marker') {
                point = layer;
                manager.createPointForm(null, e.layer);
                manager.points.push(point);
                manager.isPointAdded = true;
            }

            if (type == 'polyline') {
                segment = layer;
                segment.type = 'polyline';
                manager.segments.push(segment);
            }

            if (type == 'point') {
                point = layer;
                manager.saveWayPoint(point, true);
            }

            if (type == 'inaccessibleWayPoint') {
                point = layer;
                manager.saveWayPoint(point, false);
            }

            if (type == 'circle') {
                zone = layer;
                if (manager.zoneMapId != '') {
                    manager.createZoneForm(null, e.layer);
                    manager.zones.push(zone);
                    manager.isZoneAdded = true;
                } else {
                    var errorMsg = "Could not create zone, floor has no zone map associated with it and could not create one.";
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();
                    return;
                }
            }

            manager.drawLayer.addLayer(layer);

        });

        // fires when drawing starts
        manager.map.on('draw:drawstart', function(e) {

            manager.toggleRoutes();

            var type = e.layerType;
            switch (type) {
                case 'inaccessibleWayPoint':
                case 'point':
                    manager.isAddPointMode = true;
                    break;

                case 'polyline':
                    manager.isAddSegmentMode = true;
                    break;

                case 'circle':
                    manager.isAddZoneMode = true;
                    break;
            }

            // remove unsaved zone if there
            if (manager.isZoneAdded) {
                manager.removeLastZone();
                $('#add-zone-back').trigger('click');
            }

            // remove unsaved poi if there
            if (manager.isPointAdded) {
                manager.removeLastPoint();
                $('#add-point-back').trigger('click');
            }

        });

        // fires when drawing stops
        manager.map.on('draw:drawstop', function(e) {

            manager.segmentPts = [];
            manager.segmentDrawPts = [];
            var type = e.layerType;
            switch (type) {
                case 'inaccessibleWayPoint':
                case 'point':
                    manager.isAddPointMode = false;
                    break;

                case 'polyline':
                    manager.isAddSegmentMode = false;
                    break;

                case 'circle':
                    manager.isAddZoneMode = false;
                    break;
            }

        });

        // fires when editing is done
        manager.map.on('draw:edited', function(e) {

            // get list of points to save
            var savePointLayers = [];
            var saveZoneLayers = [];
            var layers = e.layers;
            layers.eachLayer(function (layer) {
                switch (layer.type) {
                    case 'poi':
                    case 'inaccessibleWayPoint':
                    case 'waypoint':
                        savePointLayers.push(layer);
                        break;

                    case 'zone':
                        saveZoneLayers.push(layer);
                        break;
                }
            });

            // save points, if cancel then revert layers
            if (savePointLayers.length > 0) {
                pointsConfirm = confirm("Are you sure you want to save these points?");
                if (pointsConfirm == true) {
                    manager.savePoints(savePointLayers);
                    manager.removeAllSegments();
                    manager.getSegmentData();
                    manager.removeAllRoutes();
                } else {
                    manager.revertLayers();
                }
            }

            // save zones
            if (saveZoneLayers.length > 0) manager.saveZones(saveZoneLayers);

        });

        // fires when something is deleted
        manager.map.on('draw:deleted', function(e) {

            var layers = e.layers;
            layers.eachLayer(function (layer) {
                switch (layer.type) {
                    case 'poi':
                    case 'inaccessibleWayPoint':
                    case 'waypoint':
                        manager.pointsToDelete.push(layer);
                        break;
                    case 'zone':
                        manager.zonesToDelete.push(layer);
                        break;
                }
            });

            // delete points & segments
            if (manager.pointsToDelete.length > 0 && manager.segmentsToDelete.length > 0) {
                manager.deletePoints();
                manager.mapContainer.on('pointsDeleted', manager.deleteSegments);
            }

            // delete points
            if (manager.pointsToDelete.length > 0 && manager.segmentsToDelete.length < 1) {
                manager.deletePoints();
            }

            // delete the segments
            if (manager.pointsToDelete.length < 1 && manager.segmentsToDelete.length  > 0) {
                manager.deleteSegments();
            }

            // delete the zones
            if (manager.zonesToDelete.length > 0) {
                manager.deleteZones();
            }

            // reset forms for zone and points
            if (manager.zonesToDelete.length > 0 && $('#zone-list-container').css('display', 'block')) {
                $('#add-zone-back').trigger('click');
            }
            if (manager.pointsToDelete.length > 0 && $('#point-list-container').css('display', 'block')) {
                $('#add-point-back').trigger('click');
            }

            // set delete mode flag
            manager.isDeleteMode = false;

        });

        // fires when editing starts, turns on all check boxes layers
        manager.map.on('draw:editstart', function() {

            manager.isEditMode = true;
            manager.toggleZones('on');
            manager.toggleSegments('on');
            manager.toggleRoutes();

            $("#toggle-segments").prop('checked', true);
            $("#toggle-zones").prop('checked', true);

            // remove unsaved zone if there
            if (manager.isZoneAdded) {
                manager.removeLastZone();
                $('#add-zone-back').trigger('click');
            }

            // remove unsaved poi if there
            if (manager.isPointAdded) {
                manager.removeLastPoint();
                $('#add-point-back').trigger('click');
            }

        });

        // fires when editing stops / also when deleting stops
        manager.map.on('draw:editstop', function() {

            // reset flags
            manager.isEditMode = false;
            manager.isDeleteMode = false;
            manager.isAddZoneMode = false;
            manager.isAddPointMode = false;

            // delete segments
            if (manager.segmentsToDelete.length > 0 && manager.isDeleteMode) {
                manager.segmentsToDelete.forEach(function(segment) {
                    $(segment._container).show();
                });
            }

            // remove unsaved zone if there
            if (manager.isZoneAdded) {
                manager.removeLastZone();
                $('#add-zone-back').trigger('click');
            }

            // remove unsaved poi if there
            if (manager.isPointAdded) {
                manager.removeLastPoint();
                $('#add-point-back').trigger('click');
            }

            manager.toggleRoutes();

        });

        // fires when delete starts
        manager.map.on('draw:deletestart', function() {
            manager.isDeleteMode = true;
            manager.toggleRoutes();
        });

    };

    /* ==========================================================================
     Points
     ========================================================================== */

    /**
     * Get building point data
     */
    MapManager.prototype.getPointData = function() {

        // Get the data for the point
        manager.currentXHR = $.ajax('/lbs/ajax/points-data.json', {

            data: {
                floorId: manager.floorId,
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                // set point data and init
                manager.points = data;
                manager.initPoints();
                manager.mapContainer.trigger('pointDataReady');

            },
            error: function(xhr, status, error) {

                if (status != 'abort') {

                    // Set error msg
                    var errorMsg = "There was a problem getting point data. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }

            }
        });

    };

    /**
     * Initialize the map points
     */
    MapManager.prototype.initPoints = function() {

        manager = this;
        manager.rawPoints = manager.points;
        drawPts = [];
        manager.points.forEach(function(poi) {

            if(poi.floorId==manager.floorId) {

                pointX = manager.getPointX(poi.x * manager.getZoom());
                pointY = manager.getPointY(poi.y * manager.getZoom());

                try{

                    // Add lat/long or xy based on venue supports geocoordinates flag
                    if (manager.supportsGeographicCoordinates == true){
                        pointCoordinates = new L.LatLng(poi.location.latitude, poi.location.longitude);
                    } else {
                        pointCoordinates = manager.map.unproject([pointX, pointY]);
                    }

                    // Set icon type, either waypoint, inaccesible waypoint or POI
                    var wayPointIconType = (poi.isAccessible) ? manager.wayPointIcon : manager.wayPointInAccessibleSegmentIcon;
                    iconUrl = (poi.poiType == 0) ? wayPointIconType : manager.icon_base_url+poi.poiType+'.png';

                    // load custom point type icon
                    if (poi.poiType !=0 && poi.customIconImageUrl) {
                        iconUrl = poi.customIconImageUrl;
                    }

                    //set type and icon
                    type = (poi.poiType==0) ? 'waypoint' : 'poi';
                    icon =  manager.createPointIcon(iconUrl, type);

                    // init the point click & drag events & popUp
                    point = L.marker(pointCoordinates, {
                        icon: icon,
                        draggable: false
                    }).addTo(manager.drawLayer);

                    if (type == 'poi') {

                        point.on("mouseover", function(e) {
                            this.bindPopup(manager.createPointPopUp(poi),{ offset: new L.Point(0, -8) }).openPopup();
                        });

                    }
                    point.on('click', manager.onPointClick);
                    point.type = type;
                    point.data = poi;
                    point.id = poi.id;
                    point.icon = iconUrl;
                    drawPts.push(point);

                }catch(err) {

                    console.log(err);

                }

            }

        });

        // get new list of draw points
        manager.points = drawPts;

        // create the points list
        manager.createPointList();

    };

    /**
     * Point click event
     */
    MapManager.prototype.onPointClick = function() {
        if (manager.isAddSegmentMode) {
            manager.drawSegment(this._latlng, this);
        } else if (!manager.isEditMode && !manager.isDeleteMode) {
            manager.createPointForm(this.data.id);
            $('.points-tab').trigger('click');
        }
    };

    /**
     * Get the Point x position relative to coord space
     */
    MapManager.prototype.getPointX = function(x) {
        return x * this.mapWidth / this.floor[0].width;
    };

    /**
     * Get the point y position relative to coord space
     */
    MapManager.prototype.getPointY = function(y) {
        return y * this.mapHeight / this.floor[0].height;
    };

    /**
     * Translate local coords back to MSE coords
     */
    MapManager.prototype.setPointX = function(x) {
        return x * this.floor[0].width / this.mapWidth;
    };

    /**
     * Translate local coords back to MSE coords
     */
    MapManager.prototype.setPointY = function(y) {
        return y * this.floor[0].height / this.mapHeight;
    };

    /**
     * Center map on point
     */
    MapManager.prototype.centerOnPoint = function(pointId, animate) {
        for (index = 0; index < this.points.length; ++index) {
            if (this.points[index].data.id == pointId) {
                var coords = this.points[index]._latlng;
                animate = (animate === undefined) ? true : animate;
                this.map.setView(coords, undefined, {doAnimate: animate});
                break;
            }
        }
    };

    /**
     * Get map by zoom level
     */
    MapManager.prototype.getMapByZoomLevel = function() {

        var svgUrl;

        if (manager.floor[0].resources) {

            for (var i in manager.floor[0].resources) {

                var resource = manager.floor[0].resources[i];

                if (resource.svgUrl && resource.svgUrl.indexOf('svg') != -1) {
                    if (resource.zoomLevel == manager.zoomLevel) {
                        svgUrl = resource.svgUrl;
                        break;
                    } else if (!svgUrl) {
                        svgUrl = resource.svgUrl;
                    }
                }
            }

        }

        if (!svgUrl) {
            return null;
        }

        return (svgUrl.indexOf('https') == -1) ? svgUrl.replace("http","https") : svgUrl;
    };

    /**
     * Create the map Point popup
     */
    MapManager.prototype.createPointPopUp = function(data) {

        popUp = L.popup({'maxHeight':'120'});
        popUp.setContent('<span class="name">' + data.name + '</span>');
        return popUp;

    };

    /**
     * Add data to point form
     */
    MapManager.prototype.addDataToPointForm = function(layer) {

        var point = manager.map.project(layer._latlng);

        $('#point_save_venueGuid').val(manager.venueGuid);
        $('#point_save_buildingId').val(manager.buildingId);
        $('#point_save_level').val(manager.floor[0].level);
        $('#point_save_floorId').val(manager.floorId);

        // Add lat long data
        if (manager.supportsGeographicCoordinates == true) {
            var latLng = manager.map.unproject(point);
            $('#point_save_latitude').val(latLng.lat);
            $('#point_save_longitude').val(latLng.lng);
            x = 0;
            y = 0;
        } else {
            x = manager.setPointX(point.x / manager.getZoom());
            y = manager.setPointY(point.y / manager.getZoom());
        }

        $('#point_save_x').val(x);
        $('#point_save_y').val(y);

    };

    /**
     * Creates and saves the points data
     */
    MapManager.prototype.createPointForm = function(pointId, layer) {

        manager = this;

        // open tab if closed
        if (manager.overlayState == 'closed') {
            $('#pull-tab').trigger('click');
            manager.overlayState = 'open';
        }

        // open tab
        $('.points-tab').trigger('click');

        // Stop any existing request
        if (manager.currentXHR) {
            manager.currentXHR.abort();
        }

        if (typeof pointId == 'undefined' || pointId == null) {
            uri = 'add';
        } else{
            uri = pointId+'/edit';
        }

        // Get the data for the point
        manager.currentXHR = $.ajax('/lbs/ajax/point/'+ uri, {
            data: {
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                if (typeof pointId == 'undefined' || pointId == null) {

                    $('#point-list-container').fadeOut('fast', function() {
                        $('#point-form-container').html(data).fadeIn();
                        manager.initPointSaveForm();
                        manager.addDataToPointForm(layer);
                    });

                } else {

                    $('#point-list-container').fadeOut('fast', function() {
                        $('#point-form-container').html(data).fadeIn();
                        manager.initPointSaveForm();
                        $('#container_save_venueGuid').val(manager.venueGuid);
                    });

                }

            },
            error: function(xhr, status, error) {

                if (status != 'abort') {

                    // Set error msg
                    var errorMsg = "There was a problem initializing the point data form. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }

            }
        });
    };

    /**
     * Create the point form
     */
    MapManager.prototype.initPointSaveForm = function() {

        // Add form 'submit' event listener
        $('#point-form').on('submit', function(e) {

            e.preventDefault();

            // Get the form data
            var url = $(this).attr('action');
            var data = $(this).serializeArray();

            // Save the data
            $.ajax(url, {

                files: $(":file", this),
                iframe: true,
                processData: false,
                contentType: false,
                type: 'post',
                data: data,

                success: function(data) {

                    if(data.ok == false){

                        var errorMsg = data.message;
                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();
                    } else {
                        manager.isPointChanged = true;
                        $('#add-point-back').trigger('click');
                    }

                    // Refresh segments
                    manager.refreshSegments();

                },

                error: function(xhr) {

                    // Set error msg
                    if (xhr.status == 400) {

                        var data = jQuery.parseJSON(xhr.responseText);
                        var errorMsg = '';
                        data.errors.forEach(function(error){
                            for(i in error) {
                                errorMsg += 'Field "' + i + '" has an error: ' + error[i] + '<br/>';
                            }
                        });

                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();

                    } else if (xhr.status == 200) {

                        manager.isPointChanged = true;
                        $('#add-point-back').trigger('click');

                    } else {

                        var errorMsg = "There was a problem saving point data. Status: " + xhr.status;
                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();

                    }

                }
            });

        });

    };

    /**
     * Save waypoint
     */
    MapManager.prototype.saveWayPoint = function(layer, isAccessible) {

        point = manager.map.project(layer._latlng);

        var data = {};
        data.requestType = 'wayPoint';
        data.isActive = true;
        data.zoomLevel = -1;
        data.maxZoomLevel = -1;
        data.floorId = manager.floorId;
        data.level = manager.floor[0].level;
        data.buildingId = manager.buildingId;
        data.isAccessible = isAccessible;
        // Add lat long data
        if (manager.supportsGeographicCoordinates == true) {
            var latLng = manager.map.unproject(point);
            data.x = 0;
            data.y = 0;
            data.latitude = latLng.lat;
            data.longitude = latLng.lng;
        } else {
            data.x = manager.setPointX(point.x / manager.getZoom());
            data.y = manager.setPointY(point.y / manager.getZoom());
        }
        data.venueGuid = manager.venueGuid;
        // Save the data
        $.ajax('/lbs/ajax/waypoint/add', {
            type: 'POST',
            data: data,
            venueGuid: manager.venueGuid,
            success: function(data) {

                // Reset points using data returned
                manager.removeAllPoints();
                manager.points = data;
                manager.initPoints();
                manager.map.removeLayer(layer);

                // Refresh segments
                manager.refreshSegments();

            },
            error: function(xhr) {

                // Set error msg
                var errorMsg = "There was a problem saving waypoint data. Status: "+xhr.status;
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

            }
        });

    };

    /**
     * Save multiple points
     */
    MapManager.prototype.savePoints = function(points) {

        pointsData = [];
        points.forEach(function(point) {
            coords = manager.map.project(point._latlng);
            pointObj = {};
            pointObj.id = point.data.id;
            pointObj.floorId = manager.floorId;
            pointObj.level = manager.floor[0].level;
            pointObj.buildingId = manager.buildingId;
            pointObj.isAccessible = point.data.isAccessible;

            // Add lat long data
            if (manager.supportsGeographicCoordinates == true) {
                var latLng = manager.map.unproject(coords);
                pointObj.latitude = latLng.lat;
                pointObj.longitude = latLng.lng;
                pointObj.x = 0;
                pointObj.y = 0;
            } else {
                pointObj.x = manager.setPointX(coords.x / manager.getZoom());
                pointObj.y = manager.setPointY(coords.y / manager.getZoom());
            }
            pointsData.push(pointObj);
        });

        // Save the data
        $.ajax('/lbs/ajax/points/edit', {
            type: 'POST',
            data: {
                points: pointsData,
                floorId: manager.floorId,
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                // Reset points using data returned
                manager.removeAllPoints();
                manager.points = data;
                manager.initPoints();

                // Refresh segments
                manager.refreshSegments()

            },

            error: function(xhr, status, error) {

                // Set error msg
                var errorMsg = "There was a problem saving point data. Status: " + xhr.status;
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

            }
        });

    };

    /**
     * Delete multiple points
     * Will either take an array of points or a single pointId
     */
    MapManager.prototype.deletePoints = function() {

        pointsData = [];
        manager.pointsToDelete.forEach(function(point) {
            pointObj = {};
            if (typeof point == 'object') {
                pointObj.id = point.data.id;
            } else {
                pointObj.id = point;
            }
            pointsData.push(pointObj);
        });

        // Delete the data
        $.ajax('/lbs/ajax/points/delete', {
            type: 'POST',
            data: {
                points: pointsData,
                floorId: manager.floorId,
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                // Reset points using data returned
                manager.pointsToDelete = [];
                manager.removeAllPoints();
                manager.removeAllSegments();
                manager.points = data['points'];
                manager.initPoints();

                // Redraw segments
                if (manager.segmentsToDelete <= 0) {
                    manager.segments = manager.rawSegments;
                } else {
                    manager.segments = data['segments'];
                }

                // Init routes
                manager.initSegments();

                // Trigger event
                manager.mapContainer.trigger('pointsDeleted');

            },
            error: function(xhr) {

                // Set error msg
                var errorMsg = "There was a problem deleting point data. Status: " + xhr.status;
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

                // Reset points using data returned
                manager.pointsToDelete = [];

            }
        });

    };

    /**
     * Reset the points form
     */
    MapManager.prototype.resetPointForm = function() {
        $('#point-form-container').html('');
    };

    /**
     * Create the points list
     */
    MapManager.prototype.createPointList = function() {

        manager = this;
        pointData = {};

        tmpPoints = [];
        manager.points.forEach(function(point) {
            if (point.data.poiType != 0) {
                tmpPoints.push(point);
            }
        });

        pointData.poi = tmpPoints;

        // output mustache template
        Mustache.tags = ['{|', '|}'];
        var template = (pointData.poi.length > 0) ? $('#point-list-template').html() : $('#point-list-empty-template').html();
        $('#point-list').empty();
        $('#point-list').append(Mustache.render(template, pointData));

    };

    /**
     * Remove All Points
     */
    MapManager.prototype.removeAllPoints = function(isRefresh) {

        isRefresh = (typeof isRefresh == 'undefined') ? false : isRefresh;

        //delete point from the map
        manager.points.forEach(function(point) {
            manager.map.removeLayer(point);
        });

        if (!isRefresh) manager.points = [];

    };

    /**
     * Toggle for Add Point Mode
     */
    MapManager.prototype.toggleAddPoints = function() {

        manager = this;
        manager.isAddPointMode = !manager.isAddPointMode;

        if(!manager.isAddPointMode) {
            manager.resetPointForm();
        }

    };

    /**
     * Remove last Point from the list, for cancel
     */
    MapManager.prototype.removeLastPoint = function() {

        if(manager.isPointAdded) {
            lastPoint = manager.points.length - 1;
            manager.map.removeLayer(manager.points[lastPoint]);
            manager.isAddPointMode = false;
            manager.isPointAdded = false;
        }

    };

    /**
     * Create points icons
     */
    MapManager.prototype.createPointIcon = function(iconUrl, type) {

        type = (typeof type == 'undefined') ? 'poi' : type;
        size = (type == 'poi') ? [36, 36] : [16, 16];
        anchor = (type == 'poi') ? [18, 18] : [8, 8];
        iconUrl = (iconUrl.indexOf('https') == -1) ? iconUrl.replace("http","https") : iconUrl;

        mapIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: size,
            iconAnchor: anchor,
            permission: manager.enableIcons
        });

        return mapIcon;

    };

    /**
     * Toggle Show/Hide for points
     */
    MapManager.prototype.togglePoints = function(action) {

        action = typeof action !== 'undefined' ? action : 'toggle';
        switch (action) {
            case 'toggle':
                manager.points.forEach(function(point) {
                    $(point._icon).toggle();
                });
                break;

            case 'on':
            case 1:
                manager.points.forEach(function(point) {
                    $(point._icon).show();
                });
                break;

            case 'off':
            case 0:
                manager.points.forEach(function(point) {
                    $(point._icon).hide();
                });
                break;
        }

    };

    MapManager.prototype.addBlankPtBannerImg = function(msg) {

        $('#pt-banner-img').remove();
        Mustache.tags = ['{|', '|}'];
        var item = "<div class=\"alert alert-error\">"+msg+"</div>";
        $('.pt-banner-container').append(item);

    };

    /* ==========================================================================
     SEGMENTS
     ========================================================================== */

    /**
     * Get building point data
     */
    MapManager.prototype.getSegmentData = function() {

        manager.segments = [];

        // Get the data for the point
        manager.currentXHR = $.ajax('/lbs/ajax/segment-data.json', {

            data: {
                floorId: manager.floorId,
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                // set segment data and init
                manager.segments = data;
                manager.initSegments();
                manager.mapContainer.trigger('segmentDataReady');
                manager.mapContainer.off('pointDataReady');

            },

            error: function(xhr, status, error) {

                if (status != 'abort') {

                    // Set error msg
                    var errorMsg = "There was a problem with getting segment data. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }

            }
        });

    };

    /**
     * Draw All Segments
     */
    MapManager.prototype.initSegments = function() {

        drawPts = [];
        drawSegmentPts = [];
        drawSegments = [];
        manager.rawSegments = manager.segments;
        manager.segments.forEach(function(segment) {

            try{

                var isAccessible = 0;

                // get start pt
                manager.points.forEach(function(point) {
                    if (point.data.id == segment.startPointId) {
                        if (point.data.isAccessible == true) isAccessible++;
                        drawPts.push(point._latlng);
                        drawSegmentPts.push(point);
                    }
                });

                // get end pt
                manager.points.forEach(function(point) {
                    if (point.data.id == segment.endPointId) {
                        if (point.data.isAccessible == true) isAccessible++;
                        drawPts.push(point._latlng);
                        drawSegmentPts.push(point);
                    }
                });

                // draw segment
                if (drawPts.length==2) {
                    if (isAccessible != 2) {
                        polyline = L.polyline(drawPts, manager.getAccessibleLineOptions()).addTo(manager.map).bringToBack();
                    } else {
                        polyline = L.polyline(drawPts, manager.getLineOptions(false)).addTo(manager.map).bringToBack();
                    }
                    polyline.data = segment;
                    polyline.type = 'segment';
                    polyline.segmentId = segment.id;
                    polyline.on('click', manager.onSegmentClick);
                    drawSegments.push(polyline);
                    manager.changeSegmentPointsIcons(drawSegmentPts);
                    drawPts = [];
                    drawSegmentPts = [];
                } else {
                    drawPts = [];
                    drawSegmentPts = [];
                }

            } catch(e) {

            }

        });

        manager.segments = drawSegments;

    };

    /**
     * Click handler for segments, used for removing
     */
    MapManager.prototype.onSegmentClick = function(e) {

        if (manager.isDeleteMode) {
            manager.segmentsToDelete.push(e.target);
            $(e.target._container).hide();
        }

    };

    /**
     * Draw Single Segment
     */
    MapManager.prototype.drawSegment = function(latLng, point) {
        manager.segmentDrawPts.push(latLng);
        manager.segmentPts.push(point);
        if(manager.segmentDrawPts.length==1) {
            $('.leaflet-draw-tooltip-single').html('Step 2: Click on another waypoint or POI to finish drawing a segment.');
        }
        if(manager.segmentDrawPts.length == 2 && latLng != manager.segmentDrawPts[0]) {
            $('.leaflet-draw-tooltip-single').html('Step 1: Click on a waypoint or POI to start drawing a segment.');
            polyline = L.polyline(manager.segmentDrawPts, manager.getLineOptions(true)).addTo(manager.drawLayer).bringToBack();
            manager.segments.push(polyline);
            manager.saveSegment(manager.segmentPts, polyline);
            manager.changeSegmentPointsIcons(manager.segmentPts);
            manager.segmentPts = [];
            manager.segmentDrawPts = [];
        }
    };

    /**
     * Change icon image for points in a segment
     */
    MapManager.prototype.changeSegmentPointsIcons = function(points) {
        points.forEach(function(point) {
            var iconType = (point.data.isAccessible == true) ? manager.wayPointSegmentIcon : manager.wayPointInAccessibleConnectedSegmentIcon;
            var icon = manager.createPointIcon(iconType, 'waypoint');
            if (point.type == "waypoint") point.setIcon(icon);
        });
    };

    /**
     * Save Segment
     */
    MapManager.prototype.saveSegment = function(points, polyLine) {

        manager = this;

        // Stop any existing request
        if (manager.currentXHR) {
            manager.currentXHR.abort();
        }

        // Get the data for the reach report
        manager.currentXHR = $.ajax('/lbs/ajax/segment/add', {
            data :{
                startPointId : points[0].data.id,
                endPointId   : points[1].data.id,
                floorId      : manager.floor[0].id,
                venueGuid    : manager.venueGuid
            },
            success: function(data) {

                $(polyLine).on('click', manager.onSegmentClick);
                polyLine.segmentId = data[data.length-1].id;

                manager.removeAllSegments();
                manager.segments = data;
                manager.initSegments();

            },
            error: function(xhr, status, error) {

                if (status != 'abort') {

                    // Set error msg
                    var errorMsg = "There was a problem saving segment data. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }

            }
        });

    };

    /**
     * Delete segments
     */
    MapManager.prototype.deleteSegments = function() {

        // check segments to see if it's there to delete
        segmentsData = [];
        manager.segmentsToDelete.forEach(function(deleteSegment) {
            manager.segments.forEach(function(segment) {
                if (segment.segmentId == deleteSegment.segmentId) {
                    segmentObj = {};
                    segmentObj.id = deleteSegment.segmentId;
                    segmentsData.push(segmentObj);
                }
            });
        });

        // only make delete call if segments exists
        if (segmentsData.length > 0) {

            // Save the data
            $.ajax('/lbs/ajax/segments/delete', {
                type: 'POST',
                data: {
                    segments: segmentsData,
                    floorId: manager.floorId,
                    venueGuid: manager.venueGuid
                },
                success: function(data) {

                    //reset points
                    manager.removeAllPoints();
                    manager.points = manager.rawPoints;
                    manager.initPoints();

                    // reset segments
                    manager.segmentsToDelete = [];
                    manager.removeAllSegments();
                    manager.segments = data;
                    manager.initSegments();
                    manager.mapContainer.off('pointsDeleted');

                },
                error: function(xhr) {

                    // Set error msg
                    var errorMsg = "There was a problem deleting segments. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                    // reset segments to delete
                    manager.segmentsToDelete = [];

                }
            });

        }

    };

    /**
     * Remove All Segments
     */
    MapManager.prototype.removeAllSegments = function(isRefresh) {

        isRefresh = (typeof isRefresh == 'undefined') ? false : isRefresh;

        //delete segment from the map
        manager.segments.forEach(function(segment) {
            manager.map.removeLayer(segment);
        });
        if (!isRefresh) manager.segments = [];

    };

    /**
     * Toggle Show/Hide for segments
     */
    MapManager.prototype.toggleSegments = function(action) {

        action = typeof action !== 'undefined' ? action: 'toggle';

        switch (action) {
            case 'toggle':
                manager.points.forEach(function(point) {
                    if(point.type=='waypoint') {
                        $(point._icon).toggle();
                    }
                });

                manager.segments.forEach(function(segment) {
                    $(segment._container).toggle();
                });

                if (manager.selectedRoute != 0) {
                    manager.toggleRoutes();
                }

                break;
            case 'on':
            case 1:
                manager.points.forEach(function(point) {
                    if(point.type=='waypoint') {
                        $(point._icon).show();
                    }
                });

                manager.segments.forEach(function(segment) {
                    $(segment._container).show();
                });
                $('#layer-bar form li input#toggle-segments').prop('checked', true);

                break;
            case 'off':
            case 0:
                manager.points.forEach(function(point) {
                    if(point.type=='waypoint') {
                        $(point._icon).hide();
                    }
                });

                manager.segments.forEach(function(segment) {
                    $(segment._container).hide();
                });
                break;
        }
    };

    /**
     * Refresh segments
     */
    MapManager.prototype.refreshSegments = function() {

        if (manager.segments.length > 0) {
            manager.removeAllSegments();
            manager.segments = manager.rawSegments;
            manager.initSegments();
        }

    };

    /**
     * Get drawing options for lines
     */
    MapManager.prototype.getLineOptions = function(isDrawMode) {

        isDrawMode = (typeof isDrawMode == "undefined") ? false : isDrawMode;

        options = {
            stroke: true,
            color: ((isDrawMode) ? "#000" : "#0494de"),
            permission: manager.enableIcons
        };

        return options;

    };

    /**
     * Get drawing options for dashed inaccessible route lines
     */
    MapManager.prototype.getAccessibleLineOptions = function() {

        isDrawMode = (typeof isDrawMode == "undefined") ? false : isDrawMode;

        options = {
            dashArray: "2, 10",
            color: ((isDrawMode) ? "#000" : "#0494de")
        };

        return options;

    };

    /* ==========================================================================
     ROUTES
     ========================================================================== */

    /**
     * Get route  data
     */
    MapManager.prototype.getRouteData = function(evt, currentPage, limit) {

        // Get the data for the routes
        manager.currentXHR = $.ajax('/lbs/ajax/routes-data.json', {

            data: {
                currentPage: currentPage,
                floorId: manager.floorId,
                venueGuid: manager.venueGuid,
                limit: limit
            },

            success: function(data) {

                // clear interval
                if (manager.checkRouteInterval != null) {
                    clearInterval(manager.checkRouteInterval);
                    manager.checkRouteInterval = null;
                }

                // enable route UI
                $('#reset-routes').prop("disabled", false);
                $('#routes-progress-container').fadeOut(function(){
                    $('#route-look-form-container, #routes-list-container').fadeIn();
                });

                var successMsg = "Route generation completed.";
                var flashMsg = new FlashBang();
                flashMsg.msg = successMsg;
                flashMsg.createSuccess();

                // get new building pts and reinitialize routes ui with new data
                manager.getBuildingPoints();

            },

            error: function(xhr, status, error) {

                var errorMsg;

                try{
                    var response = JSON.parse(xhr.responseText);

                    if (xhr.status == 423) {

                        // Set error msg for route generation
                        errorMsg = response.message;

                        if (manager.checkRouteInterval == null) {
                            manager.checkRouteInterval = setInterval(function(){ manager.checkForRouteGeneration() }, 10000);
                        }

                        // Disable routes UI if locked
                        $('#reset-routes').prop("disabled", true);
                        $('#route-look-form-container, #routes-list-container').fadeOut(function(){
                            $('#routes-progress-container').fadeIn();
                        });

                    } else if (status != 'abort') {

                        // Set error msg
                        errorMsg = "There was a problem getting route data. Status: " + xhr.status;
                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();

                    }
                } catch (unknownException){

                    errorMsg = "There was a problem getting route data, please try again later. Status: Unknown server error";
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();
                }

            }
        });

    };

    MapManager.prototype.checkForRouteGeneration = function() {
        manager.getRouteData(null, 1, 1);
    };

    /**
     * Initialize the routes
     */
    MapManager.prototype.initRoutes = function() {

        // get points for all the building
        manager.getBuildingPoints();

        // when pt data is ready, init routes UI
        $(manager.map).on('bldgPtsDataReady', function() {

            // remove any existing options
            $('#route-start-point-select, #route-end-point-select').empty();

            // populate select fields with data.
            $.each(manager.buildingPts, function(index) {
                if (manager.buildingPts[index].poiType != 0 && manager.buildingPts[index].name) {
                    $('#route-start-point-select, #route-end-point-select')
                        .append($("<option></option>")
                            .attr("value", manager.buildingPts[index].id + "-" +  String(index))
                            .text(mapManager.buildingPts[index].name));
                }
            });

            // get the floor names from select menu
            $("#level-select option").each(function() {
                manager.floorNames[$(this).val()] = $(this).text();
            });

            // select formatting
            function formatSelect(item) {
                var itemValues = item.id.split("-");
                var index = itemValues[1];
                var name = (item.text.length > 28) ? item.text.substr(0, 27) + '&hellip;' : item.text;
                var iconUrl = (mapManager.buildingPts[index].customImageUrl) ? mapManager.buildingPts[index].customImageUrl : manager.icon_base_url + mapManager.buildingPts[index].poiType +'.png';
                return "<img class='select2-option-image' src='" + iconUrl + "' style='height: 35px; float:left' /> <div class='float: left'><span class='select2-option-text'>" + name + "</span><span class='select2-option-subtext'>" + manager.floorNames[mapManager.buildingPts[index].floorId] + "</span></div>";
            }

            // start point select
            $("#route-start-point-select").select2({
                placeholder: " Type to Search for Starting POI",
                formatResult: formatSelect,
                formatSelection: formatSelect,
                escapeMarkup: function(m) { return m; }
            });

            // end point select
            $("#route-end-point-select").select2({
                formatResult: formatSelect,
                formatSelection: formatSelect,
                escapeMarkup: function(m) { return m; }
            });

            $(".clear-route").on('click', function(event){
                event.stopPropagation();
                manager.resetRouteUI();
            });

            // on select hide initial search field
            $("#route-start-point-select, #route-end-point-select").on('select2-selecting', function() {
                $(this).prev().find('.select2-search-field').css('display', 'none');
            });

            // init select fields
            $("#route-start-point-select, #route-end-point-select").on('select2-close', function() {

                // blur field on select
                setTimeout(function () {
                    $('.select2-container-active').removeClass('select2-container-active');
                    $(':focus').blur();
                }, 10);


                // get single route data
                manager.getSingleRouteData();

            });

            // init select fields
            $("#route-start-point-select, #route-end-point-select").on('select2-removed', function() {

                // blur field on select and show initial search field
                setTimeout(function() {
                    manager.resetRouteUI(this);
                    $('.select2-search-field').css('display', 'block');
                }, 10);

            });

            // show routes ui container
            $('#routes-info-container').fadeIn();
            $('#route-isAccessible').on('change', function(){
                manager.getSingleRouteData();
            });

        });

        // turn off segment data listener
        manager.mapContainer.off('segmentDataReady');
    };

    /**
     * Deeplink to route
     */
    MapManager.prototype.deepLinktoRoute = function() {

        $('#routes-info-container').fadeIn();

        if (manager.multiFloorRoutePts != null) {

            // find the index of pts and create values for dropdowns
            $("#route-start-point-select").children().each( function(index, option) {
                if ($(option).val().indexOf(manager.multiFloorRoutePts[0]) != -1) {
                    $("#route-start-point-select").select2('val', $(option).val());
                }
            });

            // find the index of pts and create values for dropdowns
            $("#route-end-point-select").children().each( function(index, option) {
                if ($(option).val().indexOf(manager.multiFloorRoutePts[1]) != -1) {
                    $("#route-end-point-select").select2('val', $(option).val());
                }

            });

            manager.getSingleRouteData();
        }

    };

    /**
     * Get data for a single route
     */
    MapManager.prototype.getBuildingPoints = function() {

        // Stop any existing request
        if (manager.currentXHR) {
            manager.currentXHR.abort();
        }

        // Get the data for the point
        manager.currentXHR = $.ajax('/lbs/ajax/building-points-data.json', {

            data: {
                buildingId: manager.buildingId,
                venueGuid: manager.venueGuid
            },

            success: function(data) {

                manager.buildingPts = data;
                $(manager.map).trigger('bldgPtsDataReady');

            },
            error: function(xhr, status, error) {

                var errorMsg;

                try{
                    var response = JSON.parse(xhr.responseText);

                    if (xhr.status == 404 || xhr.status == 423) {

                        // Set error msg for route generation
                        errorMsg = response.message;

                    } else if (status != 'abort') {

                        // Set error msg
                        errorMsg = "There was a problem getting route data. Status: " + xhr.status;

                    }

                }
                catch (unknownException){
                    errorMsg = "There was a problem getting route data, please try again later. Status: Unknown server error";
                }

                // Show error message
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

            }
        });

    }

    /**
     * Get data for a single route
     */
    MapManager.prototype.getSingleRouteData = function() {

        // get start point
        var startPointId = $("#route-start-point-select").select2("val");
        if (typeof startPointId != "undefined" && startPointId != "") {
            startPointId = startPointId[0].split('-');
        }

        // get end point
        var endPointId = $("#route-end-point-select").select2("val");
        if (typeof endPointId != "undefined" && endPointId != "") {
            endPointId = endPointId[0].split('-');
        }

        // get accessible flag
        var isAccessible = document.querySelector('#route-isAccessible').checked;
        if ((typeof startPointId[0] != "undefined" && typeof endPointId[0] != "undefined") &&
            (startPointId[0] == endPointId[0]))
        {
            var flashError = new FlashBang();
            flashError.msg = "Starting point and destination cannot be the same.";
            flashError.createError();
            return;
        }

        if (typeof startPointId != "undefined" && startPointId != "" &&
            typeof endPointId != "undefined" && endPointId != "" &&
            typeof isAccessible != "undefined") {

            // Stop any existing request
            if (manager.currentXHR) {
                manager.currentXHR.abort();
            }

            // Get the data for the point
            manager.currentXHR = $.ajax('/lbs/ajax/single-route-data.json', {

                data: {
                    floorId:      manager.floorId,
                    startPointId: startPointId[0],
                    endPointId:   endPointId[0],
                    isAccessible: isAccessible,
                    venueGuid: manager.venueGuid
                },

                success: function(data) {

                    // Get the route pts
                    var routePts = data.pointIds.split(',');

                    // Remove the previous selected route
                    if (manager.selectedRoute != 0) {
                        manager.map.removeLayer(manager.selectedRoute);
                    }

                    // Draw the route and set as selected
                    manager.selectedRoute = manager.drawRoute(routePts);

                    // If the new selected route comes back as valid, then proceed
                    if (manager.selectedRoute != 0) {

                        // Toggle segments and zones
                        manager.toggleSegments('off');
                        $("#toggle-segments").removeAttr('checked');
                        manager.toggleZones('off');
                        $("#toggle-zones").removeAttr('checked');

                    }

                },
                error: function(xhr, status, error) {

                    var errorMsg;

                    if (xhr.status == 404 || xhr.status == 423) {

                        // Set error msg for route generation
                        var response = JSON.parse(xhr.responseText);
                        errorMsg = response.message;

                        if (manager.selectedRoute != 0) {

                            manager.resetRouteUI(null, true);

                            // set selected route
                            manager.selectedRoute = 0;

                        }


                    } else if (status != 'abort') {

                        // Set error msg
                        errorMsg = "There was a problem getting route data. Status: " + status;

                    }

                    // Show error message
                    if (status != 'abort') {
                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();
                    }

                }
            });

        }

    };

    /**
     * Reset route UI
     */
    MapManager.prototype.resetRouteUI = function(targetSelect, removeListOnly) {

        // set default target to reset both route select fields
        if (typeof targetSelect == "undefined" || targetSelect != null) {
            targetSelect = "#route-start-point-select, #route-end-point-select";
        }

        // set default for remove list only flag, which will only reset the UI portion and not selects
        if (typeof removeListOnly == "undefined") {
            removeListOnly = false;
        }

        // toggle routes, segments/zones
        manager.toggleRoutes();
        manager.toggleZones("on");
        manager.toggleSegments("on");
        $("#toggle-segments").prop('checked', true);
        $("#toggle-zones").prop('checked', true);
        $('#routes-list-container').removeClass('border-top');

        $('#routes-list-container ul').empty().addClass('hidden');
        $('#route-look-form-container h3').remove();
        $('.multi-floor-view-route-btn').fadeOut();

        // reset the select fields
        if (removeListOnly == false) {
            $(targetSelect).select2("val", "");
        }

    };

    /**
     * Draw Route
     */
    MapManager.prototype.drawRoute = function(routePoints) {

        var drawRoutePts = [];
        var firstRoutePts = [];
        var lastRoutePts = [];
        var portalPts = [];
        var isAccessible = true;

        // get first/starting point
        var firstPoint = $.grep(manager.buildingPts, function(n, i) {
            return routePoints[0] == n.id
        });

        // get last/destination point
        var lastPoint = $.grep(manager.buildingPts, function(n, i) {
            return routePoints[routePoints.length-1] == n.id
        });

        routePoints.forEach(function(routePoint) {

            // find the route point in the points array
            var point = $.grep(manager.points, function(n, i){
                return n.data.id ==  routePoint;
            });

            // if we have a point then lets add it to list of points to draw
            if (point.length == 1) {

                // get point from grep search array
                point = point[0];

                // set lat/long
                if (manager.supportsGeographicCoordinates == true) {
                    coords = new L.LatLng(point.data.location.latitude, point.data.location.longitude);
                } else {
                    x = manager.getPointX(point.data.x * manager.getZoom());
                    y = manager.getPointY(point.data.y * manager.getZoom());
                    coords = manager.map.unproject([x, y]);
                }

                // mark as inaccessible
                if (!point.data.isAccessible) {
                    isAccessible = false;
                }

                // add to draw array
                drawRoutePts.push(coords);
            }

            // find portal point that leads to last point in route
            firstPortalPoint = $.grep(manager.buildingPts, function(n, i) {
                return routePoint == n.id && n.floorId == manager.floorId && n.portalId
            });

            // find portal point that leads to last point in route
            lastPortalPoint = $.grep(manager.buildingPts, function(n, i) {
                return routePoint == n.id && n.floorId != manager.floorId && n.portalId
            });

            // first portal point
            if (firstPortalPoint.length == 1) {
                portalPts.push(firstPortalPoint[0]);
            }

            // last portal point
            if (lastPortalPoint.length == 1) {
                portalPts.push(lastPortalPoint[0]);
            }

        });

        // check to see if the portals are on the same floor, if not then it's a multifloor route
        if (portalPts.length > 1 && portalPts[0].floorId != portalPts[1].floorId) {

            // add first floor pts
            if (firstPoint.length == 1) {
                firstRoutePts.push(firstPoint[0]);
            }

            // add first floor portal
            if (firstPoint[0] != portalPts[0]) {
                firstRoutePts.push(portalPts[0]);
            }

            // add second floor portal
            if (lastPoint[0] != portalPts[1]) {
                lastRoutePts.push(portalPts[1]);
            }

            // add second floor pts
            if (lastPoint.length == 1) {
                lastRoutePts.push(lastPoint[0]);
            }

        }

        // add multifloor routes UI
        if (firstRoutePts.length > 0 || lastRoutePts.length > 0 && portalPts.length > 1) {

            // add some data to the points
            firstRoutePts.forEach(function(point){
                point.floorName = manager.floorNames[point.floorId];
                point.iconUrl =  (point.customImageUrl) ? point.customImageUrl : manager.icon_base_url + point.poiType +'.png';
            });

            // add some data to the points
            lastRoutePts.forEach(function(point){
                point.floorName = manager.floorNames[point.floorId];
                point.iconUrl =  (point.customImageUrl) ? point.customImageUrl : manager.icon_base_url + point.poiType +'.png';
            });

            // add to data object for mustache and init UI
            var routeData = {};
            var route1 = {};
            var route2 = {};

            route1.points = firstRoutePts;
            route1.floorId = firstRoutePts[0].floorId;
            route1.currentFloor = route1.floorId == manager.floorId;

            route2.points = lastRoutePts;
            route2.floorId = lastRoutePts[0].floorId;
            route2.currentFloor = route2.floorId == manager.floorId;

            routeData.routes = [route1, route2];
            manager.initMultiFloorRouteUI(routeData, routePoints, lastPoint);
            $('#routes-list-container').prev().append("<h3>This route spans multiple floors.</h3>");


        } else if ((firstPoint[0].floorId == lastPoint[0].floorId) && firstPoint[0].floorId != manager.floorId) {

            // deeplink to route
            var pts = [routePoints[0], routePoints[routePoints.length-1]];
            manager.multiFloorRoutePts = pts;
            $('#route-list-container').css('border', 'none');
            $("#level-select").val(lastPoint[0].floorId).change();
            manager.hasRouteDeeplink = true;

        }

        // set up line options
        var lineOptions = {
            weight: 4,
            color: '#54d766',
            opacity: 1
        };

        // add polyline to map, if route is inaccessible add dash array
        if (isAccessible == false) {
            lineOptions.dashArray =  "2, 10";
        }

        // only draw the route if there are pts on the current floor
        if (drawRoutePts.length > 1) {
            route  = L.polyline(drawRoutePts, lineOptions).addTo(manager.map).bringToFront();
            manager.map.fitBounds(route.getBounds());
        } else {
            route = 0;
        }

        return route;
    };

    /**
     * Init the multifloor route UI using mustache
     */
    MapManager.prototype.initMultiFloorRouteUI = function(routeData, routePoints, lastPoint) {

        // output mustache template
        Mustache.tags = ['{|', '|}'];
        var template = $('#routes-multifloor-template').html();
        $('#routes-list-container div').empty().append(Mustache.render(template, routeData)).fadeIn();
        $('#routes-list-container h3').remove();
        $('#routes-list-container').addClass('border-top');

        $('#routes-list-container ul').on('mouseover', function(e){
            if ($(this).data('floorId') != manager.floorId) {
                e.preventDefault;
                $(this).next().show();
            }
        });

        $('#routes-list-container ul').on('mouseleave', function(e){
            if ($(this).data('floorId') != manager.floorId) {
                e.preventDefault;
                $(this).next().hide();
            }
        });

        $('#routes-list-container ul').on('click', function(e) {
            var routeFloorId = $(this).data('floorId');
            if (routeFloorId != manager.floorId) {
                e.preventDefault;
                var pts = [routePoints[0], routePoints[routePoints.length-1]];
                manager.multiFloorRoutePts = pts;
                $('#route-list-container').removeClass('border-top');
                $('#routes-list-container ul').off('click');
                $('.multi-floor-view-route-btn').fadeOut();
                $("#level-select").val(routeFloorId).change();
                manager.hasRouteDeeplink = true;
            }
        });

    };

    /**
     * Remove All Routes
     */
    MapManager.prototype.removeAllRoutes = function() {

        try{

            //delete routes from the map
            manager.routes.forEach(function(route) {
                manager.map.removeLayer(route.data);
            });

            manager.routes = [];

        } catch(e) {

            console.log('error removing routes');

        }

    };

    /**
     * Reset routes
     */
    MapManager.prototype.resetRoutes = function() {

        // Stop any existing request
        if (manager.currentXHR) {
            manager.currentXHR.abort();
        }

        // Get the data for the point
        manager.currentXHR = $.ajax('/lbs/ajax/routes/reset', {

            data: {
                buildingId: manager.buildingId,
                floorId: manager.floorId,
                venueGuid: manager.venueGuid
            },

            success: function() {

                // Set error msg
                var successMsg = "Route generation has been started.";
                var flashMsg = new FlashBang();
                flashMsg.msg = successMsg;
                flashMsg.createSuccess();

                // Poll to check for updates
                manager.checkForRouteGeneration();

                // Disable routes UI
                $('#reset-routes').prop("disabled", true);
                $('#route-look-form-container, #routes-list-container').fadeOut(function(){
                    manager.resetRouteUI();
                    $('#routes-progress-container').fadeIn();
                });

            },
            error: function(xhr, status, error) {

                var errorMsg;
                var response = JSON.parse(xhr.responseText);

                if (xhr.status == 423) {

                    // Set error msg for route generation
                    errorMsg = response.message;

                } else if (status != 'abort') {

                    // Set error msg
                    errorMsg = "There was a problem getting route data. Status: " + xhr.status;

                }

                // Show error message
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

            }
        });

    };

    /**
     * Toggle Show/Hide for routes
     */
    MapManager.prototype.toggleRoutes = function() {
        if (manager.selectedRoute != 0) {
            if (manager.map) {
                manager.map.removeLayer(manager.selectedRoute);
            }
            manager.toggleSegments('on');
            manager.selectedRoute = 0;
        }
    };

    /* ==========================================================================
     Zones
     ========================================================================== */

    /**
     * Get zone data
     */
    MapManager.prototype.getZoneData = function() {

        manager.zones = [];

        // Get the data for the point
        manager.currentXHR = $.ajax('/lbs/ajax/zone-data.json', {

            data: {
                venueGuid: manager.venueGuid,
                mapName: manager.mapName
            },
            success: function(data) {

                // set segment data and init
                manager.zones = data;
                manager.initZones();

            },
            error: function(xhr, status, error) {

                if (status != 'abort') {

                    // Set error msg
                    var errorMsg = "There was a problem getting zone data. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }

            }
        });

    };

    MapManager.prototype.initZones = function() {

        drawZones = [];

        // get zones for correct floor
        manager.zones.forEach(function(zone) {
            manager.zoneMapId = zone.mapId;
            return;
        });

        // draw the zones
        manager.zones.forEach(function(zone) {

            // Add lat/long or xy based on venue supports geocoordinates flag
            if (manager.supportsGeographicCoordinates == true){
                coords = new L.LatLng(zone.shape.data.latitude, zone.shape.data.longitude);
            } else {
                zoneX = manager.getPointX(zone.shape.data.latitude * manager.getZoom());
                zoneY = manager.getPointY(zone.shape.data.longitude * manager.getZoom());
                coords = manager.map.unproject([zoneX, zoneY]);
            }

            var radius = (manager.supportsGeographicCoordinates) ? zone.shape.data.radius : zone.shape.data.radius / 3.28084;
            drawZone = L.circle(coords, radius, manager.getCircleOptions()).addTo(manager.drawLayer);
            drawZone.data = zone;
            drawZone.type = 'zone';
            drawZone.on('click', manager.onZoneClick);
            drawZones.push(drawZone);

        });

        //populate zone data
        manager.zones = drawZones;

        //create the zone list
        manager.createZonesList();

    };

    /**
     * Create the zone list
     */
    MapManager.prototype.createZonesList = function() {

        zoneData = {};
        tmpZones = [];
        manager.zones.forEach(function(zone) {
            tmpZones.push(zone);
        });
        zoneData.zones = tmpZones;

        // output mustache template
        Mustache.tags = ['{|', '|}'];
        var template = (zoneData.zones.length > 0) ? $('#zones-list-template').html() : $('#zones-list-empty-template').html();
        $('#zones-list').empty();
        $('#zones-list').append(Mustache.render(template, zoneData));

    };

    /**
     * Zone click handler
     */
    MapManager.prototype.onZoneClick = function() {

        if (!manager.isAddZoneMode && !manager.isEditMode && !manager.isDeleteMode) {
            manager.createZoneForm(this.data.id);
            $('.zone-tab').trigger('click');
        }

    };

    /**
     * Center on the Zone
     */
    MapManager.prototype.centerOnZone = function(zoneId) {

        manager.zones.forEach(function(zone) {
            if (zone.data.id == zoneId) {
                if (manager.supportsGeographicCoordinates == true) {
                    coords = new L.LatLng(zone.data.shape.data.latitude, zone.data.shape.data.longitude);
                } else {
                    zoneX = manager.getPointX(zone.data.shape.data.latitude * manager.getZoom());
                    zoneY = manager.getPointY(zone.data.shape.data.longitude * manager.getZoom());
                    coords = manager.map.unproject([zoneX, zoneY]);
                }
                manager.map.setView(coords);
            }
        });

    };

    /**
     * Creates and saves the zone data
     */
    MapManager.prototype.createZoneForm = function(zoneId, zone) {

        manager = this;

        // open tab if closed
        if (manager.overlayState == 'closed') {
            $('#pull-tab').trigger('click');
            manager.overlayState = 'open';
        }

        // zone tab click
        $('.zone-tab').trigger('click');

        // Stop any existing request
        if (manager.currentXHR) {
            manager.currentXHR.abort();
        }

        if (typeof zoneId == 'undefined' || zoneId == null) {
            uri = 'add';
        } else{
            uri = zoneId+'/edit';
        }

        // Get the data for the zone
        manager.currentXHR = $.ajax('/lbs/ajax/zone/'+ uri, {
            data: {
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                if (typeof zoneId == 'undefined' || zoneId == null) {

                    $('#zones-list-container').fadeOut('fast', function() {
                        $('#zones-form-container').html(data).fadeIn();
                        manager.initZoneSaveForm();
                        manager.addDataToZoneForm(zone);
                    });

                } else {

                    $('#zones-list-container').fadeOut('fast', function() {
                        $('#zones-form-container').html(data).fadeIn();
                        manager.initZoneSaveForm();
                        $('#zone_save_venueGuid').val(manager.venueGuid);
                    });

                }

            },
            error: function(xhr, status, error) {

                if (status != 'abort') {

                    // Set error msg
                    var errorMsg = "There was a problem with the server. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }

            }
        });
    };

    /**
     * Create the zone form
     */
    MapManager.prototype.initZoneSaveForm = function() {

        // Get cooldown value
        var coolDown = $('#zone_save_coolDown').val();

        if (coolDown == '') {
            var hours  = 1;
            var minutes  = 0;
            cooldown = parseInt(hours * 60) + parseInt(minutes);
            $('#zone_save_coolDown').val(cooldown);
        } else {
            var hours  = Math.floor(coolDown/60);
            var minutes  = coolDown % 60;
        }

        // Set cool down select menus
        $('#zone-cooldown-mins').val(minutes);
        $('#zone-cooldown-hours').val(hours);

        // Set value from ft to meters for non GEO venue
        if (manager.supportsGeographicCoordinates != true) {
            $('#zone_save_shapeRadius').val($('#zone_save_shapeRadius').val() / 3.28084);
        }

        // Add form 'submit' event listener
        $('#zone-form').on('submit', function(e) {

            e.preventDefault();

            // Get the form data
            var url = $(this).attr('action');
            var data = $(this).serializeArray();
            data.mapName = manager.mapName;

            // Save the data
            $.ajax(url, {
                type: 'POST',
                data: data,
                success: function() {

                    manager.isZoneChanged = true;
                    $('#add-zone-back').trigger('click');
                    manager.isZoneAdded = false;

                },
                error: function(xhr) {

                    // Set error msg
                    var errorMsg = "There was a problem initializing the zone save form. Status: "+xhr.status;
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();

                }
            });

        });

    };

    /**
     * Add data to zone form
     */
    MapManager.prototype.addDataToZoneForm = function(layer) {

        var zone = manager.map.project(layer._latlng);
        var radius = layer._mRadius;
        if (manager.supportsGeographicCoordinates == true) {
            var latLng = manager.map.unproject(zone);
            x = latLng.lat;
            y = latLng.lng;
        } else {
            x = manager.setPointX(zone.x / manager.getZoom());
            y = manager.setPointY(zone.y / manager.getZoom());
        }
        $('#zone_save_shapeLatitude').val(x);
        $('#zone_save_shapeLongitude').val(y);
        $('#zone_save_shapeRadius').val(radius);
        $('#zone_save_mapId').val(manager.zoneMapId);
        $('#zone_save_venueGuid').val(manager.venueGuid);

    };

    /**
     * Remove last Zone from the list, for cancel
     */
    MapManager.prototype.removeLastZone = function() {

        if(manager.isZoneAdded) {
            lastZone = manager.zones.length - 1;
            manager.map.removeLayer(manager.zones[lastZone]);
            manager.isAddZoneMode = false;
            manager.isZoneAdded = false;
        }

    };

    /**
     * Remove All Zones
     */
    MapManager.prototype.removeAllZones = function() {

        //delete segment from the map
        manager.zones.forEach(function(zone) {
            manager.map.removeLayer(zone);
        });

        manager.zones = [];

    };

    /**
     * Toggle Show/Hide for zones
     */
    MapManager.prototype.toggleZones = function(action) {

        action = typeof action !== 'undefined' ? action: 'toggle';

        switch (action) {
            case 'toggle':
                manager.zones.forEach(function(zone) {
                    $(zone._container).toggle();
                });

                break;
            case 'on':
            case 1:
                manager.zones.forEach(function(zone) {
                    $(zone._container).show();
                });
                break;
            case 'off':
            case 0:
                manager.zones.forEach(function(zone) {
                    $(zone._container).hide();
                });
                break;
        }

    };

    /**
     * Get shape options
     */
    MapManager.prototype.getCircleOptions = function(isDrawMode) {

        isDrawMode = (typeof isDrawMode == "undefined") ? false : true;

        options = {
            stroke: true,
            color: ((isDrawMode) ? "#000" : "#0494de"),
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: true,
            permission: manager.enableIcons
        };

        return options;

    };

    /**
     * Save multiple zones
     */
    MapManager.prototype.saveZones = function(zones) {
        zonesData = [];
        zones.forEach(function(zone) {
            coords = manager.map.project(zone._latlng);
            if (manager.supportsGeographicCoordinates == true) {
                latLng = manager.map.unproject(coords);
                x = latLng.lat;
                y = latLng.lng;
            } else {
                x = manager.setPointX(coords.x / manager.getZoom());
                y = manager.setPointY(coords.y / manager.getZoom());
            }
            zoneObj = {};
            zoneObj.id = zone.data.id;
            zoneObj.mapId = manager.zoneMapId;
            zoneObj.latitude = x;
            zoneObj.longitude = y;
            zoneObj.radius = zone._mRadius;
            zonesData.push(zoneObj);
        });

        // Save the data
        $.ajax('/lbs/ajax/zones/edit', {
            type: 'POST',
            data: {
                zones: zonesData,
                mapName: manager.mapName,
                venueGuid: manager.venueGuid
            },
            success: function(data) {

                // Reset points using data returned
                manager.removeAllZones();
                manager.zones = data;
                manager.initZones();

            },
            error: function(xhr) {

                // Set error msg
                var errorMsg = "There was a problem saving zone data. Status: "+ xhr.status;
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

            }
        });

    };

    /**
     * Delete multiple zones,
     * Will either take an array of zones or a single zoneId
     */
    MapManager.prototype.deleteZones = function() {

        zonesData = [];

        manager.zonesToDelete.forEach(function(zone) {
            zoneObj = {};
            if (typeof zone == 'object') {
                zoneObj.id = zone.data.id;
            } else {
                zoneObj.id = zone;
            }
            zonesData.push(zoneObj);
        });

        // Delete the data
        $.ajax('/lbs/ajax/zones/delete', {
            type: 'POST',
            data: {
                zones: zonesData,
                buildingId: manager.buildingId,
                venueGuid: manager.venueGuid,
                mapName: manager.mapName
            },
            success: function(data) {

                // Reset points using data returned
                manager.zonesToDelete = [];
                manager.removeAllZones();
                manager.zones = data;
                manager.initZones();

            },
            error: function(xhr) {

                manager.zonesToDelete = [];

                // Set error msg
                var errorMsg = "There was a problem deleting zone data. Status: "+xhr.status;
                var flashError = new FlashBang();
                flashError.msg = errorMsg;
                flashError.createError();

            }
        });

    };

    /* ==========================================================================
     SVG Loader
     ========================================================================== */

    /**
     * Load the svg then get max size based on container &  map aspect ratio
     */
    MapManager.prototype.getMapDimensions = function(svg) {

        if (svg) {

            // need for IE cross domain requests
            $.support.cors = true;

            $.ajax({
                type: "GET",
                url: svg,
                success: function(data) {

                    try{

                        // import the svg xml data and get the width height
                        var svgData = $(data);
                        manager.svgWidth = Math.floor($(svgData).filter(":first").attr("width").replace("px", ""));
                        manager.svgHeight = Math.floor($(svgData).filter(":first").attr("height").replace("px", ""));

                        // get container size
                        manager.mapContainerWidth  = $('#map').width() * .9;
                        manager.mapContainerHeight  = $('#map').height() * .9;

                        // calc initial size
                        var aspectRatio = manager.svgWidth / manager.svgHeight;

                        // set the map sizes
                        manager.mapWidth = aspectRatio * manager.mapContainerHeight;
                        manager.mapHeight = aspectRatio * manager.mapContainerWidth;

                        // set correct ratios for vertical and horizontal maps
                        if (manager.mapWidth > manager.mapContainerWidth) {
                            aspectRatio = manager.svgWidth / manager.svgHeight;
                            manager.mapWidth = manager.mapContainerWidth;
                            manager.mapHeight = aspectRatio * manager.mapContainerWidth;
                        }

                        if (manager.mapHeight > manager.mapContainerHeight) {
                            aspectRatio = manager.svgWidth / manager.svgHeight;
                            manager.mapWidth = aspectRatio * manager.mapContainerHeight;
                            manager.mapHeight = manager.mapContainerHeight;
                        }

                    } catch(e) {

                        var errorMsg = "Error displaying map. Check SVG Metadata";
                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();

                    } finally {

                        // trigger ready event and remove listener
                        $('#map').trigger('sizeReady');
                        $('#map').off('load');

                    }

                },
                error: function(xhr, status, error) {
                    if (xhr.status = 404) {
                        var errorMsg = "Error loading map file. Status: 404";
                        var flashError = new FlashBang();
                        flashError.msg = errorMsg;
                        flashError.createError();
                    }
                },
                cache: false,
                crossdomain: true,
                dataType: 'TEXT'
            });

        } else {

            // show error
            var errorMsg = "No SVG map available to display. Please upload a SVG asset for this floor.";
            var flashError = new FlashBang();
            flashError.msg = errorMsg;
            flashError.createError();

            // wait & trigger ready event and remove listener
            setTimeout(function(){
                $('#map').trigger('sizeReady');
                $('#map').off('load');
            }, 500)

        }

    }

    /* ==========================================================================
     MISC.
     ========================================================================== */

    MapManager.prototype.revertLayers = function() {

        for (var toolbarId in manager.drawControl._toolbars) {
            toolbar = manager.drawControl._toolbars[toolbarId];
            if (toolbar instanceof L.EditToolbar) {
                toolbar._activeMode.handler.revertLayers();
            }
        }
    };

    /**
     * Get Zoom, because zoom levels aren't proportional
     */
    MapManager.prototype.getZoom = function() {

        zoom = '';
        switch(manager.map.getZoom()){
            case 18 : zoom = .25;
                break;
            case 19 : zoom = .5;
                break;
            case 20 : zoom = 1;
                break;
            case 21 : zoom = 2;
                break;
            case 22 : zoom = 4;
                break;
            case 23 : zoom = 8;
                break;
        }
        return zoom;
    };

    /**
     * Returns true if any of the edit tools are active
     */
    MapManager.prototype.isEditing = function() {
        return this.isEditMode || this.isDeleteMode;
    }

    MapManager.prototype.confirmLeaving = function() {
        if (this.isEditing()) {
            return confirm(MapManager.confirmLeavingPrompt);
        } else {
            // Not editing, leaving is fine
            return true;
        }
    }

});
