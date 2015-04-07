'use strict';

describe('outlines', function() {
    // load the module
    beforeEach(module('eWaterCycleApp.utils'));
    beforeEach(module('eWaterCycleApp.biglegend'));

    beforeEach(module('mockedPalettes'));

    it('should create an application controller', inject(function($rootScope, $controller){
        var scope = $rootScope.$new();
        $controller('BigLegendController', { $scope: scope });
    }));

    describe('directive', function() {
        var element = '<big-legend-directive></big-legend-directive>';
        var html;
        var scope;

        beforeEach(function() {
            inject(function($rootScope, $compile) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                scope.$digest();
            });
        });

        it('should create a checkbox with 2-way data binding to blc.legendMax', function() {
            expect(html.html()).toContain('input ng-model="blc.legendMax"');
        });

        it('should create a checkbox with 2-way data binding to blc.legendMin', function() {
            expect(html.html()).toContain('input ng-model="blc.legendMin"');
        });

        it('should create 4 text fields with intermediate values', function() {
            expect(scope.blc.legendText.length).toBe(4);

            expect(scope.blc.legendText[0]).toMatch('40');
            expect(scope.blc.legendText[1]).toMatch('30');
            expect(scope.blc.legendText[2]).toMatch('20');
            expect(scope.blc.legendText[3]).toMatch('10');
        });

        it('should create a canvas with the id "bigLegendCanvas"', function() {
            expect(html.html()).toContain('canvas id="bigLegendCanvas"');
        });

        it('should create a text field with 2-way data binding to blc.selectedUnits', function() {
            expect(scope.blc.selectedUnits).toMatch('cm above average');
            expect(html.html()).toContain('cm above average');
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
                ctrl = $controller('BigLegendController', { $scope: scope });
                scope.$digest();
            });
        });

        it('should NOT publish to the Messagebus when initialized', function() {
            spyOn(msgbus, 'publish');
            expect(msgbus.publish).not.toHaveBeenCalled();
        });

        it('should publish a change to blc.legendMin to the Messagebus as "legendMinChange" when changed', function() {
            spyOn(msgbus, 'publish');
            scope.$apply('blc.legendMin = 10');
            expect(msgbus.publish).toHaveBeenCalledWith('legendMinChange', 10);
            scope.$apply('blc.legendMin = 20');
            expect(msgbus.publish).toHaveBeenCalledWith('legendMinChange', 20);
        });

        it('should publish a change to blc.legendMin to the Messagebus as "legendMaxChange" when changed', function() {
            spyOn(msgbus, 'publish');
            scope.$apply('blc.legendMax = 10');
            expect(msgbus.publish).toHaveBeenCalledWith('legendMaxChange', 10);
            scope.$apply('blc.legendMax = 20');
            expect(msgbus.publish).toHaveBeenCalledWith('legendMaxChange', 20);
        });

        it('should listen to the messagebus for changes on "legendMinChange" and update intermediate values', function() {
            scope.$apply(msgbus.publish('legendMinChange', 10));
            expect(ctrl.legendMin).toBe(10);
            expect(ctrl.legendText[0]).toBe(42);
            expect(ctrl.legendText[1]).toBe(34);
            expect(ctrl.legendText[2]).toBe(26);
            expect(ctrl.legendText[3]).toBe(18);

            scope.$apply(msgbus.publish('legendMinChange', 0));
            expect(ctrl.legendMin).toBe(0);
            expect(ctrl.legendText[0]).toBe(40);
            expect(ctrl.legendText[1]).toBe(30);
            expect(ctrl.legendText[2]).toBe(20);
            expect(ctrl.legendText[3]).toBe(10);
        });

        it('should listen to the messagebus for changes on "legendMaxChange" and update intermediate values', function() {
            scope.$apply(msgbus.publish('legendMaxChange', 10));
            expect(ctrl.legendMax).toBe(10);
            expect(ctrl.legendText[0]).toBe(8);
            expect(ctrl.legendText[1]).toBe(6);
            expect(ctrl.legendText[2]).toBe(4);
            expect(ctrl.legendText[3]).toBe(2);

            scope.$apply(msgbus.publish('legendMaxChange', 50));
            expect(ctrl.legendMax).toBe(50);
            expect(ctrl.legendText[0]).toBe(40);
            expect(ctrl.legendText[1]).toBe(30);
            expect(ctrl.legendText[2]).toBe(20);
            expect(ctrl.legendText[3]).toBe(10);
        });

        it('should listen to the messagebus for changes on "logarithmicChange" and update intermediate values', function() {
            ctrl.legendMax = 100000;
            ctrl.legendMin = 1;

            scope.$apply(msgbus.publish('logarithmicChange', true));
            expect(ctrl.legendText[0]).toBe(10000);
            expect(ctrl.legendText[1]).toBe(1000);
            expect(ctrl.legendText[2]).toBe(100);
            expect(ctrl.legendText[3]).toBe(10);

            scope.$apply(msgbus.publish('logarithmicChange', false));
            expect(ctrl.legendText[0]).toBe(80000.2);
            expect(ctrl.legendText[1]).toBe(60000.4);
            expect(ctrl.legendText[2]).toBe(40000.6);
            expect(ctrl.legendText[3]).toBe(20000.8);
        });

        it('should listen to the messagebus for changes on "ncwmsPaletteSelected" and update the legend image', function() {
            spyOn(ctrl, 'setOnload');
            scope.$apply(msgbus.publish('ncwmsPaletteSelected', {graphic:''}));
            expect(ctrl.setOnload).toHaveBeenCalledWith('');

            scope.$apply(msgbus.publish('ncwmsPaletteSelected',  {graphic:'doodle'}));
            expect(ctrl.setOnload).toHaveBeenCalledWith('doodle');
        });

    });
});
