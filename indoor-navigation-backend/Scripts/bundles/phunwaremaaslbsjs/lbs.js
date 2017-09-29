var mapManager;
var mapRefsSetter;
var currentXHR;

var currentVenue, currentBuilding, currentLevel;

$(function () {

    // Catch the click event on the compose button
    $('.button-map-editor').on('click', function (e) {
        e.preventDefault();
        toggleMapEditorWindow();
    });

    var handlers = "#add-point, #pull-tab, .point-link, #add-point-cancel-btn, #add-zone-cancel-btn, #add-point-back, " +
        "#add-zone-back, .point-edit, .point-delete, .zone-edit, .zone-delete, #draw-routes, .zone-link," +
        ".route-link, #toggle-poi, #toggle-segments, #toggle-zones, #toggle-routes, #reset-routes, .add-icon-type-field," +
        ".remove-icon-type-field, #update-routes";

    // Map UI Event handler
    $("#dashboard-main-map-editor-container").on("click", handlers,

        function (e) {

            var target = '';
            if (e.currentTarget.id.toLowerCase() != '') {
                target = e.currentTarget.id.toLowerCase();
            } else {
                target = e.currentTarget.className.toLowerCase();
            }

            if (target != 'toggle-poi' &&
                target != 'toggle-segments' &&
                target != 'toggle-zones' &&
                target != 'toggle-routes')

                e.preventDefault();

            switch (target) {
                case 'add-point':
                    mapManager.toggleRoutes();
                    mapManager.toggleAddPoints();
                    $('#add-point').toggleClass('button-blue-selected');
                    break;

                case 'pull-tab':
                    mapOverlay = $('#map-overlay');
                    if (mapManager.overlayState == 'closed') {
                        mapOverlay.css('right', '0px');
                        mapOverlay.find('#pull-tab i').removeClass('icon-chevron-left').addClass('icon-chevron-right');
                        mapOverlay.find('#pull-tab i').removeClass('icon-chevron-left').addClass('icon-chevron-right');
                        mapManager.overlayState = 'open';
                        $('#routes-list, #point-list, #zones-list').show();
                        $('.points-tab').trigger('click');
                    } else {
                        $('#routes-list, #point-list, #zones-list').hide();
                        mapOverlay.css('right', '-350px');
                        mapOverlay.find('#pull-tab i').removeClass('icon-chevron-right').addClass('icon-chevron-left');
                        mapManager.overlayState = 'closed';
                    }
                    break;

                case 'add-point-back':
                case 'add-point-cancel-btn':
                    $('#point-form-container').fadeOut('fast', function () {
                        if (mapManager.isPointChanged) {
                            getPointList(mapManager.floorId);
                        } else {
                            $('#point-list-container').fadeIn();
                        }
                        mapManager.isPointChanged = false;
                        if (mapManager.isPointAdded) mapManager.removeLastPoint();
                    });
                    break;

                case 'add-zone-back':
                case 'add-zone-cancel-btn':
                    $('#zones-form-container').fadeOut('fast', function () {
                        if (mapManager.isZoneChanged) {
                            getZoneList(mapManager.venueGuid, mapManager.buildingId);
                        } else {
                            $('#zones-list-container').fadeIn();
                        }
                        mapManager.isZoneChanged = false;
                        if (mapManager.isZoneAdded) mapManager.removeLastZone();
                    });
                    break;

                case 'point-edit':
                    mapManager.toggleRoutes();
                    pointId = $(this).data('pointid');
                    mapManager.createPointForm(pointId);
                    break;

                case 'point-delete':
                    mapManager.toggleRoutes();
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this map point?")) {
                        pointId = $(this).data('pointid');
                        manager.pointsToDelete.push(pointId);
                        mapManager.deletePoints();
                    }
                    break;

                case 'zone-edit':
                    mapManager.toggleRoutes();
                    zoneId = $(this).data('zoneid');
                    mapManager.createZoneForm(zoneId);
                    break;

                case 'zone-delete':
                    mapManager.toggleRoutes();
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this zone?")) {
                        zoneId = $(this).data('zoneid');
                        mapManager.zonesToDelete.push(zoneId);
                        mapManager.deleteZones();
                    }
                    break;

                case 'point-link':
                    mapManager.toggleRoutes();
                    pointId = $(this).find('a').data('pointid');
                    mapManager.centerOnPoint(pointId, false);
                    break;

                case 'zone-link':
                    mapManager.toggleRoutes();
                    zoneId = $(this).find('a').data('zoneid');
                    mapManager.centerOnZone(zoneId);
                    break;

                case 'toggle-segments':
                    mapManager.toggleSegments();
                    break;

                case 'toggle-zones':
                    manager.toggleRoutes('off');
                    mapManager.toggleZones();
                    break;

                case 'toggle-routes':
                    mapManager.toggleRoutes();
                    break;

                case 'reset-routes':
                    manager.toggleRoutes();
                    routeConfirm = confirm('Are you sure you want to reset all routes?');
                    if (routeConfirm == true) {
                        mapManager.resetRoutes();
                    }
                    break;

                default:
                // do nothing
            }

        });

    // Level select on change handler
    $('#dashboard-main-map-editor-container').on('change', '#level-select, #venue-select, #building-select, #zone-cooldown-hours, #zone-cooldown-mins', function (e) {

        e.preventDefault();
        var target = '';

        if (e.currentTarget.id.toLowerCase() != '') {
            target = e.currentTarget.id.toLowerCase();
        } else {
            target = e.currentTarget.className.toLowerCase();
        }

        switch (target) {

            case 'venue-select':

                if (mapManager.confirmLeaving()) {
                    id = $(this).val();

                    // store selected venue
                    if (isLocalStorage()) {
                        localStorage.setItem('lbsSelectedVenueId', id);
                    }

                    mapManager.mapContainer.fadeOut('fast', function () {
                        openMapEditorWindow(id);
                    });

                    // clear map interval
                    if (mapManager.checkRouteInterval != null) {
                        clearInterval(mapManager.checkRouteInterval);
                        mapManager.checkRouteInterval = null;
                    }
                } else {
                    // Reset dropdown
                    $(this).val(currentVenue);
                }
                break;

            case 'building-select':

                if (mapManager.confirmLeaving()) {
                    id = $(this).val();
                    venueGuid = $('#venue-select').val();

                    // store selected building
                    if (isLocalStorage()) {
                        localStorage.setItem('lbsSelectedBuildingId', id);
                    }

                    // clear map interval
                    if (mapManager.checkRouteInterval != null) {
                        clearInterval(mapManager.checkRouteInterval);
                        mapManager.checkRouteInterval = null;
                    }

                    mapManager.mapContainer.fadeOut('fast', function () {
                        openMapEditorWindow(venueGuid, id);
                    });
                } else {
                    // Reset dropdown
                    $(this).val(currentBuilding);
                }
                break;

            case 'level-select':

                if (mapManager.confirmLeaving()) {
                    id = $(this).val();
                    mapManager.hasRouteDeeplink = false;

                    //empty lists
                    $('#routes-list ul, #point-list, #zones-list').empty();

                    // store selected building
                    if (isLocalStorage()) {
                        localStorage.setItem('lbsSelectedLevelId', id);
                    }

                    // clear map interval
                    if (mapManager.checkRouteInterval != null) {
                        clearInterval(mapManager.checkRouteInterval);
                        mapManager.checkRouteInterval = null;
                    }

                    currentLevel = id;
                    mapManager.mapContainer.fadeOut('fast', function () {
                        mapManager.init(id);
                        $(this).fadeIn();
                    });
                } else {
                    // Reset dropdown
                    $(this).val(currentLevel);
                }
                break;

            case 'zone-cooldown-mins':
            case 'zone-cooldown-hours':

                var hours = $('#zone-cooldown-hours').val();
                var mins = $('#zone-cooldown-mins').val();
                cooldown = parseInt(hours * 60) + parseInt(mins);
                $('#zone_save_coolDown').val(cooldown);
        }

    });

    $('#map-position-modal').on('shown', function () {

        var mapOptions = {
            zoom: 18,
            minZoom: 12,
            maxZoom: 21,
            panControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            center: new google.maps.LatLng(mapManager.data.map.latitude, mapManager.data.map.longitude)
        };

        var mapRefsSetterOptions = {
            mapManager: mapManager,
            mapOptions: mapOptions,
            mapContainer: 'gmap-container'
        };

        mapRefsSetter = new MapRefSetter(mapRefsSetterOptions);
        mapRefsSetter.init();

    });

    $('#saveMapReferencePts').on('click', function (e) {

        try {

            // update all values before saving
            mapRefsSetter.updateScaleValue();

            e.preventDefault();

            // Stop any existing request
            if (currentXHR) {
                currentXHR.abort();
            }

            // Get the data for the reach report
            currentXHR = $.ajax('/lbs/ajax/map/referencePts/' + mapManager.floorId + '/add', {
                data: {
                    topRight: mapRefsSetter.mapOverlay.topRight.toString(),
                    topLeft: mapRefsSetter.mapOverlay.topLeft.toString(),
                    bottomRight: mapRefsSetter.mapOverlay.bottomRight.toString(),
                    bottomLeft: mapRefsSetter.mapOverlay.bottomLeft.toString(),
                    portalBottomLeft: mapRefsSetter.mapOverlay.portalBottomLeft.toString(),
                    portalTopRight: mapRefsSetter.mapOverlay.portalTopRight.toString(),
                    rotation: mapRefsSetter.rotation,
                    venueGuid: manager.venueGuid
                },
                success: function (data) {

                    $('#map-position-modal').modal('hide');
                    var flashSuccess = new FlashBang();
                    flashSuccess.msg = data;
                    flashSuccess.createSuccess();

                    //reset the map
                    mapManager.resetMap();
                    resetMap(mapManager.venueGuid, mapManager.buildingId, mapManager.floorId);

                    // output coords to console
                    console.log('topRight:' + mapRefsSetter.mapOverlay.topRight.toString(),
                        'topLeft:' + mapRefsSetter.mapOverlay.topLeft.toString(),
                        'bottomRight:' + mapRefsSetter.mapOverlay.bottomRight.toString(),
                        'bottomLeft:' + mapRefsSetter.mapOverlay.bottomLeft.toString());

                },
                error: function (xhr, status, error) {

                    if (status != 'abort') {

                        // Set error msg
                        var errorMsg = "There was a problem getting point data. Status: " + xhr.status;
                        if (xhr.responseText) errorMsg = jQuery.parseJSON(xhr.responseText).message;
                        if (status != 'abort') {
                            var flashError = new FlashBang();
                            flashError.msg = errorMsg;
                            flashError.createError();
                        }

                    }

                }
            });

        } catch (e) {
            console.log(e)
        }

    });

});

