MapGoogleOverlay.prototype = new google.maps.OverlayView();

function MapGoogleOverlay(bounds, mapUrl, map, mapManager) {

    this.mapManager = mapManager;
    this.map = map;
    this.mapUrl = mapUrl;
    this.bounds = bounds;
    this.boundBox = null;
    this.imageContainer = null;
    this.overlayImage = null;
    this.markerTL = null;
    this.markerTR = null;
    this.markerBL = null;
    this.markerBR = null;
    this.markerPortalTR = null;
    this.markerPortalBL = null;
    this.setMap(map);
    this.topLeft = '';
    this.topRight = '';
    this.bottomLeft = '';
    this.bottomRight = '';
    this.portalTopRight = '';
    this.portalBottomLeft = '';
    this.draggable = false;

}

MapGoogleOverlay.prototype.onAdd = function() {

    var _this = this;

    // Create bounding box
    this.boundBox = document.createElement('div');
//    this.boundBox.style.borderColor = 'red';
//    this.boundBox.style.borderStyle = 'solid';
//    this.boundBox.style.borderWidth = '1px';
    this.boundBox.style.position = 'relative';
    this.boundBox.style.opacity = '0.7';

    // Create bounding box
    this.imageContainer = document.createElement('div');
//    this.imageContainer.style.borderColor = 'blue';
//    this.imageContainer.style.borderStyle = 'solid';
//    this.imageContainer.style.borderWidth = '1px';
    this.imageContainer.style.position = 'relative';
    this.imageContainer.style.opacity = '0.7';
    this.imageContainer.style.width = this.mapManager.svgWidth.toString()+'px';
    this.imageContainer.style.height = this.mapManager.svgHeight.toString()+'px';

    // Add TL pt
    var handle1 = document.createElement('div');
    $(handle1).addClass('handle tl');
    $(handle1).html('TL');
    this.imageContainer.appendChild(handle1);

    // Add TR pt
    var handle2 = document.createElement('div');
    $(handle2).addClass('handle tr');
    $(handle2).html('TR');
    this.imageContainer.appendChild(handle2);

    // Add Portal TR pt
    var handle2a = document.createElement('div');
    $(handle2a).addClass('phandle tr');
    this.boundBox.appendChild(handle2a);

    // Add BL pt
    var handle3 = document.createElement('div');
    $(handle3).addClass('handle bl');
    $(handle3).html('BL');
    this.imageContainer.appendChild(handle3);

    // Add Portal BL pt
    var handle3a = document.createElement('div');
    $(handle3a).addClass('phandle bl');
    this.boundBox.appendChild(handle3a);

    // Add BR pt
    var handle4 = document.createElement('div');
    $(handle4).addClass('handle br');
    $(handle4).html('BR');
    this.imageContainer.appendChild(handle4);

    // Create the overlay image
    this.overlayImage = document.createElement('img');
    this.overlayImage.src = this.mapUrl;
    this.overlayImage.style.width = "100%";
    this.overlayImage.style.height = "100%";
    this.overlayImage.style.position = 'absolute';

    // Add the children
    this.imageContainer.appendChild(this.overlayImage);
    this.boundBox.appendChild(this.imageContainer);

    // Create new bounds for boundbox using the dimensions of the svg image relative to center of the center of the map
    if (this.mapManager.isMapSet == false) {
        var overlayProjection = this.getProjection();
        var boundBoxCenter = overlayProjection.fromLatLngToContainerPixel(this.bounds.getCenter());
        var imageTopRightPt = new google.maps.Point(boundBoxCenter.x + this.mapManager.svgWidth / 2, boundBoxCenter.y - this.mapManager.svgHeight / 2);
        var imageBottomLeftPt = new google.maps.Point(boundBoxCenter.x - this.mapManager.svgWidth / 2, boundBoxCenter.y + this.mapManager.svgHeight / 2);
        var imageTopRight = overlayProjection.fromDivPixelToLatLng(imageTopRightPt);
        var imageBottomLeft = overlayProjection.fromDivPixelToLatLng(imageBottomLeftPt);
        this.bounds = new google.maps.LatLngBounds(imageBottomLeft, imageTopRight);
    }

    // Add bounding box to map panes
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.boundBox);

    this.markerTR = new google.maps.Marker({
        position: this.bounds.getCenter(),
        map: this.map,
        title: 'TR',
        visible: true
    });

    this.markerTL = new google.maps.Marker({
        position: this.bounds.getCenter(),
        map: this.map,
        title: 'TL',
        visible: true
    });

    this.markerBL = new google.maps.Marker({
        position: this.bounds.getCenter(),
        map: this.map,
        title: 'BL',
        visible: true
    });

    this.markerPortalTR = new google.maps.Marker({
        position: this.bounds.getCenter(),
        map: this.map,
        title: 'Portal TR',
        visible: false
    });

    this.markerPortalBL = new google.maps.Marker({
        position: this.bounds.getCenter(),
        map: this.map,
        title: 'Portal BL',
        visible: false
    });

    this.markerBR = new google.maps.Marker({
        position: this.bounds.getCenter(),
        map: this.map,
        title: 'BR',
        visible: true
    });

    var userZoom = true;
    google.maps.event.addListener(this.map, 'zoom_changed', function() {
        if (userZoom) {
            setTimeout(function() {
                _this.draw()
            }, 450);
        }
        userZoom = true;
    });

    // Init draggable
    $(this.boundBox).draggable({
        drag: function(event, ui) {
            _this.draw(true);
            var xPos = ui.position.left;
            var yPos = ui.position.top;
            $(_this.boundBox).css("transform", "translate("+xPos+","+yPos+")");
        },
        disabled: 'true',
        helper: "original"
    });

    // Trigger ready event
    $(this).trigger('ready');

};

