'use strict';

describe('viewmodel', function() {
    // load the module
    beforeEach(module('eWaterCycleApp.utils'));
    beforeEach(module('eWaterCycleApp.viewmodel'));

    it('should create an application controller', inject(function($rootScope, $controller){
        var scope = $rootScope.$new();
        var ctrl = $controller('ViewmodelController', { $scope: scope });
        expect(ctrl).toBeDefined();
    }));

    describe('directive', function() {
        var element = '<cesium-viewmodel-dropdown-directive></cesium-viewmodel-dropdown-directive>';
        var html;
        var scope;

        beforeEach(function() {
            inject(function($rootScope, $compile) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                scope.$digest();
            });
        });

        it('should create a dropdown header with 2-way data binding to vm.viewmodel', function() {
            expect(html.html()).toContain('a data-toggle="dropdown" href="#" class="ng-binding">Globe View');
        });

        it('should create a scope variable (vm.viewmodel) that is set to "Globe View"', function() {
            expect(scope.vm.viewmodel).toMatch('Globe View');
        });

        it('should create a dropdown list with 3 viewmodels', function() {
            expect(scope.vm.data.viewmodels.length).toBe(3);
        });
    });

    describe('watchers', function() {
        var scope;
        var ctrl;
        var msgbus;

        beforeEach(function() {
            inject(function($rootScope, $controller, Messagebus) {
                msgbus = Messagebus;
                scope = $rootScope.$new();
                ctrl = $controller('ViewmodelController', { $scope: scope });
            });
        });

        it('should publish a change to vm.viewmodel to the Messagebus as "cesiumViewmodelSelected" when changed', function() {
            spyOn(msgbus, 'publish');

            ctrl.selectViewmodel('Globe View');
            expect(msgbus.publish).toHaveBeenCalledWith('cesiumViewmodelSelected', 'Globe View');
            ctrl.selectViewmodel('Columbus View');
            expect(msgbus.publish).toHaveBeenCalledWith('cesiumViewmodelSelected', 'Columbus View');
            ctrl.selectViewmodel('Map View');
            expect(msgbus.publish).toHaveBeenCalledWith('cesiumViewmodelSelected', 'Map View');
        });
    });
});