function resetMap(venueGuid, buildingId, floorId) {

    // Get the data for the reach report
    currentXHR = $.ajax('/lbs/building-data.json', {

        data: {
            venueGuid: venueGuid,
            buildingId: buildingId
        },

        success: function (data) {

            mapManager = new MapManager(data.map);

            if (floorId) {
                mapManager.init(floorId);
            } else {
                mapManager.init();
            }

        },
        error: function (xhr, status, error) {

            if (status != 'abort') {

                // Set error msg
                var errorMsg = "There was a problem initializing the map editor. Status: " + xhr.status;
                if (xhr.responseText) errorMsg = jQuery.parseJSON(xhr.responseText).message;
                if (status != 'abort') {
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();
                }

            }

        }
    });

}


/**
 * Toggles the open/close state of the map editor window.
 */
function toggleMapEditorWindow() {

    var editorWindow = $('#dashboard-main-map-editor-container');
    if (!editorWindow.data('status')) {
        openMapEditorWindow();
    } else {
        closeMapEditorWindow();
    }

}

/**
 * Open map editor window.
 */
function openMapEditorWindow(venueGuid, buildingId, floorId) {

    // Set buildingId and floorId defaults
    buildingId = (typeof buildingId == 'undefined') ? '' : buildingId;
    floorId = (typeof floorId == 'undefined') ? '' : floorId;

    // Stop any existing request
    if (currentXHR) {
        currentXHR.abort();
    }

    // Get the data for the reach report
    currentXHR = $.ajax('/lbs/building-data.json', {

        data: {
            venueGuid: venueGuid,
            buildingId: buildingId
        },

        success: function (data) {

            // Change the compose button status
            $('.button-map-editor')
                .addClass('button-compose-selected')
                .removeClass('button-compose');

            // Fade the main content out
            $('#dashboard-main-content-container').fadeOut();
            $('#dashboard-main-map-editor-container').html(data.html);

            // Grab some state from the HTML
            currentVenue = $('#venue-select').val();
            currentBuilding = $('#building-select').val();
            currentLevel = $('#level-select').val();

            // Create the map manager and switch to floor if present
            mapManager = new MapManager(data.map);

            if (floorId) {
                mapManager.init(floorId);
            } else {
                mapManager.init();
            }

            // Fade in and position map
            $(mapManager.mapContainer).fadeIn();
            $(mapManager.mapContainer).on('mapReady', function () {
                $('#dashboard-main-map-editor-container')
                    .data('status', 'open')
                    .css('margin-left', '0')
            });

            // Set floor drop down
            if (floorId) {
                $('#level-select').val(floorId);
            }

            // Set listeners for updating routes
            $(mapManager.mapContainer).on('updateRoutesReady', function () {
                $('#update-routes').removeClass('button-selected').addClass('button-blue');
            });

            $(mapManager.mapContainer).on('updateRoutesDisable', function () {
                $('#update-routes').removeClass('button-blue').addClass('button-selected')
            });

        },
        error: function (xhr, status, error) {

            if (status != 'abort') {

                // Set error msg
                var errorMsg = "There was a problem initializing the map editor. Status: " + xhr.status;
                if (xhr.responseText) errorMsg = jQuery.parseJSON(xhr.responseText).message;
                if (status != 'abort') {
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();
                }

            }

        }
    });

}


