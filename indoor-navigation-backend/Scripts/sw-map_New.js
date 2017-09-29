var manager = this;
this.map = null;
// dimensions of the image
this.w = 620;
this.h = 620;
this.url = 'http://localhost/indoor-navigation-backend/Map/first-floor.svg';
// calculate the edges of the image, in coordinate space
this.southWest = 0;
this.northEast = 0;
this.bounds = 0;
this.floorId = 0;
this.buildingId = 0;
this.drawLayer = null;
this.mapContainer = $('#map-container');
this.routes = [];
this.points = [];
this.zones = [];
this.segmentDrawPts = [];
this.segmentPts = [];
this.segments = [];
this.rawSegments = [];
this.rectangles = [];
this.selectedRoute = 0;
this.drawControl = '';
this.defaultIcon = 'Scripts/bundles/phunwaremaascore/img/poi_cursor.png';
this.markerIcon = 'Scripts/bundles/phunwaremaascore/img/marker-icon-2x.png';
this.pointIcon = 'Scripts/bundles/phunwaremaascore/img/waypoint_icon.png';
this.wayPointIcon = 'Scripts/bundles/phunwaremaascore/img/waypoint_hover_icon.png';
this.wayPointSegmentIcon = 'Scripts/bundles/phunwaremaascore/img/waypoint_segment_icon.png';
this.wayPointInAccessibleSegmentIcon = 'Scripts/bundles/phunwaremaascore/img/waypoint_inaccessible_segment_icon.png';
this.wayPointInAccessibleAddSegmentIcon = 'Scripts/bundles/phunwaremaascore/img/waypoint_inaccessible_add_segment_icon.png';
this.wayPointInAccessibleConnectedSegmentIcon = 'Scripts/bundles/phunwaremaascore/img/waypoint_inaccessible_connected_segment_icon.png';
this.zoneMapId = '';
this.zonesToDelete = [];
this.isAddPointMode = false;
this.isAddSegmentMode = false;
this.isAddZoneMode = false;
this.isZoneAdded = false;
this.isRectangleAdded = false;
this.isPointAdded = false;
this.isPointChanged = false;
this.isEditMode = false;
this.isDeleteMode = false;
this.isUpdated = false;
this.supportsGeographicCoordinates = true;//data.supportsGeographicCoordinates;
this.pointsToDelete = [];
this.segmentsToDelete = [];
this.zonesToDelete = [];
this.rectanglesToDelete = [];
this.overlayState = '';
this.mapReferencePts = null;
this.isMapSet = false;
this.checkRouteInterval = null;
this.enableIcons = true;//data.enableIcons
this.zoomLevel = 1;
this.svgWidth = '';
this.svgHeight = '';
this.svgUrl = 'http://localhost/indoor-navigation-backend/Map/first-floor.svg';

