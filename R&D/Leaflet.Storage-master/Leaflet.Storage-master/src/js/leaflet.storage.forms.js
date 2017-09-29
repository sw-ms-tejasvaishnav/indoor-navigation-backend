L.FormBuilder.Element.include({

    getParentNode: function () {
        if (this.options.wrapper) {
            return L.DomUtil.create(this.options.wrapper, this.options.wrapperClass || '', this.form);
        }
        var className = 'formbox';
        if (this.options.inheritable) {
            className += this.get(true) === undefined ? ' inheritable undefined' : ' inheritable ';
        }
        this.wrapper = L.DomUtil.create('div', className, this.form);
        this.header = L.DomUtil.create('div', 'header', this.wrapper);
        if (this.options.inheritable) {
            var undefine = L.DomUtil.add('a', 'button undefine', this.header, L._('clear'));
            var define = L.DomUtil.add('a', 'button define', this.header, L._('define'));
            L.DomEvent.on(define, 'click', function (e) {
                L.DomEvent.stop(e);
                this.fetch();
                this.fire('define');
                L.DomUtil.removeClass(this.wrapper, 'undefined');
            }, this);
            L.DomEvent.on(undefine, 'click', function (e) {
                L.DomEvent.stop(e);
                L.DomUtil.addClass(this.wrapper, 'undefined');
                this.clear();
                this.sync();
            }, this);
        }
        this.quickContainer = L.DomUtil.create('span', 'quick-actions show-on-defined', this.header);
        this.extendedContainer = L.DomUtil.create('div', 'show-on-defined', this.wrapper);
        return this.extendedContainer;
    },

    getLabelParent: function () {
        return this.header;
    },

    clear: function () {
        this.input.value = '';
    },

    get: function (own) {
        if (!this.options.inheritable || own) return this.builder.getter(this.field);
        var path = this.field.split('.'),
            key = path[path.length - 1];
        return this.obj.getOption(key);
    },

    buildLabel: function () {
        if (this.options.label) {
            this.label = L.DomUtil.create('label', '', this.getLabelParent());
            this.label.innerHTML = this.label.title = this.options.label;
            if (this.options.helpEntries) this.builder.map.help.button(this.label, this.options.helpEntries);
            else if (this.options.helpText) {
                var info = L.DomUtil.create('i', 'info', this.label);
                L.DomEvent.on(info, 'mouseover', function () {
                    this.builder.map.ui.tooltip({anchor: info, content: this.options.helpText, position: 'top'});
                }, this);
            }
        }
    }

});

L.FormBuilder.Select.include({

    clear: function () {
        this.select.value = '';
    }

});

L.FormBuilder.CheckBox.include({

    value: function () {
        return L.DomUtil.hasClass(this.wrapper, 'undefined') ? undefined : this.input.checked;
    },

    clear: function () {
        this.fetch();
    }

});

