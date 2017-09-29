describe('L.DataLayer', function () {
    var path = '/map/99/datalayer/edit/62/';

    before(function () {
        this.server = sinon.fakeServer.create();
        this.server.respondWith('GET', '/datalayer/62/', JSON.stringify(RESPONSES.datalayer62_GET));
        this.map = initMap({storage_id: 99});
        this.datalayer = this.map.getDataLayerByStorageId(62);
        this.server.respond();
        enableEdit();
    });
    after(function () {
        this.server.restore();
        resetMap();
    });

    describe('#init()', function () {

        it('should be added in datalayers index', function () {
            assert.notEqual(this.map.datalayers_index.indexOf(this.datalayer), -1);
        });

    });

    describe('#edit()', function () {
        var editButton, form, input, forceButton;

        it('row in control should be active', function () {
            assert.notOk(qs('.leaflet-control-browse #browse_data_toggle_' + L.stamp(this.datalayer) + '.off'));
        });

        it('should have edit button', function () {
            editButton = qs('#browse_data_toggle_' + L.stamp(this.datalayer) + ' .layer-edit');
            assert.ok(editButton);
        });

        it('should have toggle visibility element', function () {
            assert.ok(qs('.leaflet-control-browse i.layer-toggle'));
        });

        it('should exist only one datalayer', function () {
            assert.equal(qsa('.leaflet-control-browse i.layer-toggle').length, 1);
        });

        it('should build a form on edit button click', function () {
            happen.click(editButton);
            form = qs('form.storage-form');
            input = qs('form.storage-form input[name="name"]');
            assert.ok(form);
            assert.ok(input);
        });

        it('should update name on input change', function () {
            var new_name = 'This is a new name';
            input.value = new_name;
            happen.once(input, {type: 'input'});
            assert.equal(this.datalayer.options.name, new_name);
        });

        it('should have made datalayer dirty', function () {
            assert.ok(this.datalayer.isDirty);
            assert.notEqual(this.map.dirty_datalayers.indexOf(this.datalayer), -1);
        });

        it('should have made Map dirty', function () {
            assert.ok(this.map.isDirty);
        });

        it('should call datalayer.save on save button click', function (done) {
            sinon.spy(this.datalayer, 'save');
            this.server.flush();
            this.server.respondWith('POST', '/map/99/update/settings/', JSON.stringify({id: 99}));
            this.server.respondWith('POST', '/map/99/datalayer/update/62/', JSON.stringify(defaultDatalayerData()));
            clickSave();
            this.server.respond();
            this.server.respond();
            assert(this.datalayer.save.calledOnce);
            this.datalayer.save.restore();
            done();
        });

        it('should show alert if server respond 412', function () {
            cleanAlert();
            this.server.flush();
            this.server.respondWith('POST', '/map/99/update/settings/', JSON.stringify({id: 99}));
            this.server.respondWith('POST', '/map/99/datalayer/update/62/', [412, {}, '']);
            happen.click(editButton);
            input = qs('form.storage-form input[name="name"]');
            input.value = 'a new name';
            happen.once(input, {type: 'input'});
            clickSave();
            this.server.respond();
            this.server.respond();
            assert(L.DomUtil.hasClass(this.map._container, 'storage-alert'));
            assert.notEqual(this.map.dirty_datalayers.indexOf(this.datalayer), -1);
            forceButton = qs('#storage-alert-container .storage-action');
            assert.ok(forceButton);
        });

        it('should save anyway on force save button click', function () {
            sinon.spy(this.map, 'continueSaving');
            happen.click(forceButton);
            this.server.flush();
            this.server.respond('POST', '/map/99/datalayer/update/62/', JSON.stringify(defaultDatalayerData()));
            assert.notOk(qs('#storage-alert-container .storage-action'));
            assert(this.map.continueSaving.calledOnce);
            this.map.continueSaving.restore();
            assert.equal(this.map.dirty_datalayers.indexOf(this.datalayer), -1);
        });

    });

    describe('#save() new', function () {
        var newLayerButton, form, input, newDatalayer, editButton, manageButton;

        it('should have a manage datalayers action', function () {
            enableEdit();
            manageButton = qs('.manage-datalayers');
            assert.ok(manageButton);
            happen.click(manageButton);
        });

        it('should have a new layer button', function () {
            newLayerButton = qs('#storage-ui-container .add-datalayer');
            assert.ok(newLayerButton);
        });

        it('should build a form on new layer button click', function () {
            happen.click(newLayerButton);
            form = qs('form.storage-form');
            input = qs('form.storage-form input[name="name"]');
            assert.ok(form);
            assert.ok(input);
        });

        it('should have an empty name', function () {
            assert.notOk(input.value);
        });

        it('should have created a new datalayer', function () {
            assert.equal(this.map.datalayers_index.length, 2);
            newDatalayer = this.map.datalayers_index[1];
        });

        it('should have made Map dirty', function () {
            assert.ok(this.map.isDirty);
        });

        it('should update name on input change', function () {
            var new_name = 'This is a new name';
            input.value = new_name;
            happen.once(input, {type: 'input'});
            assert.equal(newDatalayer.options.name, new_name);
        });

        it('should set storage_id on save callback', function () {
            assert.notOk(newDatalayer.storage_id);
            this.server.flush();
            this.server.respondWith('POST', '/map/99/update/settings/', JSON.stringify({id: 99}));
            this.server.respondWith('POST', '/map/99/datalayer/create/', JSON.stringify(defaultDatalayerData({id: 63})));
            clickSave();
            this.server.respond();
            this.server.respond();  // First respond will then trigger another Xhr request (continueSaving)
            assert.equal(newDatalayer.storage_id, 63);
        });

        it('should have unset map dirty', function () {
            assert.notOk(this.map.isDirty);
        });

        it('should have edit button', function () {
            editButton = qs('#browse_data_toggle_' + L.stamp(newDatalayer) + ' .layer-edit');
            assert.ok(editButton);
        });

        it('should call update if we edit again', function () {
            happen.click(editButton);
            assert.notOk(this.map.isDirty);
            input = qs('form.storage-form input[name="name"]');
            input.value = 'a new name again but we don\'t care which';
            happen.once(input, {type: 'input'});
            assert.ok(this.map.isDirty);
            var response = function (request) {
                return request.respond(200, {}, JSON.stringify(defaultDatalayerData({pk: 63})));
            };
            var spy = sinon.spy(response);
            this.server.flush();
            this.server.respondWith('POST', '/map/99/update/settings/', JSON.stringify({id: 99}));
            this.server.respondWith('POST', '/map/99/datalayer/update/63/', spy);
            clickSave();
            this.server.respond();
            this.server.respond();
            assert.ok(spy.calledOnce);
        });

    });

    describe('#iconClassChange()', function () {

        it('should change icon class', function () {
            happen.click(qs('[data-id="' + this.datalayer._leaflet_id +'"] .layer-edit'));
            changeSelectValue(qs('form#datalayer-advanced-properties select[name=iconClass]'), 'Circle');
            assert.notOk(qs('div.storage-div-icon'));
            assert.ok(qs('div.storage-circle-icon'));
            clickCancel();
        });

    });

    describe('#show/hide', function () {

        it('should hide features on hide', function () {
            assert.ok(qs('div.storage-div-icon'));
            assert.ok(qs('path[fill="none"]'));
            this.datalayer.hide();
            assert.notOk(qs('div.storage-div-icon'));
            assert.notOk(qs('path[fill="none"]'));
        });

        it('should show features on show', function () {
            assert.notOk(qs('div.storage-div-icon'));
            assert.notOk(qs('path[fill="none"]'));
            this.datalayer.show();
            assert.ok(qs('div.storage-div-icon'));
            assert.ok(qs('path[fill="none"]'));
        });

    });

    describe('#clone()', function () {

        it('should clone everything but the id and the name', function () {
            enableEdit();
            var clone = this.datalayer.clone();
            assert.notOk(clone.storage_id);
            assert.notEqual(clone.options.name, this.datalayer.name);
            assert.ok(clone.options.name);
            assert.equal(clone.options.color, this.datalayer.options.color);
            assert.equal(clone.options.stroke, this.datalayer.options.stroke);
            clone._delete();
            clickSave();
        });

    });

    describe('#restore()', function () {
        var oldConfirm,
            newConfirm = function () {
                return true;
            };

        before(function () {
            oldConfirm = window.confirm;
            window.confirm = newConfirm;
        });
        after(function () {
            window.confirm = oldConfirm;
        });

        it('should restore everything', function () {
            enableEdit();
            var geojson = L.Util.CopyJSON(RESPONSES.datalayer62_GET);
            geojson.features.push({
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-1.274658203125, 50.57634993749885]
                },
                'type': 'Feature',
                'id': 1807,
                'properties': {_storage_options: {}, name: 'new point from restore'}
            });
            geojson._storage.color = 'Chocolate';
            this.server.respondWith('GET', '/datalayer/62/olderversion.geojson', JSON.stringify(geojson));
            sinon.spy(window, 'confirm');
            this.datalayer.restore('olderversion.geojson');
            this.server.respond();
            assert(window.confirm.calledOnce);
            window.confirm.restore();
            assert.equal(this.datalayer.storage_id, 62);
            assert.ok(this.datalayer.isDirty);
            assert.equal(this.datalayer._index.length, 4);
            assert.ok(qs('path[fill="Chocolate"]'));
        });

        it('should revert anything on cancel click', function () {
            clickCancel();
            assert.equal(this.datalayer._index.length, 3);
            assert.notOk(qs('path[fill="Chocolate"]'));
        });

    });

    describe('#delete()', function () {
        var deleteLink, deletePath = '/map/99/datalayer/delete/62/';

        it('should have a delete link in update form', function () {
            enableEdit();
            happen.click(qs('#browse_data_toggle_' + L.stamp(this.datalayer) + ' .layer-edit'));
            deleteLink = qs('a.delete_datalayer_button');
            assert.ok(deleteLink);
        });

        it('should delete features on datalayer delete', function () {
            happen.click(deleteLink);
            assert.notOk(qs('div.icon_container'));
        });

        it('should have set map dirty', function () {
            assert.ok(this.map.isDirty);
        });

        it('should delete layer control row on delete', function () {
            assert.notOk(qs('.leaflet-control-browse #browse_data_toggle_' + L.stamp(this.datalayer)));
        });

        it('should be removed from map.datalayers_index', function () {
            assert.equal(this.map.datalayers_index.indexOf(this.datalayer), -1);
        });

        it('should be removed from map.datalayers', function () {
            assert.notOk(this.map.datalayers[L.stamp(this.datalayer)]);
        });

        it('should be visible again on edit cancel', function () {
            clickCancel();
            assert.ok(qs('div.icon_container'));
        });

    });

});