var mapManager = {

    //init: function () {

    //    // reset forms for zone and points if open
    //    if ($('#zone-list-container').css('display', 'block')) $('#add-zone-back').trigger('click');
    //    if ($('#point-list-container').css('display', 'block')) $('#add-point-back').trigger('click');

    //    manager.overlayState = ($('#map-overlay').css('right') == '-350px') ? 'closed' : 'open';

    //    // reset the map if it's already been initialized
    //    if (typeof manager.map == "object") {
    //        mapManager.resetMap();
    //    }

    //    // assign the zoom level to max zoom level
    //    //manager.zoomLevel = manager.floor[0].maxZoomLevel;

    //    mapManager.initLatLongMap();
    //},

    initLatLongMap: function () {
        //var referencePts = { topRight: { latitude: 23.041706, longitude: 72.507723 }, bottomLeft: { latitude: 23.041494, longitude: 72.507559 } };
        //if (referencePts != null && referencePts.topRight.latitude != 0) {
        //    manager.isMapSet = true;
        //    manager.mapReferencePts = {};
        //    manager.mapReferencePts.rotation = -154.53;//manager.floor[0].referencePoints.rotation;
        //    manager.mapReferencePts.bottomLeft = new L.LatLng(23.041494, 72.507559);//new L.LatLng(referencePts.bottomLeft.latitude, referencePts.bottomLeft.longitude);
        //    manager.mapReferencePts.topRight = new L.LatLng(23.041494, 72.507559);//new L.LatLng(referencePts.topRight.latitude, referencePts.topRight.longitude);
        //} else if (manager.data.map.location.latitude && manager.data.map.location.longitude) {
        //    manager.isMapSet = false;
        //    manager.mapReferencePts = {};
        //    manager.mapReferencePts.bottomLeft = new L.LatLng(manager.data.map.location.latitude - .001, manager.data.map.location.longitude - .001);
        //    manager.mapReferencePts.topRight = new L.LatLng(manager.data.map.location.latitude + .001, manager.data.map.location.longitude + .001);
        //    manager.mapReferencePts.rotation = 0;
        //}

        //// Set the bounds & create map
        //var bounds = new L.LatLngBounds(manager.mapReferencePts.bottomLeft, manager.mapReferencePts.topRight);
        //var boundsCenter = bounds.getCenter();

        manager.map = L.map('map', {
            minZoom: 4,
            maxZoom: 5,
            center: [400, 400],
            zoom: 4,
            crs: L.CRS.Simple,
        });

        //manager.map = new L.Map('map', {
        //    center: boundsCenter,
        //    zoom: 17,
        //    minZoom: 2,
        //    maxZoom: 22,
        //    scrollWheelZoom: false,
        //    crs: L.CRS.EPSG3857
        //});

        //// make map fit to bounds
        //manager.map.fitBounds(bounds);

        //// set up map overlay layer
        //var OverlayCanvas = L.CanvasLayer.extend({

        //    render: function () {

        //        try {

        //            // create the canvas and clear it
        //            var canvas = this.getCanvas();
        //            var context = canvas.getContext('2d');
        //            context.clearRect(0, 0, manager.svgWidth, manager.svgHeight);

        //            // set up our reference points
        //            var marker0 = manager.map.latLngToContainerPoint(L.latLng(mapManager.floor[0].referencePoints.topLeft.latitude, manager.floor[0].referencePoints.topLeft.longitude));
        //            var marker1 = manager.map.latLngToContainerPoint(L.latLng(mapManager.floor[0].referencePoints.topRight.latitude, manager.floor[0].referencePoints.topRight.longitude));
        //            var marker2 = manager.map.latLngToContainerPoint(L.latLng(mapManager.floor[0].referencePoints.bottomRight.latitude, manager.floor[0].referencePoints.bottomRight.longitude));

        //            // set up our transformation
        //            var m11 = (marker1.x - marker0.x) / manager.svgWidth;
        //            var m12 = (marker1.y - marker0.y) / manager.svgWidth;
        //            var m21 = (marker2.x - marker1.x) / manager.svgHeight;
        //            var m22 = (marker2.y - marker1.y) / manager.svgHeight;
        //            var dx = marker0.x;
        //            var dy = marker0.y;

        //            context.setTransform(
        //                m11, m12,
        //                m21, m22,
        //                dx, dy
        //            );

        //            // don't add svg map if svgurl is null but still load map editor
        //            if (manager.svgUrl) {

        //                // add the svg and redraw
        //                base_image = new Image();
        //                base_image.src = manager.svgUrl + '?v27';
        //                context.drawImage(base_image, 0, 0);
        //                this.redraw();

        //            }

        //        } catch (e) {

        //            console.log(e);

        //        }

        //    }

        //});

        //// add the map tiles'
        //manager.tileLayer = new L.TileLayer(manager.tileUrl, {
        //    zIndex: 1,
        //    updateWhenIdle: true,
        //    unloadInvisibleTiles: true,
        //    reuseTiles: true,
        //    maxZoom: 22
        //}).addTo(manager.map);

        //// create a new overlay
        //manager.overlayImage = new OverlayCanvas().addTo(manager.map);

        //// add bg color to map container
        //$('.leaflet-container').css('background', '#fff');

        //// trigger ready evt & remove size evt
        //$(manager.mapContainer).trigger('mapReady');
        //$('#map').off('sizeReady');

        //// zoom events
        //manager.map.on('zoomstart', function () {
        //    $('.leaflet-custom-canvas-container').css('opacity', '0');
        //    manager.overlayImage.render();
        //});

        //manager.map.on('zoomend', function () {
        //    $('.leaflet-custom-canvas-container').animate({ 'opacity': '1' }, 300);
        //    manager.overlayImage.render();
        //});

        ////check for safari,chrome and opera
        //var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
        //var isChrome = /Mozilla/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        //var isOpera = /Mozilla/.test(navigator.userAgent) && /Opera/.test(navigator.vendor);

        //// drag events
        //manager.map.on('drag', function () {
        //    manager.overlayImage.render();

        //    // only override transform if not safari
        //    if (!isSafari && !isChrome && !isOpera) {
        //        $('.leaflet-custom-canvas-container').css("-webkit-transform", "");
        //    }
        //});

        //// resize/reset events
        //manager.map.on('viewreset', function () {
        //    manager.overlayImage.render();
        //})

        //// set zoom
        //manager.map.setZoom(manager.map.getZoom());

        southWest = map.unproject([0, h], map.getMaxZoom() - 1);
        northEast = map.unproject([w, 0], map.getMaxZoom() - 1);
        bounds = new L.LatLngBounds(southWest, northEast);
        // add the image overlay,
        // so that it covers the entire map
        L.imageOverlay(url, bounds).addTo(map);

        // tell leaflet that the map is exactly as big as the image
        map.setMaxBounds(bounds);

        manager.drawLayer = new L.FeatureGroup();
        L.permission = manager.enableIcons;
        manager.map.addLayer(manager.drawLayer);

        // init the points data if not set already
        mapManager.getPointData();

        // init draw functions
        mapManager.initDraw();

        // get zone data
        mapManager.getZoneData();

        // get segment data after point data is ready only if there are no points
        manager.mapContainer.on('pointDataReady', mapManager.getSegmentData);

        mapManager.getRectangleData();

        // toggle all layers back on
        mapManager.toggleZones('on');
        mapManager.toggleSegments('on');
        mapManager.toggleRoutes();
        $("#toggle-segments").prop('checked', true);
        $("#toggle-zones").prop('checked', true);

        // trigger ready evt & remove size evt
        $(manager.mapContainer).trigger('mapReady');
        $('#map').off('sizeReady');
    },

    /**
     * Resets the map leaflet instance
     */
    resetMap: function () {

        $("#map").remove();
        manager.map = '';

        // clear map interval
        if (manager.checkRouteInterval != null) {
            clearInterval(mapManager.checkRouteInterval);
            manager.checkRouteInterval = null;
        }

        // Clear beforeunload event
        window.removeEventListener('beforeunload', this.onBeforeUnload);
    },

    /**
    * Toggle Show/Hide for routes
    */
    toggleRoutes : function () {
        if (manager.selectedRoute != 0) {
            if (manager.map) {
                manager.map.removeLayer(manager.selectedRoute);
            }
            manager.toggleSegments('on');
            manager.selectedRoute = 0;
        }
    },

    initDraw: function () {

        // remove draw control & add new
        if (drawControl != '') {
            map.removeControl(drawControl);
        }

        // configure the controls
        drawControl = new L.Control.Draw({
            draw: {
                polygon: true,
                //{
                //    allowIntersection: true, // Restricts shapes to simple polygons
                //    drawError: {
                //        color: '#e1e100', // Color the shape will turn when intersects
                //        message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                //    },
                //    shapeOptions: {
                //        color: '#97009c'
                //    }
                //},
                rectangle: true,
                point: {
                    icon: mapManager.createPointIcon(pointIcon, 'waypoint'),
                    repeatMode: true
                },
                inaccessibleWayPoint: {
                    icon: mapManager.createPointIcon(wayPointInAccessibleAddSegmentIcon, 'waypoint'),
                    repeatMode: false
                },
                marker: {
                    icon: mapManager.createPointIcon(defaultIcon),
                    repeatMode: false
                },
                circle: {
                    shapeOptions: mapManager.getCircleOptions(true)
                },
                polyline: {
                    repeatMode: false,
                    shapeOptions: mapManager.getLineOptions(true),
                    allowIntersection: false
                }
            },
            edit: {
                featureGroup: manager.drawLayer
            }
        });

        // add controls to map
        map.addControl(drawControl);

        // fires when items drawn on map
        manager.map.on('draw:created', function (e) {

            var type = e.layerType,
                layer = e.layer;

            if (type === 'marker') {
                point = layer;
                mapManager.saveWayPoint(layer, true, 1);
                //point.on('click', mapManager.onPointClick);
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
                point.on('click', mapManager.onPointClick);
                mapManager.saveWayPoint(point, true, 0);
            }

            if (type == 'inaccessibleWayPoint') {
                point = layer;
                point.on('click', mapManager.onPointClick);
                mapManager.saveWayPoint(point, false, 0);
            }

            if (type == 'circle') {
                zone = layer;
                //if (manager.zoneMapId != '') {
                //manager.createZoneForm(null, e.layer);
                createdZones = []
                manager.zones.push(zone);
                createdZones.push(zone);
                mapManager.saveZones(createdZones);
                manager.isZoneAdded = true;
                //} else {
                //    var errorMsg = "Could not create zone, floor has no zone map associated with it and could not create one.";
                //    //var flashError = new FlashBang();
                //    //flashError.msg = errorMsg;
                //    //flashError.createError();
                //    return;
                //}
            }

            if (type == 'rectangle') {
                rectangle = layer;
                createdRectangles = []
                manager.rectangles.push(rectangle);
                createdRectangles.push(rectangle);
                mapManager.saveRectangles(createdRectangles);
                manager.isRectangleAdded = true;
            }

            manager.drawLayer.addLayer(layer);
        });

        // fires when drawing starts
        manager.map.on('draw:drawstart', function (e) {

            //manager.toggleRoutes();

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

            //// remove unsaved zone if there
            //if (manager.isZoneAdded) {
            //    mapManager.removeLastZone();
            //    $('#add-zone-back').trigger('click');
            //}

            ////remove unsaved poi if there
            //if (manager.isPointAdded) {
            //    mapManager.removeLastPoint();
            //    $('#add-point-back').trigger('click');
            //}
        });

        // fires when drawing stops
        manager.map.on('draw:drawstop', function (e) {

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

        // fires when delete starts
        manager.map.on('draw:deletestart', function () {
            manager.isDeleteMode = true;
            //manager.toggleRoutes();
        });

        // fires when something is deleted
        manager.map.on('draw:deleted', function (e) {
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
                    case 'rectangle':
                        manager.rectanglesToDelete.push(layer);
                        break;
                }
            });

            // delete points & segments
            if (manager.pointsToDelete.length > 0 && manager.segmentsToDelete.length > 0) {
                mapManager.deletePoints();
                manager.mapContainer.on('pointsDeleted', mapManager.deleteSegments());
            }

            // delete points
            if (manager.pointsToDelete.length > 0 && manager.segmentsToDelete.length < 1) {
                mapManager.deletePoints();
            }

            // delete the segments
            if (manager.pointsToDelete.length < 1 && manager.segmentsToDelete.length > 0) {
                mapManager.deleteSegments();
            }

            // delete the zones
            if (manager.zonesToDelete.length > 0) {
                mapManager.deleteZones();
            }

            // delete the rectangles
            if (manager.rectanglesToDelete.length > 0) {
                mapManager.deleteRectangles();
            }

            //// reset forms for zone and points
            //if (manager.zonesToDelete.length > 0 && $('#zone-list-container').css('display', 'block')) {
            //    $('#add-zone-back').trigger('click');
            //}
            //if (manager.pointsToDelete.length > 0 && $('#point-list-container').css('display', 'block')) {
            //    $('#add-point-back').trigger('click');
            //}

            // set delete mode flag
            manager.isDeleteMode = false;

        });

        // fires when editing starts, turns on all check boxes layers
        manager.map.on('draw:editstart', function () {

            manager.isEditMode = true;
            mapManager.toggleZones('on');
            mapManager.toggleSegments('on');
            mapManager.toggleRoutes();

            $("#toggle-segments").prop('checked', true);
            $("#toggle-zones").prop('checked', true);

            //// remove unsaved zone if there
            //if (manager.isZoneAdded) {
            //    mapManager.removeLastZone();
            //    $('#add-zone-back').trigger('click');
            //}

            //// remove unsaved poi if there
            //if (manager.isPointAdded) {
            //    mapManager.removeLastPoint();
            //    $('#add-point-back').trigger('click');
            //}

        });

        // fires when editing stops / also when deleting stops
        manager.map.on('draw:editstop', function () {

            // reset flags
            manager.isEditMode = false;
            manager.isDeleteMode = false;
            manager.isAddZoneMode = false;
            manager.isAddPointMode = false;

            // delete segments
            if (manager.segmentsToDelete.length > 0 && manager.isDeleteMode) {
                manager.segmentsToDelete.forEach(function (segment) {
                    $(segment._container).show();
                });
            }

            //// remove unsaved zone if there
            //if (manager.isZoneAdded) {
            //    mapManager.removeLastZone();
            //    $('#add-zone-back').trigger('click');
            //}

            //// remove unsaved poi if there
            //if (manager.isPointAdded) {
            //    mapManager.removeLastPoint();
            //    $('#add-point-back').trigger('click');
            //}

            mapManager.toggleRoutes();

        });

        // fires when editing is done
        manager.map.on('draw:edited', function (e) {

            // get list of points to save
            var savePointLayers = [];
            var saveZoneLayers = [];
            var saveRectangleLayers = [];
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
                    case 'rectangle':
                        saveRectangleLayers.push(layer);
                        break;
                }
            });

            // save points, if cancel then revert layers
            if (savePointLayers.length > 0) {
                pointsConfirm = confirm("Are you sure you want to save these points?");
                if (pointsConfirm == true) {
                    mapManager.savePoints(savePointLayers);
                    mapManager.removeAllSegments();
                    mapManager.getSegmentData();
                    mapManager.removeAllRoutes();
                } else {
                    mapManager.revertLayers();
                }
            }

            // save zones
            if (saveZoneLayers.length > 0)
                mapManager.saveZones(saveZoneLayers);

            // save rectangles
            if (saveRectangleLayers.length > 0)
                mapManager.saveRectangles(saveRectangleLayers);

        });
    },

    revertLayers: function () {

        for (var toolbarId in manager.drawControl._toolbars) {
            toolbar = manager.drawControl._toolbars[toolbarId];
            if (toolbar instanceof L.EditToolbar) {
                toolbar._activeMode.handler.revertLayers();
            }
        }
    },

    //get point data from database
    getPointData: function () {
        // Get the data for the point
        $.ajax('Map/GetPointData', {

            //data: {
            //    floorId: 0,
            //    venueGuid: 0
            //},
            type: 'GET',
            success: function (data) {
                // set point data and init
                manager.points = data;
                mapManager.initPoints();
                manager.mapContainer.trigger('pointDataReady');
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

    },

    //draw points on the map
    initPoints: function () {
        manager.rawPoints = manager.points;
        drawPts = [];
        manager.points.forEach(function (poi) {

            //if (poi.floorId == manager.floorId) {

            //    pointX = manager.getPointX(poi.x * manager.getZoom());
            //    pointY = manager.getPointY(poi.y * manager.getZoom());

            try {

                // Add lat/long or xy based on venue supports geocoordinates flag
                if (manager.supportsGeographicCoordinates == true) {
                    pointCoordinates = new L.LatLng(poi.location.latitude, poi.location.longitude);
                } else {
                    pointCoordinates = manager.map.unproject([pointX, pointY]);
                }

                // Set icon type, either waypoint, inaccesible waypoint or POI
                var wayPointIconType = (poi.isAccessible) ? manager.wayPointIcon : manager.wayPointInAccessibleSegmentIcon;
                iconUrl = (poi.poiType == 0) ? wayPointIconType : manager.markerIcon;

                // load custom point type icon
                if (poi.poiType != 0 && poi.customIconImageUrl) {
                    iconUrl = poi.customIconImageUrl;
                }

                //set type and icon
                type = (poi.poiType == 0) ? 'waypoint' : 'poi';
                icon = mapManager.createPointIcon(iconUrl, type);

                // init the point click & drag events & popUp
                point = L.marker(pointCoordinates, {
                    icon: icon,
                    draggable: false
                }).addTo(manager.drawLayer);

                //if (type == 'poi') {

                //    point.on("mouseover", function (e) {
                //        this.bindPopup(mapManager.createPointPopUp(poi), { offset: new L.Point(0, -8) }).openPopup();
                //    });
                //}
                point.on('click', mapManager.onPointClick);
                point.type = type;
                point.data = poi;
                point.id = poi.id;
                point.icon = iconUrl;
                drawPts.push(point);

            } catch (err) {

                console.log(err);

            }

        });
        // get new list of draw points
        points = drawPts;
        //// create the points list
        //manager.createPointList();
    },

    /**
    * Create the map Point popup
    */
    createPointPopUp: function (data) {

        popUp = L.popup({ 'maxHeight': '120' });
        //popUp.setContent('<span class="name">' + data.name + '</span>');
        popUp.setContent('<span class="name">POI</span>');
        return popUp;

    },

    createPointIcon: function (iconUrl, type) {

        type = (typeof type == 'undefined') ? 'poi' : type;
        size = (type == 'poi') ? [22, 40] : [16, 16];
        anchor = (type == 'poi') ? [18, 18] : [8, 8];
        iconUrl = (iconUrl.indexOf('https') == -1) ? iconUrl.replace("http", "https") : iconUrl;

        mapIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: size,
            iconAnchor: anchor,
            permission: manager.enableIcons
        });

        return mapIcon;

    },

    /*** Point click event*/
    onPointClick: function () {
        if (manager.isAddSegmentMode) {
            mapManager.drawSegment(this._latlng, this);
        }
        //else if (!manager.isEditMode && !manager.isDeleteMode) {
        //    manager.createPointForm(this.data.id);
        //    $('.points-tab').trigger('click');
        //}
    },

    drawSegment: function (latLng, point) {
        manager.segmentDrawPts.push(latLng);
        manager.segmentPts.push(point);
        if (manager.segmentDrawPts.length == 1) {
            $('.leaflet-draw-tooltip-single').html('Step 2: Click on another waypoint or POI to finish drawing a segment.');
        }
        if (manager.segmentDrawPts.length == 2 && latLng != manager.segmentDrawPts[0]) {
            $('.leaflet-draw-tooltip-single').html('Step 1: Click on a waypoint or POI to start drawing a segment.');
            polyline = L.polyline(segmentDrawPts, mapManager.getLineOptions(true)).addTo(manager.drawLayer).bringToBack();
            manager.segments.push(polyline);
            mapManager.saveSegment(manager.segmentPts, polyline);
            mapManager.changeSegmentPointsIcons(manager.segmentPts);
            manager.segmentPts = [];
            manager.segmentDrawPts = [];
        }
    },

    /*** Change icon image for points in a segment*/
    changeSegmentPointsIcons: function (points) {
        points.forEach(function (point) {
            var iconType = (point.data.isAccessible == true) ? manager.wayPointSegmentIcon : manager.wayPointInAccessibleConnectedSegmentIcon;
            var icon = mapManager.createPointIcon(iconType, 'waypoint');
            //if (point.type == "waypoint") point.setIcon(icon);
            if (point.type == "waypoint") point.setIcon(icon);
        });
    },

    /*** Get drawing options for lines*/
    getLineOptions: function (isDrawMode) {
        isDrawMode = (typeof isDrawMode == "undefined") ? false : isDrawMode;
        options = {
            stroke: true,
            color: ((isDrawMode) ? "#000" : "#0494de"),
            permission: manager.enableIcons
        };
        return options;

    },

    /*** Save Segment*/
    saveSegment: function (points, polyLine) {
        //manager = this;

        //// Stop any existing request
        //if (manager.currentXHR) {
        //    manager.currentXHR.abort();
        //}

        // Get the data for the reach report
        $.ajax('Map/SaveSegment', {
            type: 'POST',
            data: {
                startPointId: points[0].data.id,
                endPointId: points[1].data.id,
                floorId: 0,//manager.floor[0].id,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                //venueGuid: 0//manager.venueGuid
                externalId: 0
            },
            success: function (data) {
                $(polyLine).on('click', manager.onSegmentClick);
                polyLine.segmentId = data[data.length - 1].id;
                mapManager.removeAllSegments();
                manager.segments = data;
                mapManager.initSegments();

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

    },

    /*** Draw All Segments*/
    initSegments: function () {
        drawPts = [];
        drawSegmentPts = [];
        drawSegments = [];
        manager.rawSegments = manager.segments;
        manager.segments.forEach(function (segment) {

            try {

                var isAccessible = 0;
                // get start pt
                points.forEach(function (point) {
                    if (point.data.id == segment.startPointId) {
                        if (point.data.isAccessible == true) isAccessible++;
                        drawPts.push(point._latlng);
                        drawSegmentPts.push(point);
                    }
                });

                // get end pt
                points.forEach(function (point) {
                    if (point.data.id == segment.endPointId) {
                        if (point.data.isAccessible == true) isAccessible++;
                        drawPts.push(point._latlng);
                        drawSegmentPts.push(point);
                    }
                });

                // draw segment
                if (drawPts.length == 2) {
                    if (isAccessible != 2) {
                        polyline = L.polyline(drawPts, mapManager.getAccessibleLineOptions()).addTo(map).bringToBack();
                    } else {
                        polyline = L.polyline(drawPts, mapManager.getLineOptions(false)).addTo(map).bringToBack();
                    }
                    polyline.data = segment;
                    polyline.type = 'segment';
                    polyline.segmentId = segment.id;
                    polyline.on('click', mapManager.onSegmentClick);
                    drawSegments.push(polyline);
                    mapManager.changeSegmentPointsIcons(drawSegmentPts);
                    drawPts = [];
                    drawSegmentPts = [];
                } else {
                    drawPts = [];
                    drawSegmentPts = [];
                }

            } catch (e) {

            }

        });

        manager.segments = drawSegments;

    },

    /**
    * Click handler for segments, used for removing
    */
    onSegmentClick: function (e) {

        if (manager.isDeleteMode) {
            manager.segmentsToDelete.push(e.target);
            $(e.target._container).hide();
        }

    },

    /*** Get drawing options for dashed inaccessible route lines*/
    getAccessibleLineOptions: function () {

        isDrawMode = (typeof isDrawMode == "undefined") ? false : isDrawMode;

        options = {
            dashArray: "2, 10",
            color: ((isDrawMode) ? "#000" : "#0494de")
        };

        return options;

    },

    /*** Get Zoom, because zoom levels aren't proportional*/
    getZoom: function () {
        zoom = '';
        switch (manager.map.getZoom()) {
            case 18: zoom = .25;
                break;
            case 19: zoom = .5;
                break;
            case 20: zoom = 1;
                break;
            case 21: zoom = 2;
                break;
            case 22: zoom = 4;
                break;
            case 23: zoom = 8;
                break;
        }
        return zoom;
    },

    saveWayPoint: function (layer, isAccessible, poiType) {
        var listOfPoints = [];
        var pointData = {
            annotation: '',
            buildingId: 0,
            category: '',
            createdAt: new Date(),
            customIconImageUrl: '',
            description: '',
            externalId: 0,
            floorId: 0,
            imageUrl: '',
            isAccessible: isAccessible,
            isActive: true,
            isExit: false,
            level: 0,
            latitude: layer.getLatLng().lat,
            longitude: layer.getLatLng().lng,
            maxZoomLevel: -1,
            name: '',
            poiType: poiType,
            portalId: 0,
            updatedAt: new Date(),
            x: 0,
            y: 0,
            zoomLevel: -1
        };
        listOfPoints.push(pointData);
        //$.post("Map/SaveToDb", mapData, function (data) {

        //})
        $.ajax('Map/SaveWayPoint', {
            type: 'POST',
            data: { lstPoints: listOfPoints },
            success: function (data) {
                // Reset points using data returned
                mapManager.removeAllPoints();
                manager.points = data;
                mapManager.initPoints();
                manager.map.removeLayer(layer);

                // Refresh segments
                mapManager.refreshSegments();
            },
            error: function (xhr) {
                // Set error msg
                //var errorMsg = "There was a problem saving waypoint data. Status: " + xhr.status;
                //var flashError = new FlashBang();
                //flashError.msg = errorMsg;
                //flashError.createError();
            }
        });
    },

    /*** Translate local coords back to MSE coords*/
    setPointX: function (x) {
        return x * this.floor[0].width / this.mapWidth;
    },

    /*** Translate local coords back to MSE coords*/
    setPointY: function (y) {
        return y * this.floor[0].height / this.mapHeight;
    },

    /*** Get building point data*/
    getSegmentData: function () {

        manager.segments = [];

        // Get the data for the point
        $.ajax('Map/GetSegmentData', {

            //data: {
            //    floorId: manager.floorId,
            //    venueGuid: manager.venueGuid
            //},
            success: function (data) {
                // set segment data and init
                manager.segments = data;
                mapManager.initSegments();
                manager.mapContainer.trigger('segmentDataReady');
                manager.mapContainer.off('pointDataReady');

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

    },

    /*** Get shape options*/
    getCircleOptions: function (isDrawMode) {

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
    },

    ///*** Remove last Zone from the list, for cancel*/
    //removeLastZone: function () {

    //    if (manager.isZoneAdded) {
    //        lastZone = manager.zones.length - 1;
    //        manager.map.removeLayer(manager.zones[lastZone]);
    //        manager.isAddZoneMode = false;
    //        manager.isZoneAdded = false;
    //    }

    //},

    ///*** Remove last Point from the list, for cancel*/
    //removeLastPoint: function () {
    //    if (manager.isPointAdded) {
    //        lastPoint = manager.points.length - 1;
    //        manager.map.removeLayer(manager.points[lastPoint]);
    //        manager.isAddPointMode = false;
    //        manager.isPointAdded = false;
    //    }
    //},

    /*** Save multiple zones*/
    saveZones: function (zones) {
        zonesData = [];
        zones.forEach(function (zone) {
            coords = manager.map.project(zone._latlng);
            if (manager.supportsGeographicCoordinates == true) {
                latLng = manager.map.unproject(coords);
                x = latLng.lat;
                y = latLng.lng;
            } else {
                x = mapManager.setPointX(coords.x / mapManager.getZoom());
                y = mapManager.setPointY(coords.y / mapManager.getZoom());
            }
            zoneObj = {};
            zoneObj.id = (zone.data === undefined) ? 0 : zone.data.id;
            zoneObj.latitude = x;
            zoneObj.longitude = y;
            zoneObj.radius = zone._mRadius;
            zonesData.push(zoneObj);
        });
        //var zonedata = {
        //    latitude: zone._latlng.lat,
        //    longitude: zone._latlng.lng,
        //    radius: zone._mRadius,
        //}

        // Save the data
        $.ajax('Map/SaveZones', {
            type: 'POST',
            data: { lstZones: zonesData },
            success: function (data) {
                // Reset points using data returned
                manager.isZoneAdded = false;
                mapManager.removeAllZones();
                manager.zones = data;
                mapManager.initZones();
            },
            error: function (xhr) {

                // Set error msg
                //var errorMsg = "There was a problem saving zone data. Status: " + xhr.status;
                //var flashError = new FlashBang();
                //flashError.msg = errorMsg;
                //flashError.createError();
            }
        });

    },

    /*** Get zone data*/
    getZoneData: function () {

        manager.zones = [];

        // Get the data for the point
        $.ajax('Map/GetZoneData', {
            success: function (data) {

                // set segment data and init
                manager.zones = data;
                mapManager.initZones();

            }
            //,
            //error: function (xhr, status, error) {

            //    if (status != 'abort') {

            //        // Set error msg
            //        var errorMsg = "There was a problem getting zone data. Status: " + xhr.status;
            //        var flashError = new FlashBang();
            //        flashError.msg = errorMsg;
            //        flashError.createError();

            //    }

            //}
        });

    },

    initZones: function () {

        drawZones = [];

        //// get zones for correct floor
        //manager.zones.forEach(function (zone) {
        //    manager.zoneMapId = zone.mapId;
        //    return;
        //});

        // draw the zones
        manager.zones.forEach(function (zone) {

            // Add lat/long or xy based on venue supports geocoordinates flag
            if (manager.supportsGeographicCoordinates == true) {
                //coords = new L.LatLng(zone.shape.data.latitude, zone.shape.data.longitude);
                coords = new L.LatLng(zone.latitude, zone.longitude);
            } else {
                //zoneX = mapManager.getPointX(zone.shape.data.latitude * mapManager.getZoom());
                zoneX = mapManager.getPointX(zone.latitude * mapManager.getZoom());
                zoneY = mapManager.getPointY(zone.longitude * mapManager.getZoom());
                coords = manager.map.unproject([zoneX, zoneY]);
            }

            //var radius = (manager.supportsGeographicCoordinates) ? zone.shape.data.radius : zone.shape.data.radius / 3.28084;
            var radius = (manager.supportsGeographicCoordinates) ? zone.radius : zone.radius / 3.28084;
            drawZone = L.circle(coords, radius, mapManager.getCircleOptions()).addTo(manager.drawLayer);
            drawZone.data = zone;
            drawZone.type = 'zone';
            //drawZone.on('click', manager.onZoneClick);
            drawZones.push(drawZone);



        });

        //populate zone data
        manager.zones = drawZones;

        //create the zone list
        //manager.createZonesList();
    },

    ///*** Zone click handler*/
    //MapManager.prototype.onZoneClick = function () {

    //    if (!manager.isAddZoneMode && !manager.isEditMode && !manager.isDeleteMode) {
    //        manager.createZoneForm(this.data.id);
    //        $('.zone-tab').trigger('click');
    //    }

    //}





    /*** Delete multiple points
    * Will either take an array of points or a single pointId*/
    deletePoints: function () {
        pointsData = [];
        manager.pointsToDelete.forEach(function (point) {
            //pointObj = {};
            var pointId = null;
            if (typeof point == 'object') {
                //pointObj.id = point.data.id;
                pointId = point.data.id;
            } else {
                //pointObj.id = point;
                pointId = point;
            }
            pointsData.push(pointId);
        });

        // Delete the data
        $.ajax('Map/DeletePoints', {
            dataType: 'json',
            type: 'POST',
            //data: {
            //    points: pointsData,
            //    floorId: manager.floorId,
            //    venueGuid: manager.venueGuid
            //},
            data: { ids: pointsData },
            success: function (data) {

                // Reset points using data returned
                manager.pointsToDelete = [];
                mapManager.removeAllPoints();
                mapManager.removeAllSegments();
                manager.points = data['points'].Data;
                mapManager.initPoints();

                // Redraw segments
                if (manager.segmentsToDelete <= 0) {
                    manager.segments = manager.rawSegments;
                } else {
                    manager.segments = data['segments'].Data;
                }

                // Init routes
                mapManager.initSegments();

                //Trigger event
                //manager.mapContainer.trigger('pointsDeleted');

            },
            error: function (xhr) {

                //// Set error msg
                //var errorMsg = "There was a problem deleting point data. Status: " + xhr.status;
                //var flashError = new FlashBang();
                //flashError.msg = errorMsg;
                //flashError.createError();

                // Reset points using data returned
                manager.pointsToDelete = [];

            }
        });

    },

    /**
    * Remove All Points
    */
    removeAllPoints: function (isRefresh) {

        isRefresh = (typeof isRefresh == 'undefined') ? false : isRefresh;

        //delete point from the map
        manager.points.forEach(function (point) {
            manager.map.removeLayer(point);
        });

        if (!isRefresh) manager.points = [];

    },

    /**
     * Delete segments
     */
    deleteSegments: function () {

        // check segments to see if it's there to delete
        segmentsData = [];
        manager.segmentsToDelete.forEach(function (deleteSegment) {
            manager.segments.forEach(function (segment) {
                var segId = 0;
                if (segment.segmentId == deleteSegment.segmentId) {
                    //segmentObj = {};
                    //segmentObj.id = deleteSegment.segmentId;
                    //segmentsData.push(segmentObj);
                    segId = deleteSegment.segmentId;
                    if (segmentsData.indexOf(segId) < 0)
                        segmentsData.push(segId);
                }
            });
        });

        // only make delete call if segments exists
        if (segmentsData.length > 0) {

            // Save the data
            $.ajax('Map/DeleteSegment', {
                type: 'POST',
                //data: {
                //    segments: segmentsData,
                //    floorId: manager.floorId,
                //    venueGuid: manager.venueGuid
                //},
                data: { ids: segmentsData },
                success: function (data) {

                    //reset points
                    mapManager.removeAllPoints();
                    manager.points = manager.rawPoints;
                    mapManager.initPoints();

                    // reset segments
                    manager.segmentsToDelete = [];
                    mapManager.removeAllSegments();
                    manager.segments = data;
                    mapManager.initSegments();
                    manager.mapContainer.off('pointsDeleted');

                },
                error: function (xhr) {

                    //// Set error msg
                    //var errorMsg = "There was a problem deleting segments. Status: " + xhr.status;
                    //var flashError = new FlashBang();
                    //flashError.msg = errorMsg;
                    //flashError.createError();

                    // reset segments to delete
                    manager.segmentsToDelete = [];

                }
            });

        }

    },

    /**
    * Remove All Segments
    */
    removeAllSegments: function (isRefresh) {

        isRefresh = (typeof isRefresh == 'undefined') ? false : isRefresh;

        //delete segment from the map
        manager.segments.forEach(function (segment) {
            manager.map.removeLayer(segment);
        });
        if (!isRefresh) manager.segments = [];

    },

    /**
    * Toggle Show/Hide for segments
    */
    toggleSegments : function (action) {

        action = typeof action !== 'undefined' ? action : 'toggle';

        switch (action) {
            case 'toggle':
                manager.points.forEach(function (point) {
                    if (point.type == 'waypoint') {
                        $(point._icon).toggle();
                    }
                });

                manager.segments.forEach(function (segment) {
                    $(segment._container).toggle();
                });

                if (manager.selectedRoute != 0) {
                    manager.toggleRoutes();
                }

                break;
            case 'on':
            case 1:
                manager.points.forEach(function (point) {
                    if (point.type == 'waypoint') {
                        $(point._icon).show();
                    }
                });

                manager.segments.forEach(function (segment) {
                    $(segment._container).show();
                });
                $('#layer-bar form li input#toggle-segments').prop('checked', true);

                break;
            case 'off':
            case 0:
                manager.points.forEach(function (point) {
                    if (point.type == 'waypoint') {
                        $(point._icon).hide();
                    }
                });

                manager.segments.forEach(function (segment) {
                    $(segment._container).hide();
                });
                break;
        }
    },

    /**
     * Remove All Zones
     */
    removeAllZones: function () {

        //delete segment from the map
        manager.zones.forEach(function (zone) {
            manager.map.removeLayer(zone);
        });

        manager.zones = [];

    },

    /**
    * Toggle Show/Hide for zones
    */
    toggleZones : function (action) {

        action = typeof action !== 'undefined' ? action : 'toggle';

        switch (action) {
            case 'toggle':
                manager.zones.forEach(function (zone) {
                    $(zone._container).toggle();
                });

                break;
            case 'on':
            case 1:
                manager.zones.forEach(function (zone) {
                    $(zone._container).show();
                });
                break;
            case 'off':
            case 0:
                manager.zones.forEach(function (zone) {
                    $(zone._container).hide();
                });
                break;
        }

    },

    /**
    * Refresh segments
    */
    refreshSegments: function () {

        if (manager.segments.length > 0) {
            mapManager.removeAllSegments();
            manager.segments = manager.rawSegments;
            mapManager.initSegments();
        }

    },

    /**
    * Delete multiple zones,
    * Will either take an array of zones or a single zoneId
    */
    deleteZones: function () {

        zonesData = [];

        manager.zonesToDelete.forEach(function (zone) {
            //zoneObj = {};
            var zoneId = null;
            if (typeof zone == 'object') {
                //zoneObj.id = zone.data.id;
                zoneId = zone.data.id;
            } else {
                //zoneObj.id = zone;
                zoneId = zone;
            }
            zonesData.push(zoneId);
        });

        // Delete the data
        $.ajax('Map/DeleteZones', {
            type: 'POST',
            //data: {
            //    zones: zonesData,
            //    buildingId: manager.buildingId,
            //    venueGuid: manager.venueGuid,
            //    mapName: manager.mapName
            //},
            data: { ids: zonesData },
            success: function (data) {
                // Reset points using data returned
                manager.zonesToDelete = [];
                mapManager.removeAllZones();
                manager.zones = data;
                mapManager.initZones();
            },
            error: function (xhr) {
                manager.zonesToDelete = [];

                // Set error msg
                //var errorMsg = "There was a problem deleting zone data. Status: " + xhr.status;
                //var flashError = new FlashBang();
                //flashError.msg = errorMsg;
                //flashError.createError();

            }
        });

    },

    /**
    * Toggle Show/Hide for zones
    */
    toggleZones: function (action) {
        action = typeof action !== 'undefined' ? action : 'toggle';

        switch (action) {
            case 'toggle':
                manager.zones.forEach(function (zone) {
                    $(zone._container).toggle();
                });

                break;
            case 'on':
            case 1:
                manager.zones.forEach(function (zone) {
                    $(zone._container).show();
                });
                break;
            case 'off':
            case 0:
                manager.zones.forEach(function (zone) {
                    $(zone._container).hide();
                });
                break;
        }

    },

    /**
     * Toggle Show/Hide for segments
     */
    toggleSegments: function (action) {

        action = typeof action !== 'undefined' ? action : 'toggle';

        switch (action) {
            case 'toggle':
                manager.points.forEach(function (point) {
                    if (point.type == 'waypoint') {
                        $(point._icon).toggle();
                    }
                });

                manager.segments.forEach(function (segment) {
                    $(segment._container).toggle();
                });

                if (manager.selectedRoute != 0) {
                    manager.toggleRoutes();
                }

                break;
            case 'on':
            case 1:
                manager.points.forEach(function (point) {
                    if (point.type == 'waypoint') {
                        $(point._icon).show();
                    }
                });

                manager.segments.forEach(function (segment) {
                    $(segment._container).show();
                });
                $('#layer-bar form li input#toggle-segments').prop('checked', true);

                break;
            case 'off':
            case 0:
                manager.points.forEach(function (point) {
                    if (point.type == 'waypoint') {
                        $(point._icon).hide();
                    }
                });

                manager.segments.forEach(function (segment) {
                    $(segment._container).hide();
                });
                break;
        }
    },

    /**
    * Toggle Show/Hide for routes
    */
    toggleRoutes: function () {
        if (manager.selectedRoute != 0) {
            if (manager.map) {
                manager.map.removeLayer(manager.selectedRoute);
            }
            mapManager.toggleSegments('on');
            manager.selectedRoute = 0;
        }
    },

    savePoints: function (points) {

        pointsData = [];
        points.forEach(function (point) {
            coords = manager.map.project(point._latlng);
            pointObj = {};
            pointObj.id = point.data.id;
            pointObj.floorId = manager.floorId;
            pointObj.level = 0;//manager.floor[0].level;
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
                pointObj.x = mapManager.setPointX(coords.x / mapManager.getZoom());
                pointObj.y = mapManager.setPointY(coords.y / mapManager.getZoom());
            }

            pointObj.annotation = '';
            pointObj.category = '';
            pointObj.createdAt = new Date();
            pointObj.customIconImageUrl = '';
            pointObj.description = '';
            pointObj.externalId = 0;
            pointObj.imageUrl = '';
            pointObj.isActive = true;
            pointObj.isExit = false;
            pointObj.maxZoomLevel = -1;
            pointObj.name = '';
            pointObj.poiType = (point.type == 'poi') ? 1 : 0;
            pointObj.portalId = 0;
            pointObj.updatedAt = new Date();
            pointObj.zoomLevel = -1

            pointsData.push(pointObj);
        });

        // Save the data
        $.ajax('Map/SaveWayPoint', {
            type: 'POST',
            //data: {
            //    points: pointsData,
            //    floorId: manager.floorId,
            //    venueGuid: manager.venueGuid
            //},
            data: { lstPoints: pointsData },
            success: function (data) {

                // Reset points using data returned
                mapManager.removeAllPoints();
                manager.points = data;
                mapManager.initPoints();

                // Refresh segments
                mapManager.refreshSegments()

            }
            //,
            //error: function (xhr, status, error) {

            //    // Set error msg
            //    var errorMsg = "There was a problem saving point data. Status: " + xhr.status;
            //    var flashError = new FlashBang();
            //    flashError.msg = errorMsg;
            //    flashError.createError();

            //}
        });

    },

    /**
     * Remove All Routes
     */
    removeAllRoutes: function () {

        try {

            //delete routes from the map
            manager.routes.forEach(function (route) {
                manager.map.removeLayer(route.data);
            });

            manager.routes = [];

        } catch (e) {

            console.log('error removing routes');

        }

    },

    /*** Get building rectangle data*/
    getRectangleData: function () {

        manager.rectangles = [];

        // Get the data for the point
        $.ajax('Map/GetRectangleData', {
            success: function (data) {
                // set segment data and init
                manager.rectangles = data;
                mapManager.initRectangles();
                manager.mapContainer.trigger('rectangleDataReady');
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

    },

    initRectangles: function () {
        //// define rectangle geographical bounds
        //var bounds = [[-13.062677562236786, 23.437677562236786], [-7.937677562236786, 29.562677562236786]];
        ////var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];

        //// create an orange rectangle
        //L.rectangle(bounds, { color: "#0494de", weight: 3 }).addTo(manager.drawLayer);

        drawRectangles = [];

        // draw the Rectangles
        manager.rectangles.forEach(function (rectangle) {

            //var radius = (manager.supportsGeographicCoordinates) ? zone.shape.data.radius : zone.shape.data.radius / 3.28084;
            var bounds = [[rectangle.northEast.latitude, rectangle.northEast.longitude], [rectangle.southWest.latitude, rectangle.southWest.longitude]];
            drawRectangle = L.rectangle(bounds, { color: "#0494de", weight: 3 }).addTo(manager.drawLayer);
            drawRectangle.data = rectangle;
            drawRectangle.type = 'rectangle';
            //drawZone.on('click', manager.onZoneClick);
            drawRectangles.push(drawRectangle);
        });

        //populate zone data
        manager.rectangles = drawRectangles;
    },

    saveRectangles: function (rectangles) {
        rectanglesData = [];
        rectangles.forEach(function (rectangle) {
            rectangleObj = {};
            rectangleObj.id = (rectangle.data === undefined) ? 0 : rectangle.data.id;
            rectangleObj.northEastLatitude = rectangle._latlngs[2].lat;
            rectangleObj.northEastLongitude = rectangle._latlngs[2].lng;
            rectangleObj.southWestLatitude = rectangle._latlngs[0].lat;
            rectangleObj.southWestLongitude = rectangle._latlngs[0].lng;
            rectanglesData.push(rectangleObj);
        });

        // Save the data
        $.ajax('Map/SaveRectangles', {
            type: 'POST',
            data: { lstRectangles: rectanglesData },
            success: function (data) {
                // Reset points using data returned
                manager.isRectangleAdded = false;
                mapManager.removeAllRectangles();
                manager.rectangles = data;
                mapManager.initRectangles();
            },
            error: function (xhr) {
                // Set error msg
                //var errorMsg = "There was a problem saving rectangle data. Status: " + xhr.status;
                //var flashError = new FlashBang();
                //flashError.msg = errorMsg;
                //flashError.createError();
            }
        });
    },

    removeAllRectangles: function () {

        //delete segment from the map
        manager.rectangles.forEach(function (rectangle) {
            manager.map.removeLayer(rectangle);
        });

        manager.rectangles = [];

    },

    /**
   * Delete multiple Rectangles,
   * Will either take an array of Rectangles or a single rectangleId
   */
    deleteRectangles: function () {

        rectanglesData = [];

        manager.rectanglesToDelete.forEach(function (rectangle) {
            //zoneObj = {};
            var rectangleId = null;
            if (typeof rectangle == 'object') {
                //zoneObj.id = zone.data.id;
                rectangleId = rectangle.data.id;
            } else {
                //zoneObj.id = zone;
                rectangleId = rectangle;
            }
            rectanglesData.push(rectangleId);
        });

        // Delete the data
        $.ajax('Map/DeleteRectangles', {
            type: 'POST',
            data: { ids: rectanglesData },
            success: function (data) {
                // Reset points using data returned
                manager.rectanglesToDelete = [];
                mapManager.removeAllRectangles();
                manager.rectangles = data;
                mapManager.initRectangles();
            },
            error: function (xhr) {
                manager.rectanglesToDelete = [];

                // Set error msg
                //var errorMsg = "There was a problem deleting zone data. Status: " + xhr.status;
                //var flashError = new FlashBang();
                //flashError.msg = errorMsg;
                //flashError.createError();

            }
        });

    },
}