L.FormBuilder.ColorPicker = L.FormBuilder.Input.extend({

    colors: [
        'Black', 'Navy', 'DarkBlue', 'MediumBlue', 'Blue', 'DarkGreen',
        'Green', 'Teal', 'DarkCyan', 'DeepSkyBlue', 'DarkTurquoise',
        'MediumSpringGreen', 'Lime', 'SpringGreen', 'Aqua', 'Cyan',
        'MidnightBlue', 'DodgerBlue', 'LightSeaGreen', 'ForestGreen',
        'SeaGreen', 'DarkSlateGray', 'DarkSlateGrey', 'LimeGreen',
        'MediumSeaGreen', 'Turquoise', 'RoyalBlue', 'SteelBlue',
        'DarkSlateBlue', 'MediumTurquoise', 'Indigo', 'DarkOliveGreen',
        'CadetBlue', 'CornflowerBlue', 'MediumAquaMarine', 'DimGray',
        'DimGrey', 'SlateBlue', 'OliveDrab', 'SlateGray', 'SlateGrey',
        'LightSlateGray', 'LightSlateGrey', 'MediumSlateBlue', 'LawnGreen',
        'Chartreuse', 'Aquamarine', 'Maroon', 'Purple', 'Olive', 'Gray',
        'Grey', 'SkyBlue', 'LightSkyBlue', 'BlueViolet', 'DarkRed',
        'DarkMagenta', 'SaddleBrown', 'DarkSeaGreen', 'LightGreen',
        'MediumPurple', 'DarkViolet', 'PaleGreen', 'DarkOrchid',
        'YellowGreen', 'Sienna', 'Brown', 'DarkGray', 'DarkGrey',
        'LightBlue', 'GreenYellow', 'PaleTurquoise', 'LightSteelBlue',
        'PowderBlue', 'FireBrick', 'DarkGoldenRod', 'MediumOrchid',
        'RosyBrown', 'DarkKhaki', 'Silver', 'MediumVioletRed', 'IndianRed',
        'Peru', 'Chocolate', 'Tan', 'LightGray', 'LightGrey', 'Thistle',
        'Orchid', 'GoldenRod', 'PaleVioletRed', 'Crimson', 'Gainsboro',
        'Plum', 'BurlyWood', 'LightCyan', 'Lavender', 'DarkSalmon',
        'Violet', 'PaleGoldenRod', 'LightCoral', 'Khaki', 'AliceBlue',
        'HoneyDew', 'Azure', 'SandyBrown', 'Wheat', 'Beige', 'WhiteSmoke',
        'MintCream', 'GhostWhite', 'Salmon', 'AntiqueWhite', 'Linen',
        'LightGoldenRodYellow', 'OldLace', 'Red', 'Fuchsia', 'Magenta',
        'DeepPink', 'OrangeRed', 'Tomato', 'HotPink', 'Coral', 'DarkOrange',
        'LightSalmon', 'Orange', 'LightPink', 'Pink', 'Gold', 'PeachPuff',
        'NavajoWhite', 'Moccasin', 'Bisque', 'MistyRose', 'BlanchedAlmond',
        'PapayaWhip', 'LavenderBlush', 'SeaShell', 'Cornsilk',
        'LemonChiffon', 'FloralWhite', 'Snow', 'Yellow', 'LightYellow',
        'Ivory', 'White'
    ],

    getParentNode: function () {
        L.FormBuilder.CheckBox.prototype.getParentNode.call(this);
        return this.quickContainer;
    },

    build: function () {
        L.FormBuilder.Input.prototype.build.call(this);
        this.input.placeholder = this.options.placeholder || L._('Inherit');
        this.container = L.DomUtil.create('div', 'storage-color-picker', this.extendedContainer);
        this.container.style.display = 'none';
        for (var idx in this.colors) {
            this.addColor(this.colors[idx]);
        }
        this.spreadColor();
        this.input.autocomplete = 'off';
        L.DomEvent.on(this.input, 'focus', this.onFocus, this);
        L.DomEvent.on(this.input, 'blur', this.onBlur, this);
        L.DomEvent.on(this.input, 'change', this.sync, this);
        this.on('define', this.onFocus);
    },

    onFocus: function () {
        this.container.style.display = 'block';
        this.spreadColor();
    },

    onBlur: function () {
        var self = this,
            closePicker = function () {
                self.container.style.display = 'none';
            };
        // We must leave time for the click to be listened.
        window.setTimeout(closePicker, 100);
    },

    sync: function () {
        this.spreadColor();
        L.FormBuilder.Input.prototype.sync.call(this);
    },

    spreadColor: function () {
        if (this.input.value) this.input.style.backgroundColor = this.input.value;
        else this.input.style.backgroundColor = 'inherit';
    },

    addColor: function (colorName) {
        var span = L.DomUtil.create('span', '', this.container);
        span.style.backgroundColor = span.title = colorName;
        var updateColorInput = function () {
            this.input.value = colorName;
            this.sync();
            this.container.style.display = 'none';
        };
        L.DomEvent.on(span, 'mousedown', updateColorInput, this);
    }

});

L.FormBuilder.TextColorPicker = L.FormBuilder.ColorPicker.extend({
    colors: [
        'Black', 'DarkSlateGrey', 'DimGrey', 'SlateGrey', 'LightSlateGrey',
        'Grey', 'DarkGrey', 'LightGrey', 'White'
    ]

});

