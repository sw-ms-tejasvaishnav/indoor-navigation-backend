function MapRefSetter(options) {

    this.mapOverlay = null;
    this.map = null;
    this.mapManager = options.mapManager;
    this.mapContainer = options.mapContainer;
    this.mapUrl = options.mapManager.svgUrl;
    this.mapOptions = options.mapOptions;
    this.trRefPt = null;
    this.blRefPt = null;
    this.rotation = 0;
    this.scale = 1;
    this.alpha = .7;
    this.mapType = 'road';

}

$(function() {

    MapRefSetter.prototype.init = function() {

        this.map = new google.maps.Map(document.getElementById(this.mapContainer), this.mapOptions);
        this.map.setTilt(0);
        this.createBoundBox();
        this.createUI();

    };

    MapRefSetter.prototype.createBoundBox = function() {

        var _this = this;

        // Set the initial bounds
        if (this.mapManager.mapReferencePts != null) {
            this.trRefPt = new google.maps.LatLng(_this.mapManager.mapReferencePts.topRight.lat, _this.mapManager.mapReferencePts.topRight.lng);
            this.blRefPt = new google.maps.LatLng(_this.mapManager.mapReferencePts.bottomLeft.lat, _this.mapManager.mapReferencePts.bottomLeft.lng);
            this.rotation = this.mapManager.mapReferencePts.rotation;
        } else {
            var errorMsg = "This building has no location data.";
            var flashError = new FlashBang();
            flashError.msg = errorMsg;
            flashError.createError();
        }

        var bounds = new google.maps.LatLngBounds(this.blRefPt, this.trRefPt);
        this.map.fitBounds(bounds);
        this.mapOverlay = new MapGoogleOverlay(bounds, this.mapUrl, this.map, this.mapManager);

        // Add initial rotation on ready
        $(this.mapOverlay).on('ready', function(){
            _this.setRotation(_this.rotation+'deg');
            _this.setAlpha(_this.alpha);
            _this.setScale(_this.scale);
        });

    };

    MapRefSetter.prototype.setRotation = function(value) {

        this.rotation = value;
        $(this.mapOverlay.imageContainer).css("transform", "rotate("+this.rotation+")");
        this.mapOverlay.draw(true);
        $("#rotation-value").val(value.replace('deg', ''));

    };

    MapRefSetter.prototype.setScale = function(value) {

        this.scale = value;
        $(this.mapOverlay.boundBox).css("transform", "scale("+this.scale+")");
        this.mapOverlay.draw(true);
        $("#scale-value").val(value);

    };

    MapRefSetter.prototype.setAlpha = function(value) {

        this.alpha = value;
        $(this.mapOverlay.imageContainer).css("opacity", value);
        $("#alpha-value").val(value);

    };

    MapRefSetter.prototype.updateScaleValue = function() {

        this.scaleFactor = $("#scale-value").val().toString();
        this.rotation = $("#rotation-value").val().toString()+'deg';
        this.alpha = $("#alpha-value").val().toString();

        this.setRotation(this.rotation);
        this.setScale(this.scaleFactor);
        this.setAlpha(this.alpha);

    };

    MapRefSetter.prototype.createUI = function() {

        var _this = this;

        if (_this.mapManager.enableIcons) {
            $('#show-save').css("display", "none");
            $('#saveMapReferencePts').css("display", "block");
        } else {
            $('#show-save').css("display", "block");
            $('#saveMapReferencePts').css("display", "none");
        }        
        
        $("#alpha-slider").slider({
            range: "max",
            min: 0,
            max: 1,
            value: _this.alpha,
            step:.1,
            slide: function(event, ui) {
                _this.setAlpha(ui.value);
            }
        });

        $("#rotation-slider").slider({
            range: "max",
            min: -360,
            max: 360,
            value: _this.rotation,
            step:.001,
            slide: function(event, ui) {
                var rotation = ui.value+'deg';
                _this.setRotation(rotation);
            }
        });

        $("#scale-slider").slider({
            range: "max",
            min:.1,
            max: 5,
            value: 1,
            step:.1,
            slide: function(event, ui) {
                _this.setScale(ui.value);
            }
        });

        $("#toggle-pan").unbind('click');
        $("#toggle-pan").on('click', function(){

            $(this).toggleClass('btn-success');
            $(this).toggleClass('btn-danger');
            var label = ($(this).hasClass('btn-danger')) ? 'Drag map off' : 'Drag map on ';
            $(this).html(label);
            _this.mapOverlay.toggleDraggableMap();

        });

        if ($('#toggle-pan').hasClass('btn-success')) {

            $('#toggle-pan').toggleClass('btn-success');
            $('#toggle-pan').toggleClass('btn-danger');
            $('#toggle-pan').html('Drag map off');

        }

        $('#map-type-select').on('change', function(){

            var val = $(this).val();
            switch(val){
                case 'road' : _this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                    break;
                case 'hybrid' : _this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                    break;
            }

        }).val(_this.mapType);

        function updateValues(){

            _this.scaleFactor = $("#scale-value").val().toString();
            _this.rotation = $("#rotation-value").val().toString()+'deg';
            _this.alpha = $("#alpha-value").val().toString();

            _this.setRotation(_this.rotation);
            _this.setScale(_this.scaleFactor);
            _this.setAlpha(_this.alpha);

            $("#scale-slider").slider('value', _this.scale);
            $("#rotation-slider").slider('value',$("#rotation-value").val().toString());
            $("#alpha-slider").slider('value', _this.alpha);

        }

        $(document).keypress(function(e) {
            if(e.which == 13) {
                updateValues();
            }
        });

    };

});