MapGoogleOverlay.prototype.toggleDraggableMap = function(){

    this.draggable = !this.draggable;
    var enabled = (this.draggable) ? 'enable' : 'disable';
    $(this.boundBox).draggable(enabled);

};

MapGoogleOverlay.prototype.draw = function(isUpdate) {

    isUpdate = typeof isUpdate == 'undefined' ? false : isUpdate;
    if (!isUpdate){

        // Position the boundbox
        var topRight = this.getProjection().fromLatLngToDivPixel(this.bounds.getNorthEast());
        var bottomLeft = this.getProjection().fromLatLngToDivPixel(this.bounds.getSouthWest());

        this.boundBox.style.left = bottomLeft.x + 'px';
        this.boundBox.style.top = topRight.y + 'px';
        this.boundBox.style.width = (topRight.x - bottomLeft.x) + 'px';
        this.boundBox.style.height = (bottomLeft.y - topRight.y) + 'px';

        // Get coords of boundbox
        this.imageContainer.style.width =  this.boundBox.style.width;
        this.imageContainer.style.height = this.boundBox.style.height;

    }

    // Need to account for modal window overlay by getting offset
    var tr = $(".handle.tr").offset();
    var xOffset = $('#map-position-modal .modal-body').offset().left;
    var yOffset = $('#map-position-modal .modal-body').offset().top;

    // Top Right
    var trPt = new google.maps.Point(parseFloat(tr.left - xOffset), parseFloat((tr.top - yOffset)));
    var trLatLng = this.getProjection().fromContainerPixelToLatLng(trPt);
    this.markerTR.setPosition(trLatLng);

    // Portal Top Right
    var ptr = $(".phandle.tr").offset();
    var ptrPt = new google.maps.Point(parseFloat(ptr.left - xOffset), parseFloat(ptr.top - yOffset));
    var ptrLatLng = this.getProjection().fromContainerPixelToLatLng(ptrPt);
    this.markerPortalTR.setPosition(ptrLatLng);

    // Top Left
    var tl = $(".handle.tl").offset();
    var tlPt = new google.maps.Point(parseFloat(tl.left - xOffset), parseFloat((tl.top - yOffset)));
    var tlLatLng = this.getProjection().fromContainerPixelToLatLng(tlPt);
    this.markerTL.setPosition(tlLatLng);

    // Bottom Left
    var bl = $(".handle.bl").offset();
    var blPt = new google.maps.Point(parseFloat(bl.left - xOffset), parseFloat(bl.top - yOffset));
    var blLatLng = this.getProjection().fromContainerPixelToLatLng(blPt);
    this.markerBL.setPosition(blLatLng);

    // Bottom Right
    var br = $(".handle.br").offset();
    var brPt = new google.maps.Point(parseFloat(br.left - xOffset), parseFloat(br.top - yOffset));
    var brLatLng = this.getProjection().fromContainerPixelToLatLng(brPt);
    this.markerBR.setPosition(brLatLng);

    // Portal Bottom Right
    var pbl = $(".phandle.bl").offset();
    var pblPt = new google.maps.Point(parseFloat(pbl.left - xOffset), parseFloat(pbl.top - yOffset));
    var pblLatLng = this.getProjection().fromContainerPixelToLatLng(pblPt);
    this.markerPortalBL.setPosition(pblLatLng);

    // Set coord values
    this.topLeft = tlLatLng;
    this.topRight = trLatLng;
    this.bottomLeft = blLatLng;
    this.bottomRight = brLatLng;
    this.portalTopRight = ptrLatLng;
    this.portalBottomLeft = pblLatLng;

    $('#topLeft').html('TL:'+this.topLeft.toString());
    $('#topRight').html('TR:'+this.topRight.toString());
    $('#bottomLeft').html('BL:'+this.bottomLeft.toString());
    $('#bottomRight').html('BR:'+this.bottomRight.toString());

};

MapGoogleOverlay.prototype.onRemove = function() {
    this.boundBox.parentNode.removeChild(this.boundBox);
    this.boundBox = null;
};