L.FormBuilder.IconClassSwitcher = L.FormBuilder.Select.extend({

    selectOptions: [
        ['Default', L._('Default')],
        ['Circle', L._('Circle')],
        ['Drop', L._('Drop')],
        ['Ball', L._('Ball')]
    ]

});

L.FormBuilder.PopupTemplate = L.FormBuilder.Select.extend({

    selectOptions: [
        ['Default', L._('Name and description')],
        ['Large', L._('Name and description (large)')],
        ['Table', L._('Table')],
        ['GeoRSSImage', L._('GeoRSS (title + image)')],
        ['GeoRSSLink', L._('GeoRSS (only link)')],
        ['SimplePanel', L._('Side panel')]
    ],

    toJS: function () {
        var value = L.FormBuilder.Select.prototype.toJS.apply(this);
        if (value === 'table') { value = 'Table'; }
        return value;
    }

});

L.FormBuilder.LayerTypeChooser = L.FormBuilder.Select.extend({

    selectOptions: [
        ['Default', L._('Default')],
        ['Cluster', L._('Clustered')],
        ['Heat', L._('Heatmap')]
    ]

});

L.FormBuilder.SlideshowDelay = L.FormBuilder.IntSelect.extend({

    getOptions: function () {
        var options = [];
        for (var i = 1; i < 30; i++) {
            options.push([i * 1000, L._('{delay} seconds', {delay: i})]);
        }
        return options;
    }

});

L.FormBuilder.DataLayerSwitcher = L.FormBuilder.Select.extend({

    getOptions: function () {
        var options = [];
        this.builder.map.eachDataLayerReverse(function (datalayer) {
            if(datalayer.isLoaded() && !datalayer.isRemoteLayer() && datalayer.canBrowse()) {
                options.push([L.stamp(datalayer), datalayer.getName()]);
            }
        });
        return options;
    },

    toHTML: function () {
        return L.stamp(this.obj.datalayer);
    },

    toJS: function () {
        return this.builder.map.datalayers[this.value()];
    },

    set: function () {
        this.builder.map.lastUsedDataLayer = this.toJS();
        this.obj.changeDataLayer(this.toJS());
    }

});

L.FormBuilder.onLoadPanel = L.FormBuilder.Select.extend({

    selectOptions: [
        ['none', L._('None')],
        ['caption', L._('Caption')],
        ['databrowser', L._('Data browser')]
    ]

});

L.FormBuilder.DataFormat = L.FormBuilder.Select.extend({

    selectOptions: [
        [undefined, L._('Choose the data format')],
        ['geojson', 'geojson'],
        ['osm', 'osm'],
        ['csv', 'csv'],
        ['gpx', 'gpx'],
        ['kml', 'kml'],
        ['georss', 'georss']
    ]

});

L.FormBuilder.LabelDirection = L.FormBuilder.Select.extend({

    selectOptions: [
        ['auto', L._('Automatic')],
        ['left', L._('On the left')],
        ['right', L._('On the right')],
        ['top', L._('On the top')],
        ['bottom', L._('On the bottom')]
    ]

});

L.FormBuilder.LicenceChooser = L.FormBuilder.Select.extend({

    getOptions: function () {
        var licences = [],
            licencesList = this.builder.obj.options.licences,
            licence;
        for (var i in licencesList) {
            licence = licencesList[i];
            licences.push([i, licence.name]);
        }
        return licences;
    },

    toHTML: function () {
        return this.get().name;
    },

    toJS: function () {
        return this.builder.obj.options.licences[this.value()];
    }

});

L.FormBuilder.NullableBoolean = L.FormBuilder.Select.extend({
    selectOptions: [
        [undefined, L._('inherit')],
        [true, L._('yes')],
        [false, L._('no')]
    ],

    toJS: function () {
        var value = this.value();
        switch (value) {
            case 'true':
            case true:
                value = true;
                break;
            case 'false':
            case false:
                value = false;
                break;
            default:
                value = undefined;
        }
        return value;
    }

});