/**
 * Get Point list
 */
function getPointList(floorId) {

    // Stop any existing request
    if (currentXHR) {
        currentXHR.abort();
    }

    // Get the data for the reach report
    currentXHR = $.ajax('/lbs/ajax/points-data.json', {
        data: {
            floorId: floorId,
            venueGuid: manager.venueGuid
        },
        success: function (data) {

            mapManager.removeAllPoints();
            mapManager.points = data;
            mapManager.initPoints(data);
            mapManager.createPointList();
            mapManager.refreshSegments();

            $('#point-list-container').fadeIn();

        },
        error: function (xhr, status, error) {

            if (status != 'abort') {

                // Set error msg
                var errorMsg = "There was a problem getting point data. Status: " + xhr.status;
                if (xhr.responseText) errorMsg = jQuery.parseJSON(xhr.responseText).message;
                if (status != 'abort') {
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();
                }

            }

        }
    });
}

/**
 * Get Zone list
 */
function getZoneList(venueGuid, buildingId) {

    // Stop any existing request
    if (currentXHR) {
        currentXHR.abort();
    }

    // Get the data for the zones
    currentXHR = $.ajax('/lbs/ajax/zone-data.json', {
        data: {
            venueGuid: venueGuid,
            buildingId: buildingId,
            mapName: manager.mapName
        },
        success: function (data) {

            mapManager.removeAllZones();
            manager.zones = data;
            mapManager.initZones();
            mapManager.createZonesList();
            $('#zones-list-container').fadeIn();

        },
        error: function (xhr, status, error) {

            if (status != 'abort') {

                // Set error msg
                var errorMsg = "There was a problem getting zone data. Status: " + xhr.status;
                if (xhr.responseText) errorMsg = jQuery.parseJSON(xhr.responseText).message;
                if (status != 'abort') {
                    var flashError = new FlashBang();
                    flashError.msg = errorMsg;
                    flashError.createError();
                }

            }

        }
    });

}

/**
 * Close map editor window.
 */
function closeMapEditorWindow() {

    // Confirm that the user actually wants to exit
    if (!mapManager.confirmLeaving()) return;

    // Change the compose button status
    $('.button-map-editor')
        .addClass('button-compose')
        .removeClass('button-compose-selected');

    // Slide out the window
    $('#dashboard-main-map-editor-container')
        .removeData('status')
        .css('margin-left', '-2000px')
        .on('transitionend', function () {
            $(this).off('transitionend');
            mapManager.resetMap();
        })

    // Fade the main content in
    $('#dashboard-main-content-container').stop().delay(200).fadeIn();

}

