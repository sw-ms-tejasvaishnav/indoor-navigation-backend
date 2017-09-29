describe('L.Storage.Controls', function(){

    before(function () {
        this.server = sinon.fakeServer.create();
        this.server.respondWith('/datalayer/62/', JSON.stringify(RESPONSES.datalayer62_GET));
        this.map = initMap({storage_id: 99});
        this.server.respond();
        this.datalayer = this.map.getDataLayerByStorageId(62);
    });
    after(function () {
        this.server.restore();
        resetMap();
    });

    describe('#databrowser()', function(){

        it('should be opened at datalayer button click', function() {
            var button = qs('.storage-browse-actions .storage-browse-link');
            assert.ok(button);
            happen.click(button);
            assert.ok(qs('#storage-ui-container .storage-browse-data'));
        });

        it('should contain datalayer section', function() {
            assert.ok(qs('#browse_data_datalayer_62'));
        });

        it('should contain datalayer\'s features list', function() {
            assert.equal(qsa('#browse_data_datalayer_62 ul li').length, 3);
        });

        it('should redraw datalayer\'s features list at feature delete', function() {
            var oldConfirm = window.confirm;
            window.confirm = function () {return true;};
            enableEdit();
            happen.once(qs('path[fill="DarkBlue"]'), {type: 'contextmenu'});
            happen.click(qs('.leaflet-contextmenu .storage-delete'));
            assert.equal(qsa('#browse_data_datalayer_62 ul li').length, 2);
            window.confirm = oldConfirm;
        });

        it('should redraw datalayer\'s features list on edit cancel', function() {
            clickCancel();
            happen.click(qs('.storage-browse-actions .storage-browse-link'));
            assert.equal(qsa('#browse_data_datalayer_62 ul li').length, 3);
        });

    });

});