L.FormBuilder.IconUrl = L.FormBuilder.Input.extend({

    type: function () {
        return 'hidden';
    },

    build: function () {
        L.FormBuilder.Input.prototype.build.call(this);
        this.parentContainer = L.DomUtil.create('div', 'storage-form-iconfield', this.parentNode);
        this.buttonsContainer = L.DomUtil.create('div', '', this.parentContainer);
        this.pictogramsContainer = L.DomUtil.create('div', 'storage-pictogram-list', this.parentContainer);
        this.input.type = 'hidden';
        this.input.placeholder = L._('Url');
        this.udpatePreview();
        this.on('define', this.fetchIconList);
    },

    udpatePreview: function () {
        if (this.value() && this.value().indexOf('{') === -1) { // Do not try to render URL with variables
            var img = L.DomUtil.create('img', '', L.DomUtil.create('div', 'storage-icon-choice', this.buttonsContainer));
            img.src = this.value();
            L.DomEvent.on(img, 'click', this.fetchIconList, this);
        }
        this.button = L.DomUtil.create('a', '', this.buttonsContainer);
        this.button.innerHTML = this.value() ? L._('Change symbol') : L._('Add symbol');
        this.button.href = '#';
        L.DomEvent
            .on(this.button, 'click', L.DomEvent.stop)
            .on(this.button, 'click', this.fetchIconList, this);
    },

    addIconPreview: function (pictogram) {
        var baseClass = 'storage-icon-choice',
            value = pictogram.src,
            className = value === this.value() ? baseClass + ' selected' : baseClass,
            container = L.DomUtil.create('div', className, this.pictogramsContainer),
            img = L.DomUtil.create('img', '', container);
        img.src = value;
        if (pictogram.name && pictogram.attribution) {
            img.title = pictogram.name + ' — © ' + pictogram.attribution;
        }
        L.DomEvent.on(container, 'click', function (e) {
            this.input.value = value;
            this.sync();
            this.unselectAll(this.pictogramsContainer);
            L.DomUtil.addClass(container, 'selected');
            this.pictogramsContainer.innerHTML = '';
            this.udpatePreview();
        }, this);
    },

    clear: function () {
        this.input.value = '';
        this.unselectAll(this.pictogramsContainer);
        this.sync();
        this.pictogramsContainer.innerHTML = '';
        this.udpatePreview();
    },

    buildIconList: function (data) {
        this.pictogramsContainer.innerHTML = '';
        this.buttonsContainer.innerHTML = '';
        for (var idx in data.pictogram_list) {
            this.addIconPreview(data.pictogram_list[idx]);
        }
        var cancelButton = L.DomUtil.create('a', '', this.pictogramsContainer);
        cancelButton.innerHTML = L._('Cancel');
        cancelButton.href = '#';
        cancelButton.style.display = 'block';
        cancelButton.style.clear = 'both';
        L.DomEvent
            .on(cancelButton, 'click', L.DomEvent.stop)
            .on(cancelButton, 'click', function (e) {
                this.pictogramsContainer.innerHTML = '';
                this.udpatePreview();
            }, this);
        var customButton = L.DomUtil.create('a', '', this.pictogramsContainer);
        customButton.innerHTML = L._('Set URL');
        customButton.href = '#';
        customButton.style.display = 'block';
        customButton.style.clear = 'both';
        this.builder.map.help.button(customButton, 'formatIconURL');
        L.DomEvent
            .on(customButton, 'click', L.DomEvent.stop)
            .on(customButton, 'click', function (e) {
                this.input.type = 'url';
                this.pictogramsContainer.innerHTML = '';
            }, this);
    },

    fetchIconList: function (e) {
        this.builder.map.get(this.builder.map.options.urls.pictogram_list_json, {
            callback: this.buildIconList,
            context: this
        });
    },

    unselectAll: function (container) {
        var els = container.querySelectorAll('div.selected');
        for (var el in els) {
            if (els.hasOwnProperty(el)) L.DomUtil.removeClass(els[el], 'selected');
        }
    }

});

L.FormBuilder.Url = L.FormBuilder.Input.extend({

    type: function () {
        return 'url';
    }

});

