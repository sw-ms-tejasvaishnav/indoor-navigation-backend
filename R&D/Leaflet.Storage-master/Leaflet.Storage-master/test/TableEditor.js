describe('L.TableEditor', function () {
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
        clickCancel();
        this.server.restore();
        resetMap();
    });

    describe('#open()', function () {
        var button;

        it('should exist table click on edit mode', function () {
            button = qs('#browse_data_toggle_' + L.stamp(this.datalayer) + ' .layer-table-edit');
            expect(button).to.be.ok;
        });

        it('should open table button click', function () {
            happen.click(button);
            expect(qs('#storage-ui-container div.table')).to.be.ok;
            expect(qsa('#storage-ui-container div.table form').length).to.eql(3);  // One per feature.
            expect(qsa('#storage-ui-container div.table input').length).to.eql(3);  // One per feature and per property.
        });

    });
    describe('#properties()', function () {
        var feature;

        before(function () {
            var firstIndex = this.datalayer._index[0];
            feature = this.datalayer._layers[firstIndex];
        });

        it('should create new property column', function () {
            var newPrompt = function () {
                return 'newprop';
            };
            var oldPrompt = window.prompt;
            window.prompt = newPrompt;
            var button = qs('#storage-ui-container .add-property');
            expect(button).to.be.ok;
            happen.click(button);
            expect(qsa('#storage-ui-container div.table input').length).to.eql(6);  // One per feature and per property.
            window.prompt = oldPrompt;
        });

        it('should populate feature property on fill', function () {
            var input = qs('form#storage-feature-properties_' + L.stamp(feature) + ' input[name=newprop]');
            changeInputValue(input, 'the value');
            expect(feature.properties.newprop).to.eql('the value');
        });

        it('should update property name on update click', function () {
            var newPrompt = function () {
                return 'newname';
            };
            var oldPrompt = window.prompt;
            window.prompt = newPrompt;
            var button = qs('#storage-ui-container div.thead div.tcell:last-of-type .storage-edit');
            expect(button).to.be.ok;
            happen.click(button);
            expect(qsa('#storage-ui-container div.table input').length).to.eql(6);
            expect(feature.properties.newprop).to.be.undefined;
            expect(feature.properties.newname).to.eql('the value');
            window.prompt = oldPrompt;
        });

        it('should update property on delete click', function () {
            var oldConfirm,
                newConfirm = function () {
                    return true;
                };
            oldConfirm = window.confirm;
            window.confirm = newConfirm;
            var button = qs('#storage-ui-container div.thead div.tcell:last-of-type .storage-delete');
            expect(button).to.be.ok;
            happen.click(button);
            FEATURE = feature;
            expect(qsa('#storage-ui-container div.table input').length).to.eql(3);
            expect(feature.properties.newname).to.be.undefined;
            window.confirm = oldConfirm;
        });

    });

});