L.FormBuilder.Switch = L.FormBuilder.CheckBox.extend({

    getParentNode: function () {
        L.FormBuilder.CheckBox.prototype.getParentNode.call(this);
        if (this.options.inheritable) return this.quickContainer;
        return this.extendedContainer;
    },

    build: function () {
        L.FormBuilder.CheckBox.prototype.build.apply(this);
        if (this.options.inheritable) this.label = L.DomUtil.create('label', '', this.input.parentNode);
        else this.input.parentNode.appendChild(this.label);
        L.DomUtil.addClass(this.input.parentNode, 'with-switch');
        var id = (this.builder.options.id || Date.now()) + '.' + this.name;
        this.label.setAttribute('for', id);
        L.DomUtil.addClass(this.input, 'switch');
        this.input.id = id;
    }

});

L.FormBuilder.MultiChoice = L.FormBuilder.Element.extend({

    default: 'null',
    className: 'storage-multiplechoice',

    clear: function () {
        var checked = this.container.querySelector('input[type="radio"]:checked');
        if (checked) checked.checked = false;
    },

    fetch: function () {
        var value = this.backup = this.toHTML();
        if (value === null || value === undefined) value = this.default;
        this.container.querySelector('input[type="radio"][value="' + value + '"]').checked = true;
    },

    value: function () {
        var checked = this.container.querySelector('input[type="radio"]:checked');
        if (checked) return checked.value;
    },

    getChoices: function () {
        return this.options.choices || this.choices;
    },

    build: function () {
        var choices = this.getChoices();
        this.container = L.DomUtil.create('div', this.className + ' by' + choices.length, this.parentNode);
        for (var i = 0; i < choices.length; i++) {
            this.addChoice(choices[i][0], choices[i][1], i);
        }
        this.fetch();
    },

    addChoice: function (value, label, counter) {
        var input = L.DomUtil.create('input', '', this.container);
        label = L.DomUtil.add('label', '', this.container, label);
        input.type = 'radio';
        input.name = this.name;
        input.value = value;
        var id = Date.now() + '.' + this.name + '.' + counter;
        label.setAttribute('for', id);
        input.id = id;
        L.DomEvent.on(input, 'change', this.sync, this);
    }

});

L.FormBuilder.ControlChoice = L.FormBuilder.MultiChoice.extend({

    default: 'null',

    choices: [
        [true, L._('always')],
        [false, L._('never')],
        ['null', L._('hidden')]
    ],

    toJS: function () {
        var value = this.value();
        switch (value) {
            case 'true':
            case true:
                value = true;
                break;
            case 'false':
            case false:
                value = false;
                break;
            default:
                value = null;
        }
        return value;
    }

});

L.FormBuilder.DataLayersControl = L.FormBuilder.ControlChoice.extend({

    choices: [
        [true, L._('collapsed')],
        ['expanded', L._('expanded')],
        [false, L._('never')],
        ['null', L._('hidden')]
    ],

    toJS: function () {
        var value = this.value();
        if (value !== 'expanded') value = L.FormBuilder.ControlChoice.prototype.toJS.call(this);
        return value;
    }

});

L.FormBuilder.OutlinkTarget = L.FormBuilder.MultiChoice.extend({

    default: 'blank',

    choices: [
        ['blank', L._('new window')],
        ['self', L._('iframe')],
        ['parent', L._('parent window')]
    ]

});

L.FormBuilder.Range = L.FormBuilder.Input.extend({

    type: function () {
        return 'range';
    },

    value: function () {
        return L.DomUtil.hasClass(this.wrapper, 'undefined') ? undefined : this.input.value;
    }

});

L.Storage.FormBuilder = L.FormBuilder.extend({

    options: {
        className: 'storage-form'
    },

    defaultOptions: {
        name: {label: L._('name')},
        description: {label: L._('description'), handler: 'Textarea', helpEntries: 'textFormatting'},
        color: {handler: 'ColorPicker', label: L._('color'), helpEntries: 'colorValue', inheritable: true},
        opacity: {handler: 'Range', min: 0.1, max: 1, step: 0.1, label: L._('opacity'), inheritable: true},
        stroke: {handler: 'Switch', label: L._('stroke'), helpEntries: 'stroke', inheritable: true},
        weight: {handler: 'Range', min: 1, max: 20, step: 1, label: L._('weight'), inheritable: true},
        fill: {handler: 'Switch', label: L._('fill'), helpEntries: 'fill', inheritable: true},
        fillColor: {handler: 'ColorPicker', label: L._('fill color'), helpEntries: 'fillColor', inheritable: true},
        fillOpacity: {handler: 'Range', min: 0.1, max: 1, step: 0.1, label: L._('fill opacity'), inheritable: true},
        smoothFactor: {handler: 'Range', min: 0, max: 10, step: 0.5, label: L._('Simplify'), helpEntries: 'smoothFactor', inheritable: true},
        dashArray: {label: L._('dash array'), helpEntries: 'dashArray', inheritable: true},
        iconClass: {handler: 'IconClassSwitcher', label: L._('Icon shape'), inheritable: true},
        iconUrl: {handler: 'IconUrl', label: L._('Icon symbol'), inheritable: true},
        popupTemplate: {handler: 'PopupTemplate', label: L._('Popup style'), inheritable: true},
        popupContentTemplate: {label: L._('Popup content template'), handler: 'Textarea', helpEntries: ['dynamicProperties', 'textFormatting'], placeholder: '# {name}', inheritable: true},
        datalayer: {handler: 'DataLayerSwitcher', label: L._('Choose the layer of the feature')},
        moreControl: {handler: 'Switch', label: L._('Do you want to display the «more» control?')},
        scrollWheelZoom: {handler: 'Switch', label: L._('Allow scroll wheel zoom?')},
        miniMap: {handler: 'Switch', label: L._('Do you want to display a minimap?')},
        scaleControl: {handler: 'Switch', label: L._('Do you want to display the scale control?')},
        onLoadPanel: {handler: 'onLoadPanel', label: L._('Do you want to display a panel on load?')},
        displayPopupFooter: {handler: 'Switch', label: L._('Do you want to display popup footer?')},
        captionBar: {handler: 'Switch', label: L._('Do you want to display a caption bar?')},
        zoomTo: {handler: 'IntInput', placeholder: L._('Inherit'), helpEntries: 'zoomTo', label: L._('Default zoom level'), inheritable: true},
        showLabel: {handler: 'Switch', label: L._('Display label'), inheritable: true},
        labelHover: {handler: 'Switch', label: L._('Only display label on mouse hover'), inheritable: true},
        labelDirection: {handler: 'LabelDirection', label: L._('Label direction'), inheritable: true},
        labelInteractive: {handler: 'Switch', label: L._('Labels are clickable'), inheritable: true},
        labelKey: {helpEntries: 'labelKey', placeholder: L._('Default: name'), label: L._('Label key'), inheritable: true},
        zoomControl: {handler: 'ControlChoice', label: L._('Display the zoom control')},
        searchControl: {handler: 'ControlChoice', label: L._('Display the search control')},
        fullscreenControl: {handler: 'ControlChoice', label: L._('Display the fullscreen control')},
        embedControl: {handler: 'ControlChoice', label: L._('Display the embed control')},
        locateControl: {handler: 'ControlChoice', label: L._('Display the locate control')},
        measureControl: {handler: 'ControlChoice', label: L._('Display the measure control')},
        tilelayersControl: {handler: 'ControlChoice', label: L._('Display the tile layers control')},
        editinosmControl: {handler: 'ControlChoice', label: L._('Display the control to open OpenStreetMap editor')},
        datalayersControl: {handler: 'DataLayersControl', label: L._('Display the data layers control')},
    },

    initialize: function (obj, fields, options) {
        this.map = obj.getMap();
        L.FormBuilder.prototype.initialize.call(this, obj, fields, options);
        this.on('finish', this.finish);
    },

    setter: function (field, value) {
        L.FormBuilder.prototype.setter.call(this, field, value);
        this.obj.isDirty = true;
    },

    finish: function () {
        this.map.ui.closePanel();
    }

});
